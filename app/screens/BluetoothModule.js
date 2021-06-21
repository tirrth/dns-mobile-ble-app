import React, {useContext, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Easing, TextInput} from 'react-native';
import {Image, Pressable, Animated} from 'react-native';
import {StyleSheet} from 'react-native';
import {View, Text} from 'react-native';
import Slider from '@react-native-community/slider';
import {ImageBackground} from 'react-native';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_ROUTES_PATH,
  GET_APP_INTERFACE_STATUSES,
  POST_APP_INTERFACE_STATUSES,
  POST_APP_INTERFACE_LIGHT_STATUS,
  POST_APP_INTERFACE_COLOR,
  RESET_APP_INTERFACE_STATUS,
} from '@env';
import {AuthContext} from '../components/navigation/AuthProvider';
import NoSign from '../assets/ble/no_sign.svg';
import {ScrollView, TouchableOpacity} from 'react-native-gesture-handler';
import {Switch} from 'react-native-paper';
import {CheckBox} from 'react-native-elements';
import {Picker} from '@react-native-picker/picker';
import {connect} from 'react-redux';
import useBackHandler from '../components/BackHandler';

const BluetoothModule = props => {
  const _refDayLightSlider = useRef(null);
  const _licensePlateRef = useRef([]);
  const _refreshIntervalTimeout = useRef(null);
  const {token} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isTimeoutError, setIsTimeoutError] = useState(false);
  const [isLincensePlateSelected, setIsLincensePlateSelected] = useState(true);
  const [licensePlate1stSegment, setLicensePlate1stSegment] = useState('');
  const [licensePlate2ndSegment, setLicensePlate2ndSegment] = useState('');
  const [licensePlate3rdSegment, setLicensePlate3rdSegment] = useState('');
  const [vin, setVin] = useState('');
  const [colorsInfo, setColorsInfo] = useState(require('../libs/colors.json'));
  const [isRimBright, setIsRimBright] = useState(false);
  const dayLightMinVal = 5;
  const dayLightMaxVal = 100;
  const [dayLight, setDayLight] = useState(dayLightMinVal);
  const [scanTime, setScanTime] = useState(0);
  const [isScanEnabled, setIsScanEnabled] = useState(false);
  const [isScanStarted, setIsScanStarted] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLightsOn, setIsLightsOn] = useState(false);
  const [isAdminPanelEnabled, setIsAdminPanelEnabled] = useState(false);
  const rimBrightRotate = useRef(new Animated.Value(0)).current;
  const rimDarkRotate = useRef(new Animated.Value(0)).current;
  const sunImageRotate = useRef(new Animated.Value(0)).current;
  const rimDarkStyle = [
    {
      height: 74,
      width: 74,
      transform: [
        {
          rotate: rimDarkRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '20deg'],
          }),
        },
      ],
    },
  ];
  const rimBrightStyle = [
    {
      height: 74,
      width: 74,
      transform: [
        {
          rotate: rimBrightRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '20deg'],
          }),
        },
      ],
    },
  ];
  const sunImageStyle = [
    {
      height: 64,
      width: 64,
      transform: [
        {
          rotate: sunImageRotate.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    },
  ];

  const _setIsScanEnabled = bool => {
    setIsScanEnabled(bool);
    // const {partnerId} = props?.user_info; // exception for 10-200410 partnerId
    // if (partnerId === '10-200410') setIsScanEnabled(false);
    // else setIsScanEnabled(bool);
  };

  const _setInitialStates = () => {
    selectColorByIndex(0); // default color - first index on the given json
    setIsRimBright(false); // default - dark rim
    setScanTime(12); // default - 12
    setDayLight(100); // default - 100
    setIsLincensePlateSelected(true); // default - licence plate would be selected in the radio button
  };

  useEffect(() => {
    _setInitialStates();
    _populateData(true);
    return () => {
      _clearRefreshDataInteraval();
    };
  }, []);

  const _refreshDataInterval = (interval = 5000) => {
    _clearRefreshDataInteraval();
    _refreshIntervalTimeout.current = setInterval(_populateData, interval);
  };

  const _clearRefreshDataInteraval = () => {
    if (!_refreshIntervalTimeout.current) return;
    clearInterval(_refreshIntervalTimeout.current);
    _refreshIntervalTimeout.current = null;
  };

  useBackHandler(() => {
    _clearRefreshDataInteraval();
    props.navigation.navigate('Dashboard');
    return true;
  });

  const _roateDarkRim = () => {
    rimDarkRotate.setValue(0);
    Animated.timing(rimDarkRotate, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear, // Easing is an additional import from react-native
      useNativeDriver: true, // To make use of native driver for performance
    }).start();
  };

  const _roateBrightRim = () => {
    rimBrightRotate.setValue(0);
    Animated.timing(rimBrightRotate, {
      toValue: 1,
      duration: 200,
      easing: Easing.linear, // Easing is an additional import from react-native
      useNativeDriver: true, // To make use of native driver for performance
    }).start();
  };

  const _rotateSun = () => {
    sunImageRotate.setValue(0);
    Animated.timing(sunImageRotate, {
      toValue: 1,
      duration: 5000,
      easing: Easing.linear, // Easing is an additional import from react-native
      useNativeDriver: true, // To make use of native driver for performance
    }).start(_rotateSun);
  };

  const _populateData = (isRefreshDataInterval = false) => {
    (async () => {
      try {
        const res = await _getAppInterfaceStatuses();
        console.log(res.data);
        const {
          color,
          dayLight,
          rimColor,
          scanTime,
          segment_1,
          segment_2,
          segment_3,
          startScan,
          turnOnCameras,
          turnOnLights,
          lastAccessedOn,
        } = res.data;

        let {vin, registrationType} = res.data;
        const {params} = props.route;
        if (params?.vin_no) {
          vin = params.vin_no;
          registrationType = 'VIN';
        }

        const currentTime = Date.now();
        console.log(currentTime, lastAccessedOn);
        const diffMs = currentTime - lastAccessedOn;
        const diffMins = Math.floor(((diffMs % 864e5) % 36e5) / 6e4);
        console.log('diffMins =', diffMins);
        if (diffMins < 5) {
          setIsFormDisabled(false);
          setIsTimeoutError(false);
        }
        // else {
        //   setIsFormDisabled(true);
        //   setIsTimeoutError(true);
        // }
        setIsScanStarted(startScan);
        if (isRefreshDataInterval && startScan) _refreshDataInterval();
        else if (!startScan) _clearRefreshDataInteraval();
        setIsCameraOn(turnOnCameras);
        setIsLightsOn(turnOnLights);
        scanTime && setScanTime(scanTime);
        if (!isNaN(parseInt(dayLight))) {
          setDayLight(parseInt(dayLight));
          // if (parseInt(dayLight) > 33) _rotateSun();
        }
        setIsRimBright(rimColor === 'Bright');
        color && selectColorThroughValue(color);

        if (registrationType === 'VIN') {
          // vin && _setVin(vin);
          _setVin(vin);
          setIsLincensePlateSelected(false);
        } else if (registrationType === 'RegNo') {
          // segment_1 && setLicensePlate1stSegment(segment_1);
          // segment_2 && setLicensePlate2ndSegment(segment_2);
          // segment_3 && setLicensePlate3rdSegment(segment_3);
          setLicensePlate1stSegment(segment_1);
          setLicensePlate2ndSegment(segment_2);
          setLicensePlate3rdSegment(segment_3);
          const isLicenseValidated = _validateLicensePlate({
            plate1: segment_1,
            plate2: segment_2,
            plate3: segment_3,
          });
          if (!isLicenseValidated) _setIsScanEnabled(false);
          else _setIsScanEnabled(true);
          setIsLincensePlateSelected(true);
        }
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoading(false);
        setIsDataLoading(false);
      }
    })();
  };

  const _postAppInterfaceColor = async () => {
    const {partnerId} = props.user_info;
    const ENTRY_URL = UNIVERSAL_ENTRY_POINT_ADDRESS;
    const url = ENTRY_URL + API_ROUTES_PATH + POST_APP_INTERFACE_COLOR;
    return axios.post(url, {
      partnerId,
      color: _getSelectedColorValue(),
    });
  };

  const _postAppInterfaceLightStatus = async () => {
    const {partnerId} = props.user_info;
    const ENTRY_URL = UNIVERSAL_ENTRY_POINT_ADDRESS;
    const url = ENTRY_URL + API_ROUTES_PATH + POST_APP_INTERFACE_LIGHT_STATUS;
    return axios.post(url, {
      partnerId,
      turnOnLights: isLightsOn,
      turnOnCameras: isCameraOn,
    });
  };

  const _resetAppInterfaceStatuses = async () => {
    const {partnerId} = props.user_info;
    const UNIVERSAL_ENTRY = UNIVERSAL_ENTRY_POINT_ADDRESS;
    const url = UNIVERSAL_ENTRY + API_ROUTES_PATH + RESET_APP_INTERFACE_STATUS;
    return axios.post(url, {partnerId});
  };

  const _postAppInterfaceStatuses = async () => {
    const {partnerId} = props.user_info;
    const selectedColorName = _getSelectedColorValue();
    if (isLincensePlateSelected) {
      var registrationType = 'RegNo';
      var license_1st_segment = licensePlate1stSegment;
      var license_2nd_segment = licensePlate2ndSegment || '-';
      var license_3rd_segment = licensePlate3rdSegment;
      var vin_no = `${licensePlate1stSegment}`;
      vin_no += licensePlate2ndSegment.concat(licensePlate3rdSegment);
    } else {
      registrationType = 'VIN';
      vin_no = vin;
      license_1st_segment = null;
      license_2nd_segment = null;
      license_3rd_segment = null;
    }
    if (isRimBright) var rimColor = 'Bright';
    else rimColor = 'Dark';
    const data = {
      partnerId,
      vin: vin_no,
      segment_1: license_1st_segment,
      segment_2: license_2nd_segment,
      segment_3: license_3rd_segment,
      registrationType,
      turnOnLights: true,
      turnOnCameras: true,
      scanTime,
      color: selectedColorName,
      rimColor,
      dayLight: `${dayLight}`,
      startScan: !isScanStarted,
      stopScan: !!isScanStarted,
    };
    // console.log('data =', data);
    const UNIVERSAL_ENTRY = UNIVERSAL_ENTRY_POINT_ADDRESS;
    const url = UNIVERSAL_ENTRY + API_ROUTES_PATH + POST_APP_INTERFACE_STATUSES;
    return axios.post(url, data);
  };

  const _getSelectedColorValue = () => {
    const [selectedColorInfo] = colorsInfo.filter(c => c.is_selected);
    return selectedColorInfo.value;
  };

  const selectColorThroughValue = color_name => {
    colorsInfo.map(c => {
      if (c.value == color_name) c.is_selected = true;
      else c.is_selected = false;
    });
    setColorsInfo([...colorsInfo]);
  };

  const selectColorByIndex = idx => {
    colorsInfo.map((c, i) => {
      if (i == idx) c.is_selected = true;
      else c.is_selected = false;
    });
    setColorsInfo([...colorsInfo]);
  };

  const _getAppInterfaceStatuses = async () => {
    const UNIVERSAL_ENTRY = UNIVERSAL_ENTRY_POINT_ADDRESS;
    return axios.get(
      UNIVERSAL_ENTRY + API_ROUTES_PATH + GET_APP_INTERFACE_STATUSES,
      {
        params: {
          partnerId: token,
          // clientApp: 1,
        },
      },
    );
  };

  const _focusLicensePlatePrevious = (key, index) => {
    if (key === 'Backspace' && index !== 0) _licensePlateRef[index - 1].focus();
  };

  const _setLicensePlate1stSegment = txt => {
    if (!_validateLicensePlate({plate1: txt})) _setIsScanEnabled(false);
    else _setIsScanEnabled(true);
    if (_validateLicense1stPlate(txt, 3)) _licensePlateRef[1].focus();
    setLicensePlate1stSegment(txt);
  };

  const _setLicensePlate2ndSegment = txt => {
    if (!_validateLicensePlate({plate2: txt})) _setIsScanEnabled(false);
    else _setIsScanEnabled(true);
    if (_validateLicense2ndPlate(txt, 2)) _licensePlateRef[2].focus();
    setLicensePlate2ndSegment(txt);
  };

  const _setLicensePlate3rdSegment = txt => {
    if (!_validateLicensePlate({plate3: txt})) _setIsScanEnabled(false);
    else _setIsScanEnabled(true);
    setLicensePlate3rdSegment(txt);
  };

  const _validateLicense1stPlate = (plate1, length) => {
    if (!isNaN(parseInt(length))) return `${plate1}`.length === length;
    return `${plate1}`.length >= 1 && `${plate1}`.length <= 3;
  };

  const _validateLicense2ndPlate = (plate2, length) => {
    if (!isNaN(parseInt(length))) return `${plate2}`.length === length;
    return `${plate2}`.length >= 0 && `${plate2}`.length <= 2;
  };

  const _validateLicense3rdPlate = (plate3, length) => {
    if (!isNaN(parseInt(length))) return `${plate3}`.length === length;
    return `${plate3}`.length >= 1 && `${plate3}`.length <= 5;
  };

  const _validateLicensePlate = ({
    plate1 = licensePlate1stSegment,
    plate2 = licensePlate2ndSegment,
    plate3 = licensePlate3rdSegment,
  }) => {
    const is1stPlate = _validateLicense1stPlate(plate1);
    const is2ndPlate = _validateLicense2ndPlate(plate2);
    const is3rdPlate = _validateLicense3rdPlate(plate3);
    if (is1stPlate && is2ndPlate && is3rdPlate) return true;
    return false;
  };

  const _resetLicensePlate = () => {
    setLicensePlate1stSegment('');
    setLicensePlate2ndSegment('');
    setLicensePlate3rdSegment('');
  };

  const _setIsLincensePlateSelected = bool => {
    if (bool) setVin('');
    else _resetLicensePlate();
    _setIsScanEnabled(false);
    setIsLincensePlateSelected(bool);
  };

  const _validateVin = vin => {
    const {params} = props.route;
    const {partnerId} = props?.user_info;
    if (params?.is_validation_disabled) return true;
    if (partnerId !== '10-200410' && `${vin}`.length === 17) return true;
    if (partnerId === '10-200410' && `${vin}`.length === 6) return true;
    return false;
  };

  const _setVin = vin => {
    if (!_validateVin(vin)) _setIsScanEnabled(false);
    else _setIsScanEnabled(true);
    setVin(vin);
  };

  const startScan = () => {
    setIsDataLoading(true);
    (async () => {
      try {
        await _postAppInterfaceStatuses();
        _populateData();
        _refreshDataInterval();
      } catch (err) {
        console.log(err);
        setIsDataLoading(false);
      }
    })();
  };

  const stopScan = () => {
    setIsDataLoading(true);
    _clearRefreshDataInteraval();
    (async () => {
      try {
        await _postAppInterfaceStatuses();
        _populateData();
      } catch (err) {
        console.log(err);
        setIsDataLoading(false);
      }
    })();
  };

  const resetInterface = () => {
    setIsDataLoading(true);
    (async () => {
      try {
        await _resetAppInterfaceStatuses();
        _populateData();
      } catch (err) {
        console.log(err);
        setIsDataLoading(false);
      }
    })();
  };

  const setColorInterface = () => {
    setIsDataLoading(true);
    (async () => {
      try {
        await _postAppInterfaceColor();
        _populateData();
      } catch (err) {
        console.log(err);
        setIsDataLoading(false);
      }
    })();
  };

  const setLightInterface = () => {
    setIsDataLoading(true);
    (async () => {
      try {
        await _postAppInterfaceLightStatus();
        _populateData();
      } catch (err) {
        console.log(err);
        setIsDataLoading(false);
      }
    })();
  };

  if (isLoading) {
    return (
      <View
        style={{...StyleSheet.absoluteFillObject, justifyContent: 'center'}}>
        <ActivityIndicator color="blue" size={30} />
      </View>
    );
  }

  if (!isScanStarted) {
    var btnScannerImage = require(`../assets/ble/scan-start.png`);
  } else btnScannerImage = require(`../assets/ble/scan-stop.png`);
  return (
    <View style={{flex: 1}}>
      {(isDataLoading || isFormDisabled) && (
        <View
          style={{
            position: 'absolute',
            height: '100%',
            width: '100%',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            zIndex: 100,
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
          }}
          pointerEvents="box-only">
          {isTimeoutError ? (
            <>
              <View>
                <Image
                  source={require('../assets/ble/client_offline.png')}
                  style={{height: 150, width: 150, alignSelf: 'center'}}
                />
              </View>
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  backgroundColor: '#931C20',
                  padding: 15,
                }}>
                <Text
                  style={{
                    fontWeight: 'bold',
                    color: 'white',
                    textAlign: 'center',
                    fontSize: 18,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                  }}>
                  App Client is Offline
                </Text>
              </View>
            </>
          ) : (
            <ActivityIndicator color="blue" size={24} />
          )}
        </View>
      )}
      <ScrollView
        scrollEnabled={!isDataLoading}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}>
        <View style={{marginTop: 50}} />
        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 100,
          }}>
          <View>
            <View
              style={{
                height: '100%',
                width: 60,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#8d8d8d',
                padding: 6,
              }}>
              <Text
                style={{textAlign: 'center', fontWeight: 'bold', fontSize: 30}}>
                1
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'bottom',
                  flex: 1,
                  textTransform: 'uppercase',
                }}>
                Auto
              </Text>
            </View>
          </View>
          <View style={{flex: 1, height: '100%', paddingHorizontal: 8}}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Pressable
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => _setIsLincensePlateSelected(true)}>
                  <View style={{...styles.radioButton}}>
                    {isLincensePlateSelected && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={{fontWeight: 'bold'}}>
                    {/* License Plate */}Kennzeichen
                  </Text>
                </Pressable>
                <Pressable
                  style={{flexDirection: 'row', alignItems: 'center'}}
                  onPress={() => {
                    // _setIsLincensePlateSelected(false);
                    props.navigation.push('BarcodeScanModal');
                  }}>
                  <View style={{...styles.radioButton}}>
                    {!isLincensePlateSelected && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={{fontWeight: 'bold'}}>VIN</Text>
                </Pressable>
              </View>
            </View>
            <View style={{flex: 1, marginTop: 8}}>
              {isLincensePlateSelected ? (
                <View
                  style={{
                    width: '100%',
                    height: '100%',
                    borderWidth: 2,
                    borderRadius: 4,
                    borderColor: '#8d8d8d',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}>
                  <Image
                    source={require('../assets/ble/plate.png')}
                    style={{height: '100%', width: 20}}
                  />
                  <TextInput
                    style={{
                      height: 50,
                      width: 61,
                      borderWidth: 0,
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                    multiline={false}
                    maxLength={3}
                    placeholderTextColor={'grey'}
                    value={licensePlate1stSegment}
                    onChangeText={_setLicensePlate1stSegment}
                    onKeyPress={e => {
                      _validateLicense1stPlate(licensePlate1stSegment, 0) &&
                        _focusLicensePlatePrevious(e.nativeEvent.key, 0);
                    }}
                    placeholder="MMM"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    ref={ref => (_licensePlateRef[0] = ref)}
                  />
                  <Image
                    source={require('../assets/ble/clock.png')}
                    style={{height: 32, width: 32}}
                  />
                  <TextInput
                    style={{
                      height: 50,
                      width: 44,
                      borderWidth: 0,
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                    maxLength={2}
                    multiline={false}
                    placeholderTextColor={'grey'}
                    value={licensePlate2ndSegment}
                    onChangeText={_setLicensePlate2ndSegment}
                    onKeyPress={e => {
                      _validateLicense2ndPlate(licensePlate2ndSegment, 0) &&
                        _focusLicensePlatePrevious(e.nativeEvent.key, 1);
                    }}
                    placeholder="MM"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    ref={ref => (_licensePlateRef[1] = ref)}
                  />
                  <View
                    style={{
                      height: 4,
                      width: 4,
                      borderRadius: 2,
                      backgroundColor: 'grey',
                    }}
                  />
                  <TextInput
                    style={{
                      height: 50,
                      width: 65,
                      borderWidth: 0,
                      fontSize: 20,
                      fontWeight: 'bold',
                      color: 'black',
                    }}
                    multiline={false}
                    placeholderTextColor={'grey'}
                    maxLength={5}
                    value={licensePlate3rdSegment}
                    onChangeText={_setLicensePlate3rdSegment}
                    onKeyPress={e => {
                      _validateLicense3rdPlate(licensePlate3rdSegment, 0) &&
                        _focusLicensePlatePrevious(e.nativeEvent.key, 2);
                    }}
                    placeholder="12345"
                    autoCapitalize="characters"
                    autoCorrect={false}
                    ref={ref => (_licensePlateRef[2] = ref)}
                  />
                  <View />
                </View>
              ) : (
                // <View style={{width: '100%', height: '100%'}}>
                //   {/* <View style={{flex: 1}}>
                //     <Text
                //       style={{
                //         fontSize: 10,
                //         textTransform: 'uppercase',
                //         fontWeight: 'bold',
                //         color: 'black',
                //       }}>
                //       17 Digits
                //     </Text>
                //   </View> */}
                //   <View
                //     style={{
                //       width: '100%',
                //       // height: '70%',
                //       height: '100%',
                //       borderWidth: 2,
                //       borderRadius: 4,
                //       borderColor: '#8d8d8d',
                //       flexDirection: 'row',
                //       alignItems: 'center',
                //       justifyContent: 'space-between',
                //     }}>
                //     <TextInput
                //       style={{
                //         // width: '100%',
                //         flex: 1,
                //         borderWidth: 0,
                //         height: 45,
                //         fontSize: 18,
                //         // height: 50,
                //         // fontSize: 20,
                //         fontWeight: 'bold',
                //       }}
                //       keyboardType="phone-pad"
                //       multiline={false}
                //       placeholderTextColor={'grey'}
                //       maxLength={6}
                //       value={vin}
                //       onChangeText={_setVin}
                //       placeholder="12345678901234567"
                //       autoCorrect={false}
                //     />
                //     <View
                //       style={{
                //         height: '100%',
                //         width: 30,
                //         // backgroundColor: '#4285F4',
                //         backgroundColor: 'grey',
                //         justifyContent: 'center',
                //         alignItems: 'center',
                //       }}>
                //       <Text
                //         style={{
                //           color: 'white',
                //           fontWeight: 'bold',
                //           fontSize: 18,
                //         }}>
                //         6
                //       </Text>
                //     </View>
                //     <View />
                //   </View>
                //   {/* <View
                //     style={{
                //       flex: 1,
                //       flexDirection: 'row',
                //       alignItems: 'center',
                //       justifyContent: 'space-between',
                //     }}>
                //     <Text
                //       style={{
                //         fontSize: 11,
                //         color: '#8d8d8d',
                //         textTransform: 'uppercase',
                //       }}>
                //       Entered: 0 Digits
                //     </Text>
                //     <Text
                //       style={{
                //         fontSize: 11,
                //         color: '#8d8d8d',
                //         textTransform: 'uppercase',
                //       }}>
                //       Missing: 0 Digits
                //     </Text>
                //   </View> */}
                // </View>
                <View style={{width: '100%', height: '100%'}}>
                  <View
                    style={{
                      height: '100%',
                      // height:'70%',
                      borderWidth: 2,
                      borderRadius: 4,
                      borderColor: '#8d8d8d',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    {/* <TextInput
                      style={{
                        flex: 1,
                        borderWidth: 0,
                        height: 50,
                        fontSize: 20,
                        fontWeight: 'bold',
                        color: 'black',
                      }}
                      keyboardType="phone-pad"
                      multiline={false}
                      placeholderTextColor={'grey'}
                      maxLength={6}
                      value={vin}
                      onChangeText={_setVin}
                      placeholder="123456"
                      autoCorrect={false}
                    /> */}
                    <View
                      style={{
                        flex: 1,
                        borderWidth: 0,
                        height: 50,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        paddingHorizontal: 6,
                        alignItems: 'center',
                      }}>
                      <Text
                        style={{
                          flexWrap: 'wrap',
                          fontSize: 20,
                          fontWeight: 'bold',
                          color: 'black',
                        }}>
                        {vin}
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                          props.navigation.push('BarcodeScanModal');
                        }}>
                        <Image
                          source={require('../assets/ble/qr-code.png')}
                          style={{height: 25, width: 25}}
                        />
                      </TouchableOpacity>
                      {/* <TouchableOpacity
                        activeOpacity={0.6}
                        onPress={() => {
                          props.navigation.push('BarcodeScanModal');
                        }}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 4,
                          backgroundColor: '#931C20',
                          borderRadius: 4,
                        }}>
                        <Text
                          style={{
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                          }}>
                          Scan
                        </Text>
                      </TouchableOpacity> */}
                    </View>
                  </View>
                  {/* <View
                    style={{
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#8d8d8d',
                        textTransform: 'uppercase',
                      }}>
                      Total: 6 Digits
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#8d8d8d',
                        textTransform: 'uppercase',
                      }}>
                      Entered: {`${vin}`.length} Digits
                    </Text>
                  </View> */}
                </View>
              )}
            </View>
          </View>
        </View>

        <View style={{...styles.horizontalSeperator}} />

        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 100,
          }}>
          <View>
            <View
              style={{
                height: '100%',
                width: 60,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#8d8d8d',
                padding: 6,
              }}>
              <Text
                style={{textAlign: 'center', fontWeight: 'bold', fontSize: 30}}>
                2
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'bottom',
                  flex: 1,
                  textTransform: 'uppercase',
                }}>
                {/* Rim */}FELGE
              </Text>
            </View>
          </View>
          <View style={{flex: 1, height: '100%', paddingHorizontal: 8}}>
            <View
              style={{
                height: '100%',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Animated.View style={rimDarkStyle}>
                <ImageBackground
                  source={require('../assets/ble/wheel_black.png')}
                  style={{height: '100%', width: '100%'}}>
                  <Pressable
                    style={{
                      height: '100%',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => (_roateDarkRim(), setIsRimBright(false))}>
                    {!isRimBright && (
                      <View
                        style={{
                          height: 6,
                          width: 6,
                          borderRadius: 3,
                          backgroundColor: 'black',
                        }}
                      />
                    )}
                  </Pressable>
                </ImageBackground>
              </Animated.View>
              <Animated.View style={rimBrightStyle}>
                <ImageBackground
                  source={require('../assets/ble/wheel_white.png')}
                  style={{height: '100%', width: '100%'}}>
                  <Pressable
                    style={{
                      height: '100%',
                      width: '100%',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                    onPress={() => (_roateBrightRim(), setIsRimBright(true))}>
                    {isRimBright && (
                      <View
                        style={{
                          height: 6,
                          width: 6,
                          borderRadius: 3,
                          backgroundColor: 'black',
                        }}
                      />
                    )}
                  </Pressable>
                </ImageBackground>
              </Animated.View>
            </View>
          </View>
        </View>

        <View style={{...styles.horizontalSeperator}} />

        <View
          style={{
            padding: 10,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 110,
          }}>
          <View>
            <View
              style={{
                height: '100%',
                width: 60,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: '#8d8d8d',
                padding: 6,
              }}>
              <Text
                style={{textAlign: 'center', fontWeight: 'bold', fontSize: 30}}>
                3
              </Text>
              <Text
                style={{
                  textAlign: 'center',
                  textAlignVertical: 'bottom',
                  flex: 1,
                  textTransform: 'uppercase',
                }}>
                {/* Color */}FARBE
              </Text>
            </View>
          </View>
          <View style={{flex: 1}}>
            <View
              style={{
                height: '100%',
                paddingHorizontal: 8,
                flexDirection: 'row',
                marginTop: -14,
              }}>
              <View
                style={{
                  width: '100%',
                  flexWrap: 'wrap',
                  flexDirection: 'row',
                  alignItems: 'center',
                  alignSelf: 'center',
                }}>
                {colorsInfo.map((color, idx) => {
                  return (
                    <Pressable
                      key={idx}
                      style={{
                        paddingHorizontal: 8,
                        paddingTop: 6,
                      }}
                      onPress={() => selectColorByIndex(idx)}>
                      <View
                        style={{
                          height: 20,
                          width: 20,
                          borderRadius: 10,
                          borderWidth: !color.is_selected ? 1 : 4,
                          borderColor: !color.is_selected ? '#8d8d8d' : 'red',
                          backgroundColor: color.hex,
                        }}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <View
              style={{
                padding: 0,
                marginTop: -8,
                marginRight: 20,
              }}>
              <Text style={{textAlign: 'center', fontWeight: 'bold'}}>
                {_getSelectedColorValue()}
              </Text>
            </View>
          </View>
        </View>

        <View style={{...styles.horizontalSeperator}} />

        <View style={{padding: 10, flex: 1}}>
          <View
            style={{
              paddingHorizontal: 8,
              flexDirection: 'row',
            }}>
            <View style={{width: '100%'}}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <Animated.Image
                  source={require('../assets/ble/sun.png')}
                  style={sunImageStyle}
                />
                <Image
                  source={require('../assets/ble/cloud.png')}
                  style={{height: 64, width: 64}}
                />
                <Image
                  source={require('../assets/ble/night.png')}
                  style={{height: 64, width: 64}}
                />
              </View>
              <View
                style={{
                  alignSelf: 'center',
                  width: '100%',
                }}>
                <Slider
                  step={1}
                  ref={_refDayLightSlider}
                  value={dayLight}
                  style={{width: '100%', height: 40}}
                  minimumValue={dayLightMinVal}
                  maximumValue={dayLightMaxVal}
                  thumbTintColor="#4285F4"
                  minimumTrackTintColor="#4285F4"
                  maximumTrackTintColor="#000000"
                  onSlidingComplete={setDayLight}
                />
              </View>
            </View>
          </View>

          <View style={{marginTop: 10}}>
            <TouchableOpacity
              onPress={() => (isScanStarted ? stopScan() : startScan())}
              containerStyle={{alignSelf: 'center'}}
              disabled={!isScanEnabled}>
              <ImageBackground
                style={{
                  height: 100,
                  width: 100,
                  alignSelf: 'center',
                }}
                source={btnScannerImage}>
                {!isScanEnabled && (
                  <View
                    style={{
                      position: 'absolute',
                      width: 100,
                      height: 100,
                      borderRadius: 100 / 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    }}>
                    <NoSign />
                  </View>
                )}
              </ImageBackground>
            </TouchableOpacity>
          </View>

          <View style={{marginVertical: 50}}>
            <View
              style={{
                borderRadius: 4,
                borderWidth: 1,
                borderColor: !isAdminPanelEnabled ? 'transparent' : '#000',
                marginBottom: !isAdminPanelEnabled ? 100 : 0,
              }}>
              {/* {!isAdminPanelEnabled && (
                <View
                  style={{
                    position: 'absolute',
                    height: '100%',
                    width: '100%',
                    backgroundColor: 'rgba(255, 255, 255, 0.6)',
                    zIndex: 1,
                  }}
                />
              )} */}

              {/* <Pressable
              style={{
                backgroundColor: '#f2f2f2',
                alignSelf: 'center',
                position: 'absolute',
                marginTop: -20,
                // paddingLeft: 20,
                // paddingRight: 14,
                zIndex: 10,
                borderWidth: 1,
                borderRadius: 4,
                borderColor: 'black',
              }}
              onPress={() => setIsAdminPanelEnabled(!isAdminPanelEnabled)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}> */}
              {/* <Text style={{textTransform: 'uppercase', fontWeight: 'bold'}}>
                  Admin
                </Text> */}
              {/* <Checkbox
                  color="#4285F4"
                  status={isAdminPanelEnabled ? 'checked' : 'unchecked'}
                /> */}
              {/* <View
              style={{
                backgroundColor: 'red',
                zIndex: 1,
                // zIndex: 1,
                // alignSelf: 'center',
                // position: 'absolute',
                // marginTop: -20,
              }}> */}
              <View
                style={{
                  backgroundColor: 'red',
                  zIndex: 1,
                  alignSelf: 'center',
                  // position: 'absolute',
                  marginTop: -20,
                  backgroundColor: '#f2f2f2',
                  borderWidth: 1,
                  borderRadius: 4,
                  borderColor: 'black',
                }}>
                <CheckBox
                  containerStyle={{
                    padding: 0,
                    margin: 0,
                    paddingVertical: 5,
                    paddingLeft: 20,
                    paddingRight: 14,
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                  }}
                  onPress={() => setIsAdminPanelEnabled(!isAdminPanelEnabled)}
                  center
                  iconRight
                  title={
                    <Text
                      style={{
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        marginRight: 10,
                      }}>
                      Admin
                    </Text>
                  }
                  checkedIcon="dot-circle-o"
                  uncheckedIcon="circle-o"
                  checked={isAdminPanelEnabled}
                />
              </View>
              {/* </View>
            </Pressable> */}
              {isAdminPanelEnabled && (
                <View
                  style={{padding: 10}}
                  pointerEvents={isAdminPanelEnabled ? 'box-none' : 'none'}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 30,
                    }}>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Switch
                        color="red"
                        value={isCameraOn}
                        onValueChange={setIsCameraOn}
                      />
                      <Text
                        style={{
                          marginTop: 2,
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          fontSize: 10,
                        }}>
                        Camera
                      </Text>
                    </View>
                    <View style={{flex: 1, alignItems: 'center'}}>
                      <Switch
                        color="red"
                        value={isLightsOn}
                        onValueChange={setIsLightsOn}
                      />
                      <Text
                        style={{
                          marginTop: 2,
                          textTransform: 'uppercase',
                          fontWeight: 'bold',
                          textAlign: 'center',
                          fontSize: 10,
                        }}>
                        Lights
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      marginTop: 20,
                      paddingHorizontal: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View>
                      <Text
                        style={{
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                        }}>
                        Scan Time
                      </Text>
                    </View>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: '#d0d0d0',
                        borderRadius: 4,
                        flex: 1,
                        marginLeft: 15,
                      }}>
                      <Picker
                        mode="dropdown"
                        selectedValue={scanTime}
                        onValueChange={(val, idx) => setScanTime(val)}>
                        {Array(38)
                          .fill(null)
                          .map((data, idx) => (
                            <Picker.Item
                              key={idx}
                              label={`${idx + 3} Seconds`}
                              value={`${idx + 3}`}
                            />
                          ))}
                      </Picker>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <TouchableOpacity onPress={setColorInterface}>
                      <Image
                        style={{
                          height: 90,
                          resizeMode: 'contain',
                          aspectRatio: 1,
                        }}
                        source={require('../assets/ble/set-farbe-btn.png')}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={setLightInterface}>
                      <Image
                        style={{
                          height: 90,
                          aspectRatio: 1,
                          resizeMode: 'contain',
                        }}
                        source={require('../assets/ble/licht-btn.png')}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={resetInterface}>
                      <Image
                        style={{
                          height: 90,
                          aspectRatio: 1,
                          resizeMode: 'contain',
                        }}
                        source={require('../assets/ble/reset-btn.png')}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  horizontalSeperator: {
    height: 0.8,
    width: '100%',
    backgroundColor: '#d0d0d0',
  },
  radioButton: {
    height: 14,
    width: 14,
    borderRadius: 7,
    backgroundColor: '#f4f4f4',
    borderWidth: 1,
    borderColor: '#b4b4b4',
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    height: 8,
    width: 8,
    borderRadius: 6,
    backgroundColor: '#4d4d4d',
  },
});

const mapStateToProps = ({user_info}) => ({user_info});

export default connect(mapStateToProps)(BluetoothModule);
