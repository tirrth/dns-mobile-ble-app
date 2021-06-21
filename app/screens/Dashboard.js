import React, {useState} from 'react';
import {View, Text, StyleSheet, Modal} from 'react-native';
import ScanBarcodeSVG from '../assets/svg/scan-barcode.svg';
import CaptureDamageSVG from '../assets/svg/capture-damage.svg';
import CaptureBarcodeSVG from '../assets/svg/capture-barcode.svg';
import {/* IconButton, */ Card} from 'react-native-paper';
// import Svg, {Path, Rect} from 'react-native-svg';
import CaptureDamages from './CaptureDamages';
import ImagePicker from 'react-native-image-crop-picker';
import CameraTypeSelection from '../components/CameraTypeSelection';
import DefaultHeader from '../components/DefaultHeader';
import {connect} from 'react-redux';

// const WaveCurveHeaderBackground = props => {
//   return (
//     <View style={{transform: [{rotateX: '180deg'}], ...props.style}}>
//       <Svg
//         height={100}
//         width="100%"
//         preserveAspectRatio="xMinYMin slice"
//         viewBox="0 0 1440 320">
//         <Path
//           fill="#931C20"
//           fill-opacity="1"
//           d="M0,32L0,74.7C160,117,320,203,480,202.7C640,203,800,117,960,101.3C1120,85,1280,139,1360,165.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"
//         />
//       </Svg>
//       <Svg height={50} width="100%">
//         <Rect x="0" y="0" width="100%" height="100%" fill="#931C20" />
//       </Svg>
//     </View>
//   );
// };

const Dashboard = props => {
  const [toggleCaptureDamagesModal, setCaptureDamagesModal] = useState(false);
  const [toggleCameraSelectionModal, setCameraSelectionModal] = useState(false);
  const {appInterfaceAccess: appAccess} = props.user_info;

  return (
    <>
      <View style={{flex: 1, backgroundColor: '#F0F0F0'}}>
        {toggleCaptureDamagesModal && (
          <CaptureDamages closeModal={() => setCaptureDamagesModal(false)} />
        )}
        {toggleCameraSelectionModal && (
          <CameraTypeSelectionModal
            {...props}
            toggleCameraSelectionModal={toggleCameraSelectionModal}
            setCameraSelectionModal={setCameraSelectionModal}
          />
        )}
        <View>
          <DefaultHeader {...props} title={'Dashboard'} />
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            marginTop: -100 /* 100 is the height of header component */,
          }}>
          {/* <View style={{alignItems: 'center', marginVertical: 10}}>
            <Card
              onPress={() => props.navigation?.navigate('BarcodeScanModal')}
              style={[
                {
                  width: '50%',
                  padding: 10,
                  paddingTop: 0,
                },
                (toggleCaptureDamagesModal || toggleCameraSelectionModal) && {
                  elevation: 0,
                },
              ]}>
              <View>
                <ScanBarcodeSVG width="100%" height={100} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: -8,
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                Scan Barcode
              </Text>
            </Card>
          </View> */}

          <View style={{alignItems: 'center', marginVertical: 10}}>
            <Card
              onPress={() => {
                const {navigate} = props.navigation;
                navigate(appAccess ? 'BluetoothModule' : 'InterfaceLogin');
              }}
              style={[
                {
                  width: '50%',
                  padding: 10,
                  paddingTop: 0,
                },
                (toggleCaptureDamagesModal || toggleCameraSelectionModal) && {
                  elevation: 0,
                },
              ]}>
              <View>
                <ScanBarcodeSVG width="100%" height={100} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: -8,
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                App Interface
              </Text>
            </Card>
          </View>
          {/* <View style={{alignItems: 'center', marginVertical: 10}}>
            <Card
              onPress={() => setCaptureDamagesModal(true)}
              style={{
                width: '50%',
                padding: 10,
                paddingTop: 0,
                elevation:
                  toggleCaptureDamagesModal || toggleCameraSelectionModal
                    ? 0
                    : 1,
              }}>
              <View style={{marginTop: 18, marginBottom: 20}}>
                <CaptureDamageSVG width="100%" height={60} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: -8,
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                Capture Damages
              </Text>
            </Card>
          </View>
          <View style={{alignItems: 'center', marginVertical: 10}}>
            <Card
              // onPress={() => props.navigation?.navigate('CaptureBarcodeModal')}
              onPress={() => setCameraSelectionModal(true)}
              style={[
                {
                  width: '50%',
                  padding: 10,
                  paddingTop: 0,
                },
                toggleCaptureDamagesModal || toggleCameraSelectionModal
                  ? {elevation: 0}
                  : {elevation: 1},
              ]}>
              <View style={{marginTop: 16, marginBottom: 20}}>
                <CaptureBarcodeSVG width="100%" height={60} />
              </View>
              <Text
                style={{
                  fontWeight: '700',
                  marginTop: -8,
                  fontSize: 16,
                  textAlign: 'center',
                }}>
                Capture Barcode
              </Text>
            </Card>
          </View> */}
        </View>
      </View>
    </>
  );
};

const CameraTypeSelectionModal = props => {
  return (
    <View
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        flex: 1,
        ...StyleSheet.absoluteFillObject,
        zIndex: 10,
      }}>
      <Modal
        visible={props.toggleCameraSelectionModal}
        onRequestClose={() => props.setCameraSelectionModal(false)}
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
              _openCamera={() =>
                ImagePicker.openCamera({
                  mediaType: 'photo',
                  includeBase64: true,
                })
                  .then(res => {
                    props.navigation.navigate('CaptureBarcodeModal', {
                      data_base64: `data:${res.mime};base64,${res.data}`,
                    });
                  })
                  .catch(err => {
                    console.log(err);
                  })
                  .finally(() => {
                    props.setCameraSelectionModal(false);
                  })
              }
              _openGallery={() =>
                ImagePicker.openPicker({
                  mediaType: 'photo',
                  multiple: false,
                  includeBase64: true,
                })
                  .then(image_info => {
                    props.navigation.navigate('CaptureBarcodeModal', {
                      data_base64: `data:${image_info.mime};base64,${image_info.data}`,
                    });
                  })
                  .catch(err => {
                    console.log(err);
                  })
                  .finally(() => {
                    props.setCameraSelectionModal(false);
                  })
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const mapStateToProps = ({user_info}) => ({user_info});

export default connect(mapStateToProps)(Dashboard);
