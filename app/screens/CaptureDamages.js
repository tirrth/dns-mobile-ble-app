import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  FlatList,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import {Button, IconButton} from 'react-native-paper';
import ImagePicker from 'react-native-image-crop-picker';
import CameraTypeSelection from '../components/CameraTypeSelection';

export default class CaptureDamages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      damageImages: [],
      toggleImageView: false,
    };
  }

  _onOpenCameraPress = () => {
    ImagePicker.openCamera({mediaType: 'photo'})
      .then(res => {
        console.log(res);
        this.setState(states => {
          return {
            ...states,
            damageImages: [
              ...states.damageImages.filter(image => image.uri),
              {uri: res.path},
            ],
          };
        });
      })
      .catch(err => {
        console.log(err);
        !this.state.damageImages.length && this.props.closeModal();
      });
  };

  _onOpenGalleryPress = () => {
    ImagePicker.openPicker({
      mediaType: 'photo',
      multiple: true,
      maxFiles: 4,
      minFiles: 1,
    })
      .then(images_info => {
        const images = images_info.map(image_info => {
          return {uri: image_info.path};
        });
        this.setState(states => {
          return {
            ...states,
            damageImages: [
              ...states.damageImages.filter(image => image.uri),
              ...images,
            ],
          };
        });
      })
      .catch(err => {
        console.log(err);
        !this.state.damageImages.length && this.props.closeModal();
      });
  };

  _renderDamageImage = ({item, index}) => {
    return (
      <View style={{width: '30%', height: 90}}>
        {item.open_camera && (
          <Pressable
            onPress={this._onOpenCameraPress}
            style={{
              flex: 1,
              borderRadius: 2,
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <IconButton
              onPress={this._onOpenCameraPress}
              icon="camera"
              color="#8d8d8d"
              size={30}
            />
          </Pressable>
        )}
        {item.open_gallery && (
          <Pressable
            onPress={this._onOpenGalleryPress}
            style={{
              flex: 1,
              borderRadius: 2,
              backgroundColor: '#f0f0f0',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <IconButton
              onPress={this._onOpenGalleryPress}
              icon="google-photos"
              color="#8d8d8d"
              size={30}
            />
          </Pressable>
        )}
        {item.uri && (
          <TouchableOpacity
            activeOpacity={0.8}
            containerStyle={{flex: 1}}
            style={{flex: 1}}
            delayLongPress={250}
            onPress={() =>
              this.state.toggleImageView &&
              this.setState(states => {
                return {
                  ...states,
                  damageImages: [
                    ...states.damageImages.filter(image => image.uri),
                  ],
                  toggleImageView: !states.toggleImageView,
                };
              })
            }
            onLongPress={() =>
              this.setState(states => {
                return {
                  ...states,
                  damageImages: states.damageImages.filter(image => image.uri),
                  toggleImageView: !states.toggleImageView,
                };
              })
            }>
            <ImageBackground
              style={{flex: 1}}
              imageStyle={{borderRadius: 2}}
              source={item}
              resizeMode="cover">
              {this.state.toggleImageView && (
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: '100%',
                    borderRadius: 2,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  }}>
                  <IconButton
                    icon="minus"
                    color="white"
                    size={16}
                    onPress={() => {
                      this.setState(states => {
                        states.damageImages.splice(index, 1);
                        return {
                          ...states,
                          damageImages: states.damageImages.filter(
                            image => image.uri,
                          ),
                        };
                      });
                    }}
                    style={{backgroundColor: 'rgba(255, 255, 255, 0.3)'}}
                  />
                </View>
              )}
            </ImageBackground>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  _formatData = (data, numColumns) => {
    data.push({open_camera: true}, {open_gallery: true});
    let formatted_data = data;
    const numOfFullRows = Math.floor(formatted_data.length / numColumns);
    let numOfElementsLastRow =
      formatted_data.length - numOfFullRows * numColumns;
    while (numOfElementsLastRow !== numColumns && numOfElementsLastRow !== 0) {
      formatted_data.push({
        empty: true,
      });
      numOfElementsLastRow++;
    }
    return formatted_data;
  };

  render() {
    const {damageImages} = this.state;
    return (
      <View
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          flex: 1,
          ...StyleSheet.absoluteFillObject,
          zIndex: 10,
        }}>
        <Modal
          onRequestClose={this.props.closeModal}
          visible
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
                width: damageImages.length ? '90%' : '80%',
                maxHeight: 360,
                backgroundColor: 'white',
                borderRadius: 6,
              }}>
              {!damageImages.length ? (
                <CameraTypeSelection
                  _openCamera={this._onOpenCameraPress}
                  _openGallery={this._onOpenGalleryPress}
                />
              ) : (
                <>
                  <View
                    style={{
                      height: 50,
                      width: '100%',
                      backgroundColor: 'white',
                      borderTopLeftRadius: 6,
                      borderTopRightRadius: 6,
                      elevation: 2,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingHorizontal: 10,
                    }}>
                    <Text style={{fontSize: 17, fontWeight: '700'}}>
                      Capture Damages
                    </Text>
                    {damageImages.length && (
                      <Button
                        loading={false}
                        mode="contained"
                        color="#931C20"
                        onPress={() => null}>
                        Upload
                      </Button>
                    )}
                  </View>
                  <FlatList
                    showsVerticalScrollIndicator={false}
                    data={this._formatData(damageImages, 3)}
                    numColumns={3}
                    renderItem={this._renderDamageImage}
                    keyExtractor={(item, index) => `${index}`}
                    columnWrapperStyle={{
                      justifyContent: 'space-evenly',
                      marginBottom: 6,
                    }}
                    contentContainerStyle={{paddingVertical: 8}}
                  />
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}
