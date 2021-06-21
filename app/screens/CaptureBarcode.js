import React, {useRef, useState, useEffect, useContext} from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
  BackHandler,
} from 'react-native';
import {RNCamera} from 'react-native-camera';
import {IconButton} from 'react-native-paper';
import CameraTypeSelection from '../components/CameraTypeSelection';
import {getOrientation} from './BarcodeScan';
import ImagePicker from 'react-native-image-crop-picker';
import {Icon, Button} from 'react-native-elements';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_ROUTES_PATH,
  STORE_BARCODE_IMAGE_API_KEY,
} from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AuthContext} from '../components/navigation/AuthProvider';
import {_apiErrorHandler} from '../components/util';
const statusbarHeight = StatusBar.currentHeight;

const CameraOverlay = props => {
  return (
    <View
      style={{
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
        justifyContent: 'space-between',
        marginTop: statusbarHeight,
      }}>
      <View style={{flex: 1}}>
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
              if (props.navigation.canGoBack()) props.navigation.goBack();
              else props.navigation.reset({routes: [{name: 'DashboardRoot'}]});
            }}
            icon="close"
            color="white"
            size={18}
            style={{backgroundColor: 'rgba(255, 255, 255, 0.5)'}}
          />
          {/* {!props.isPictureTaken && (
            <IconButton
              onPress={() => props._onToggleTorchMode(!props.toggleTorchMode)}
              icon={props.toggleTorchMode ? 'flash' : 'flash-off'}
              color="white"
              size={18}
            />
          )} */}
        </View>
      </View>
      {props.isPictureTaken && (
        <View
          style={{
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}>
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              width: '100%',
              paddingVertical: 12,
              paddingHorizontal: 14,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <TouchableOpacity
              activeOpacity={0.5}
              onPress={
                props.isPictureTaken ? props._resetCamera : props._takePicture
              }
              style={{
                transform: [{scale: 1.05}],
                height: 60,
                width: 60,
                borderRadius: 30,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2.5,
                borderColor: '#8d8d8d',
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  height: 46,
                  width: 46,
                  borderRadius: 25,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <IconButton
                  icon={props.isPictureTaken ? 'refresh' : 'camera'}
                  size={props.isPictureTaken ? 24 : 21}
                />
              </View>
            </TouchableOpacity>
            {props.isPictureTaken && (
              <Button
                title={!props._isSubmitSuccess ? 'Upload' : 'Done'}
                type="solid"
                disabled={props._isSubmitSuccess}
                disabledStyle={{backgroundColor: '#2D8ADC'}}
                disabledTitleStyle={{color: '#ffffff'}}
                icon={
                  props._isSubmitSuccess && {
                    name: 'check',
                    size: 15,
                    color: 'white',
                  }
                }
                iconRight
                loading={props._isSubmitLoading}
                onPress={props._upload}
                buttonStyle={{
                  paddingVertical: 6,
                  paddingRight: 16,
                  paddingLeft: !props._isSubmitSuccess ? 16 : 22,
                  width: 100,
                  backgroundColor: '#931C20',
                }}
              />
            )}
            {props.isPictureTaken && (
              <TouchableOpacity
                activeOpacity={0.5}
                onPress={() => props.navigation.navigate('BarcodeScanModal')}
                style={{
                  transform: [{scale: 1.05}],
                  height: 60,
                  width: 60,
                  borderRadius: 30,
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2.5,
                  borderColor: '#8d8d8d',
                }}>
                <View
                  style={{
                    backgroundColor: 'white',
                    height: 46,
                    width: 46,
                    borderRadius: 25,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Icon
                    type="font-awesome-5"
                    name="barcode"
                    color="#000000"
                    style={{height: 20, marginTop: -4}}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

const CaptureBarcode = props => {
  const authContext = useContext(AuthContext);
  const cameraRef = useRef(null);
  const [toggleTorchMode, setTorchMode] = useState(false);
  const [isPictureTaken, setIsPictureTaken] = useState(false);
  const [pictureDataBase64, setPictureBase64] = useState('');
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  const backAction = () => {
    StatusBar.setBackgroundColor('#800000');
    StatusBar.setBarStyle('light-content');
  };

  useEffect(() => {
    const {data_base64} = props.route.params;
    if (data_base64) {
      setPictureBase64(data_base64);
      setIsPictureTaken(true);
    }
  }, []);

  useEffect(() => {
    props.navigation.addListener('focus', () => {
      BackHandler.addEventListener('hardwareBackPress', backAction);
    });

    props.navigation.addListener('blur', () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    });

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backAction);
    };
  }, []);

  const takePicture = async () => {
    if (cameraRef.current) {
      const options = {
        quality: 0.5,
        base64: true,
        orientation: getOrientation() === 'PORTRAIT' ? 'portrait' : 'auto',
      };
      await cameraRef.current
        .takePictureAsync(options)
        .then(data => {
          console.log(data.uri);
          setPictureBase64(data.uri);
          setIsPictureTaken(true);
        })
        .catch(err => console.log(err));
    }
  };

  const _onOpenCameraPress = () => {
    ImagePicker.openCamera({mediaType: 'photo', includeBase64: true})
      .then(res => {
        setPictureBase64(`data:${res.mime};base64,${res.data}`);
        setIsPictureTaken(true);
      })
      .catch(err => console.log(err));
  };

  const _onOpenGalleryPress = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: false,
      includeBase64: true,
    })
      .then(image_info => {
        setPictureBase64(`data:${image_info.mime};base64,${image_info.data}`);
        setIsPictureTaken(true);
      })
      .catch(err => console.log(err));
  };

  const uploadBarcodeImage = async () => {
    setIsSubmitLoading(true);
    const token = await AsyncStorage.getItem('token');
    const headers = {
      Authorization: `Bearer ${token}`,
    };
    const data = {
      barcode_image: pictureDataBase64,
    };
    axios
      .post(
        UNIVERSAL_ENTRY_POINT_ADDRESS +
          API_ROUTES_PATH +
          STORE_BARCODE_IMAGE_API_KEY,
        data,
        {
          headers,
        },
      )
      .then(res => {
        setIsSubmitSuccess(true);
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
        _apiErrorHandler(err, authContext);
      })
      .finally(() => {
        setIsSubmitLoading(false);
      });
  };

  return (
    <>
      <StatusBar
        showHideTransition="slide"
        translucent={true}
        backgroundColor="rgba(0, 0, 0, 0.3)"
      />
      <View style={{...styles.container}}>
        <CameraOverlay
          {...props}
          isPictureTaken={isPictureTaken}
          _resetCamera={() => {
            setIsPictureTaken(false);
            setIsSubmitSuccess(false);
            setIsSubmitLoading(false);
          }}
          _takePicture={takePicture}
          _backAction={backAction}
          _upload={uploadBarcodeImage}
          _isSubmitLoading={isSubmitLoading}
          _isSubmitSuccess={isSubmitSuccess}
          toggleTorchMode={toggleTorchMode}
          _onToggleTorchMode={bool => setTorchMode(bool)}
        />
        {pictureDataBase64 && isPictureTaken ? (
          <Image
            source={{uri: pictureDataBase64}}
            style={{flex: 1}}
            resizeMode="contain"
          />
        ) : (
          <>
            <View
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.4)',
                flex: 1,
                ...StyleSheet.absoluteFillObject,
                zIndex: 10,
              }}>
              <Modal
                onRequestClose={() => setIsPictureTaken(true)}
                visible={!isPictureTaken}
                animationType="fade"
                transparent
                style={{flex: 1}}>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                  <View
                    style={{
                      width: '80%',
                      maxHeight: 360,
                      backgroundColor: 'white',
                      borderRadius: 6,
                    }}>
                    <CameraTypeSelection
                      _openCamera={_onOpenCameraPress}
                      _openGallery={_onOpenGalleryPress}
                    />
                  </View>
                </View>
              </Modal>
            </View>
            <RNCamera
              ref={cameraRef}
              style={styles.preview}
              type={RNCamera.Constants.Type.back}
              flashMode={
                RNCamera.Constants.FlashMode[toggleTorchMode ? 'torch' : 'off']
              }
              androidCameraPermissionOptions={{
                title: 'Permission to use camera',
                message: 'We need your permission to use your camera',
                buttonPositive: 'Ok',
                buttonNegative: 'Cancel',
              }}
              captureAudio={false}
              useNativeZoom={true}
            />
          </>
        )}
      </View>
    </>
  );
};

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

export default CaptureBarcode;
