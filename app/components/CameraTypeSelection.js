import React from 'react';
import {Text} from 'react-native';
import {List} from 'react-native-paper';

const CameraTypeSelection = props => {
  return (
    <>
      <List.Section>
        <List.Subheader>
          <Text style={{fontSize: 16}}>Select Type</Text>
        </List.Subheader>
        <List.Item
          onPress={props._openCamera}
          title="Open Camera"
          left={() => <List.Icon icon="camera" />}
        />
        <List.Item
          onPress={props._openGallery}
          title="Select from Phone"
          left={() => <List.Icon icon="google-photos" />}
        />
      </List.Section>
    </>
  );
};
export default CameraTypeSelection;
