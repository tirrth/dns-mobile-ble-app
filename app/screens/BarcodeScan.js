import React, {PureComponent, useEffect, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  Animated,
  Easing,
  View,
  StatusBar,
  BackHandler,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {Input, Icon, Button} from 'react-native-elements';
import {IconButton} from 'react-native-paper';
// import Animated, {
//   Easing,
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming,
//   withRepeat,
//   runOnJS,
// } from 'react-native-reanimated';
import {ScrollView} from 'react-native-gesture-handler';
import LottieView from 'lottie-react-native';
import CameraZoomSlider from '../components/range-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {connect} from 'react-redux';

export const windowWidth = Dimensions.get('window').width;
export const windowHeight = Dimensions.get('window').height;
export const statusbarHeight = StatusBar.currentHeight;
export const getOrientation = () => {
  if (windowWidth >= windowHeight) {
    return 'LANDSCAPE';
  }
  return 'PORTRAIT';
};

const BarcodeScanOverlay = props => {
  const inputRef = useRef(null);
  const _cameraZoomSliderRef = useRef(null);
  const partnerId = props.user_info?.partnerId;
  const initialLineHeight = 186;
  const barcodeAnimLineHeight = useRef(
    new Animated.Value(initialLineHeight),
  ).current;
  const barcodeAnimLineHeightLatestValueRef = useRef(barcodeAnimLineHeight);
  const scannerOverlayPrimaryColor = props._isScanCompleted
    ? !props._isScanValidationError
      ? '#64CF99'
      : '#DB4437'
    : '#DA1C23';
  const scannerOverlayBackgroundRGBA = 'rgba(0, 0, 0, 0.6)';
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const animateBarcodeLineTiming = (
    toValue = 0,
    duration = 1500,
    easing = Easing.elastic(0.84),
    useNativeDriver = false,
  ) =>
    Animated.timing(barcodeAnimLineHeight, {
      toValue,
      duration,
      easing,
      useNativeDriver,
    });

  const barcodeScannerAnim = Animated.loop(
    Animated.sequence([
      animateBarcodeLineTiming(10),
      animateBarcodeLineTiming(initialLineHeight),
    ]),
  );

  useEffect(() => {
    barcodeScannerAnim.start();
  }, []);

  useEffect(() => {
    const animEventListener = barcodeAnimLineHeight.addListener(v => {
      //Store the latest animated value
      barcodeAnimLineHeightLatestValueRef.current = v.value;
    });

    //Return a deregister function to clean up
    return () => barcodeAnimLineHeight.removeListener(animEventListener);

    //Note that the behavior here isn't 100% correct if the animatedValue changes -- the returned ref
    //may refer to the previous animatedValue's latest value until the new listener returns a value
  }, [barcodeAnimLineHeight]);

  useEffect(() => {
    if (props._isScanCompleted) {
      barcodeScannerAnim.stop();
      barcodeAnimLineHeight.setValue(
        barcodeAnimLineHeightLatestValueRef.current, // To get the current value of barcodeAnimLineHeight (Register to event listener separately in useEffect to get current value)
      );
      animateBarcodeLineTiming(100).start();
    }
  }, [props._isScanCompleted]);

  useEffect(() => {
    props._onReScanPress();
    setInitialState();
    if (!props._isManualEntry) {
      barcodeScannerAnim.reset();
      barcodeScannerAnim.start();
    } else {
      inputRef.current.focus();
    }
  }, [props._isManualEntry]);

  const barcodeAnimLineStyle = [
    {
      height: barcodeAnimLineHeight,
      backgroundColor: props._isScanCompleted
        ? 'rgba(100, 207, 153, 0.2)'
        : 'rgba(218, 28, 35, 0.2)',
    },
  ];

  const setInitialState = () => {
    setIsSubmitLoading(false);
    setIsSubmitted(false);
  };

  const _onSubmit = async (is_validation_disabled = false) => {
    // setIsSubmitLoading(true);
    // if (props.barcodeValue) { }
    // setIsSubmitLoading(false);
    // await AsyncStorage.setItem('vin_no', props.barcodeValue);
    // setIsSubmitted(true);
    StatusBar.setBackgroundColor('#800000');
    StatusBar.setBarStyle('light-content');
    props.navigation.push('BluetoothModule', {
      vin_no: props.barcodeValue,
      is_validation_disabled,
    });
  };

  const _onReScanPress = () => {
    setInitialState();
    barcodeScannerAnim.reset();
    barcodeScannerAnim.start();
    props._onReScanPress();
  };

  return (
    <View
      pointerEvents="box-none"
      style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 2,
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}>
      <View
        pointerEvents="box-none"
        style={{
          backgroundColor: scannerOverlayBackgroundRGBA,
          flex: 1,
          paddingTop: statusbarHeight,
        }}>
        <View
          style={{
            padding: 6,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <IconButton
            onPress={() => {
              props._backAction();
              // if (props.navigation.canGoBack()) props.navigation.goBack();
              // else props.navigation.reset({routes: [{name: 'DashboardRoot'}]});
            }}
            icon="close"
            color="white"
            size={18}
            style={{backgroundColor: 'rgba(255, 255, 255, 0.4)'}}
          />
          {!props._isManualEntry && !props._isScanCompleted && (
            <IconButton
              onPress={() => props._onToggleTorchMode(!props.toggleTorchMode)}
              icon={props.toggleTorchMode ? 'flash' : 'flash-off'}
              color="white"
              size={18}
            />
          )}
        </View>
        <View
          pointerEvents="none"
          style={{
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: 30,
          }}>
          {/* <Text
            style={{
              textAlign: 'center',
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
            }}>
            {props._isScanCompleted ? '2' : '1'}
            {<Text style={{fontWeight: 'normal'}}> / </Text>}2
          </Text> */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                textAlign: 'center',
                color: 'white',
                letterSpacing: 0.7,
                fontWeight: 'bold',
                fontSize: 28,
              }}>
              {props._isManualEntry
                ? 'Enter VIN Number'
                : props._isScanCompleted
                ? 'Scan Completed'
                : 'Scan Barcode'}
            </Text>
            {!props._isManualEntry &&
              props._isScanCompleted &&
              (!props._isScanValidationError ? (
                <LottieView
                  style={{width: 45, height: 45}}
                  source={require('../assets/animations/success-in-motion.json')}
                  autoPlay
                  loop
                />
              ) : (
                <LottieView
                  style={{width: 30, height: 30, marginLeft: 4}}
                  source={require('../assets/animations/error-in-motion.json')}
                  autoPlay
                  loop
                />
              ))}
          </View>
          <Text
            style={{
              textAlign: 'center',
              color: 'white',
              letterSpacing: 0.7,
              fontSize: 13,
              marginTop: props._isScanCompleted ? 1 : 6,
            }}>
            {/* Scan your barcode on the red box */}
            {/* Place the Barcode or QR code inside the area */}
            {props._isManualEntry
              ? 'Enter the VIN Number or scan the Barcode'
              : props._isScanCompleted
              ? !props._isScanValidationError
                ? 'Confirm the result and submit the information'
                : 'Invalid VIN number. Please re-scan and submit'
              : 'Align the Barcode within the frame to scan'}
          </Text>
        </View>
      </View>
      <View
        pointerEvents={
          props._isManualEntry || props._isScanCompleted ? 'box-none' : 'none'
        }
        style={[
          {flex: 1},
          !props._isManualEntry
            ? {
                justifyContent: 'center',
              }
            : {
                backgroundColor: scannerOverlayBackgroundRGBA,
              },
        ]}>
        <View
          pointerEvents="none"
          style={
            !props._isManualEntry
              ? [
                  {
                    flex: 1,
                    backgroundColor: scannerOverlayBackgroundRGBA,
                  },
                ]
              : [
                  {
                    height: 80,
                  },
                ]
          }
        />
        {!props._isManualEntry ? (
          <View style={{height: 200, flexDirection: 'row'}}>
            <View
              style={{
                flex: 1,
                backgroundColor: scannerOverlayBackgroundRGBA,
              }}
            />
            <View
              style={{
                height: '100%',
                width: '90%',
                zIndex: 2,
              }}>
              <View>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: 6,
                    width: 6,
                    borderBottomRightRadius: 10,
                    backgroundColor: scannerOverlayBackgroundRGBA,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    height: 6,
                    width: 6,
                    borderBottomLeftRadius: 10,
                    backgroundColor: scannerOverlayBackgroundRGBA,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 194, // apparently bottom: 0 is not working properly, so had to start from top to reach at the bottom
                    left: 0,
                    height: 6,
                    width: 6,
                    borderTopRightRadius: 10,
                    backgroundColor: scannerOverlayBackgroundRGBA,
                  }}
                />
                <View
                  style={{
                    position: 'absolute',
                    top: 194, // apparently bottom: 0 is not working properly, so had to start from top to reach at the bottom
                    right: 0,
                    height: 6,
                    width: 6,
                    borderTopLeftRadius: 10,
                    backgroundColor: scannerOverlayBackgroundRGBA,
                  }}
                />
              </View>
              <View
                style={{
                  borderWidth: 3,
                  borderColor: scannerOverlayPrimaryColor,
                  borderRadius: 8,
                  flex: 1,
                  justifyContent: 'flex-end',
                  backgroundColor: props._isScanCompleted
                    ? scannerOverlayBackgroundRGBA
                    : 'transparent',
                }}>
                <Animated.View
                  style={
                    ([
                      {
                        width: '100%',
                      },
                    ],
                    barcodeAnimLineStyle)
                  }>
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '108%',
                      height: 1,
                      marginLeft: -(windowWidth * 0.035),
                    }}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'center',
                      }}>
                      <View
                        style={{
                          flex: 1,
                          height: props._isScanCompleted ? 2 : 1,
                          backgroundColor: scannerOverlayPrimaryColor,
                        }}
                      />
                      {props._isScanCompleted && (
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            justifyContent: 'center',
                            alignItems: 'center',
                            transform: [{translateY: -20}],
                          }}>
                          <IconButton
                            onPress={_onReScanPress}
                            icon="refresh" // barcode-scan
                            size={25}
                            style={{
                              width: '100%',
                              height: '100%',
                              backgroundColor: scannerOverlayPrimaryColor,
                              borderRadius: 4,
                            }}
                            color="white"
                          />
                        </View>
                      )}
                      <View
                        style={{
                          flex: 1,
                          height: props._isScanCompleted ? 2 : 1,
                          backgroundColor: scannerOverlayPrimaryColor,
                        }}
                      />
                    </View>
                  </View>
                </Animated.View>
              </View>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: scannerOverlayBackgroundRGBA,
              }}
            />
          </View>
        ) : (
          <View
            style={{
              backgroundColor: 'white',
              width: '90%',
              borderRadius: 6,
              alignSelf: 'center',
              paddingVertical: 14,
              paddingHorizontal: 7,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <View style={{flex: 1}}>
              <Input
                ref={inputRef}
                value={`${props.barcodeValue}`}
                onChangeText={val => props.setBarcodeValue(val)}
                style={{padding: 0}}
                containerStyle={{height: 53}}
                inputContainerStyle={{borderBottomWidth: 0}}
                inputStyle={{
                  fontSize: 18,
                  marginTop: -6,
                  padding: 0,
                }}
                keyboardType="default"
                maxLength={partnerId !== '10-200410' ? 17 : 6}
                placeholder={
                  partnerId !== '10-200410'
                    ? 'E.g. 71A9H2DFGW4389ENW'
                    : 'E.g. 71A9H2'
                }
                autoCapitalize="characters"
                label={`VIN Number  (${
                  partnerId !== '10-200410' ? 17 : 6
                } Characters)`}
                labelStyle={{fontSize: 14}}
              />
            </View>
            <View>
              <IconButton
                disabled={
                  `${props.barcodeValue}`.length !==
                  (partnerId !== '10-200410' ? 17 : 6)
                }
                onPress={
                  isSubmitted
                    ? () => {
                        props.setIsManualEntry(false);
                        _onReScanPress();
                      }
                    : _onSubmit
                }
                icon={isSubmitted ? 'check-all' : 'check'}
                color={'white'}
                style={{
                  backgroundColor: isSubmitted
                    ? '#64CF99'
                    : scannerOverlayPrimaryColor,
                }}
              />
            </View>
          </View>
        )}
        {/* <View
          style={{flex: 1, backgroundColor: scannerOverlayBackgroundRGBA}}
        /> */}
      </View>
      <View
        pointerEvents="box-none"
        style={{
          flex: 1,
          justifyContent: props._isManualEntry ? 'flex-end' : 'space-between',
          backgroundColor: scannerOverlayBackgroundRGBA,
          paddingVertical: 20,
        }}>
        {!props._isManualEntry ? (
          !props._isScanCompleted ? (
            <View
              style={{
                flexDirection: 'row',
                alignSelf: 'center',
                alignItems: 'baseline',
                marginTop: -14,
              }}>
              <IconButton
                icon="minus"
                color="white"
                size={18}
                style={{marginTop: 18, marginRight: 8}}
                onPress={() =>
                  props._onChangeZoomFactor(props.cameraZoomFactor - 0.1)
                }
                disabled={props.cameraZoomFactor <= 0}
              />
              <View style={{width: '50%', alignSelf: 'center'}}>
                <CameraZoomSlider
                  innerRef={_cameraZoomSliderRef}
                  setLow={val => props._onChangeZoomFactor(val)}
                  low={props.cameraZoomFactor || 0}
                  step={0.01}
                  min={0}
                  max={1}
                  disableRange
                  disableLabel
                  disableNotch
                />
              </View>
              <IconButton
                icon="plus"
                color="white"
                size={18}
                style={{marginLeft: 8}}
                onPress={() => {
                  // console.log(_cameraZoomSliderRef);
                  props._onChangeZoomFactor(props.cameraZoomFactor + 0.1);
                }}
                disabled={props.cameraZoomFactor >= 1}
              />
            </View>
          ) : (
            <View style={{flex: 1}}>
              <View
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.3)',
                  width: '64%',
                  alignSelf: 'center',
                  borderRadius: 6,
                  padding: 14,
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#f0f0f0',
                      fontWeight: '700',
                      fontSize: 15,
                    }}>
                    VIN NO.
                  </Text>
                  <Text
                    style={{
                      color: '#e8e8e8',
                      fontSize: 15,
                      flexShrink: 1,
                      marginLeft: 10,
                    }}>
                    {props.barcodeValue || ''}
                  </Text>
                </View>
                <View style={{marginTop: 10}}>
                  <Button
                    loading={isSubmitLoading}
                    onPress={
                      isSubmitted || props._isScanValidationError
                        ? _onReScanPress
                        : () => _onSubmit(true)
                    }
                    buttonStyle={{
                      backgroundColor: isSubmitted
                        ? '#4285F4'
                        : scannerOverlayPrimaryColor,
                    }}
                    icon={
                      !props._isScanValidationError ? (
                        <Icon
                          type="font-awesome-5"
                          name={isSubmitted ? 'check-double' : 'check'}
                          size={12}
                          style={{marginRight: 8}}
                          color="white"
                        />
                      ) : (
                        <Icon
                          type="font-awesome-5"
                          name={'times'}
                          size={12}
                          style={{marginRight: 8}}
                          color="white"
                        />
                      )
                    }
                    title={
                      !props._isScanValidationError ? (
                        <Text style={{color: '#ffffff', fontWeight: '700'}}>
                          {isSubmitted ? 'DONE' : 'CONFIRM'}
                        </Text>
                      ) : (
                        <Text style={{color: '#ffffff', fontWeight: '700'}}>
                          RE-SCAN
                        </Text>
                      )
                    }
                  />
                </View>
              </View>
            </View>
          )
        ) : (
          <></>
        )}
        <View
          style={{
            flexDirection: 'row',
            borderRadius: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            paddingVertical: 6,
            marginHorizontal: 20,
            paddingHorizontal: 6,
          }}>
          <Button
            disabled={!props._isManualEntry}
            containerStyle={{flex: 1}}
            title="Scan code"
            buttonStyle={{backgroundColor: 'transparent'}}
            onPress={() => props.setIsManualEntry(false)}
          />
          <Button
            disabled={props._isManualEntry}
            containerStyle={{flex: 1}}
            buttonStyle={{backgroundColor: 'transparent'}}
            // title="Enter code"
            title="Enter manually"
            onPress={() => props.setIsManualEntry(true)}
          />
          {/* <Pressable
            style={{
              flex: 1,
              paddingVertical: 8,
              backgroundColor: 'white',
              borderRadius: 5,
            }}
            onPress={() => props.setIsCompleted(!props._isScanCompleted)}>
            <Text style={{textAlign: 'center', fontSize: 15, color: '#888888'}}>
              Scan code
            </Text>
          </Pressable> */}
          {/* <View style={{flex: 1, paddingVertical: 8}}>
            <Text style={{textAlign: 'center', fontSize: 15, color: '#c0c0c0'}}>
              Enter code
            </Text>
          </View> */}
        </View>
        {/* <View>
          <View
            style={{
              height: 40,
              width: 40,
              borderRadius: 25,
              // backgroundColor: '#DA1C23',
              backgroundColor: 'rgba(218,28,35, 0.8)',
              // borderWidth: 1,
              borderColor: 'white',
              opacity: 0.5,
              justifyContent: 'center',
              alignItems: 'center',
              alignSelf: 'center',
            }}>
            <Icon type="font-awesome" name="qrcode" color="white" />
          </View>
          <View style={{alignSelf: 'center', marginVertical: 15}}>
            <Text
              style={{
                color: 'white',
                fontWeight: '700',
                fontSize: 16,
                textAlign: 'center',
                letterSpacing: 0.8,
              }}>
              OR
            </Text>
          </View>
          <View
            style={{
              marginHorizontal: 20,
              borderRadius: 4,
              backgroundColor: 'rgba(218,28,35, 0.8)',
              paddingVertical: 10,
              paddingHorizontal: 20,
            }}>
            <Text
              style={{color: 'white', textAlign: 'center', fontWeight: '700'}}>
              Add Manually
            </Text>
          </View>
        </View> */}
      </View>
    </View>
  );
};

class BarcodeScan extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      cameraZoomFactor: 0,
      toggleTorchMode: false,
      isManualEntry: false,

      isBarcodeDetected: false,
      barcodePhoto: '',
      barcodeValue: '',
      isScanValidationError: false,
    };
  }

  backAction = () => {
    if (this.props.navigation?.getState?.()?.index == 1) {
      // Check the previous screen and set the styles accordingly
      StatusBar.setBackgroundColor('#800000');
      StatusBar.setBarStyle('light-content');
    }
    if (this.props.navigation.canGoBack()) this.props.navigation.goBack();
    else this.props.navigation.reset({routes: [{name: 'DashboardRoot'}]});
    return true;
  };

  componentDidMount() {
    // setTimeout(() => {
    //   this.setState({
    //     isBarcodeDetected: true,
    //     barcodeValue: '2178712781271281272178921791297',
    //   });
    // }, 2000);
    this.props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', this.backAction);
    });

    this.props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', this.backAction);
    });
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.backAction);
  }

  takePicture = async () => {
    const {isBarcodeDetected, barcodePhoto} = this.state;
    if (this.camera && !isBarcodeDetected && !barcodePhoto) {
      const options = {
        quality: 0.5,
        base64: true,
        orientation: getOrientation() === 'PORTRAIT' ? 'portrait' : 'auto',
      };
      await this.camera
        .takePictureAsync(options)
        .then(data => {
          // console.log(data.uri);
          this.setState({barcodePhoto: data.uri}, () => {
            this.setState({isBarcodeDetected: true});
          });
        })
        .catch(err => console.log(err));
    }
  };

  render() {
    const {
      cameraZoomFactor,
      toggleTorchMode,
      isBarcodeDetected,
      barcodePhoto,
      barcodeValue,
      isManualEntry,
      isScanValidationError,
    } = this.state;
    return (
      <>
        <StatusBar
          showHideTransition="slide"
          translucent
          backgroundColor="rgba(0, 0, 0, 0.3)"
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            height: windowHeight,
            width: windowWidth,
          }}>
          <View style={styles.container}>
            <BarcodeScanOverlay
              {...this.props}
              _backAction={this.backAction}
              cameraZoomFactor={cameraZoomFactor}
              _onChangeZoomFactor={cameraZoomFactor => {
                this.setState({cameraZoomFactor});
              }}
              _onReScanPress={() => {
                this.setState({
                  isBarcodeDetected: false,
                  barcodePhoto: '',
                  barcodeValue: '',
                });
              }}
              setIsCompleted={bool => this.setState({isBarcodeDetected: bool})}
              _isManualEntry={isManualEntry}
              setIsManualEntry={bool => this.setState({isManualEntry: bool})}
              _isScanCompleted={isBarcodeDetected && barcodeValue}
              _isScanValidationError={!!isScanValidationError}
              barcodeValue={barcodeValue}
              setBarcodeValue={barcodeValue => this.setState({barcodeValue})}
              toggleTorchMode={toggleTorchMode}
              _onToggleTorchMode={toggleTorchMode =>
                this.setState({toggleTorchMode})
              }
            />

            {isBarcodeDetected && barcodePhoto ? (
              <View style={{flex: 1}}>
                <Image
                  source={{uri: barcodePhoto}}
                  resizeMode="cover"
                  style={{flex: 1}}
                />
              </View>
            ) : (
              <RNCamera
                ref={comp => (this.camera = comp)}
                style={styles.preview}
                type={RNCamera.Constants.Type.back}
                flashMode={
                  RNCamera.Constants.FlashMode[
                    toggleTorchMode ? 'torch' : 'off'
                  ]
                }
                zoom={cameraZoomFactor}
                androidCameraPermissionOptions={{
                  title: 'Permission to use camera',
                  message: 'We need your permission to use your camera',
                  buttonPositive: 'Ok',
                  buttonNegative: 'Cancel',
                }}
                captureAudio={false}
                useNativeZoom={true}
                onDoubleTap={() => {
                  this.setState(states => {
                    return {
                      ...states,
                      cameraZoomFactor:
                        states.cameraZoomFactor >= 1
                          ? 0
                          : states.cameraZoomFactor + 0.25,
                    };
                  });
                }}
                googleVisionBarcodeType={
                  RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType
                    .ALL
                }
                onGoogleVisionBarcodesDetected={({barcodes}) => {
                  if (isManualEntry) return;
                  this.setState({
                    barcodeValue: barcodes[0]?.data,
                    // isScanValidationError: barcodes[0]?.data?.length !== 6, // uncomment this to add validation in the barcode scanner
                  });
                  this.takePicture();
                }}
              />
            )}
          </View>
        </ScrollView>
      </>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'black',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});

const mapStateToProps = ({user_info}) => ({user_info});

export default connect(mapStateToProps)(BarcodeScan);
