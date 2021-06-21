import React from 'react';
import {View} from 'react-native';
import DefaultHeader from '../components/DefaultHeader';
import {AuthContext} from '../components/navigation/AuthProvider';

class Settings extends React.Component {
  render() {
    return (
      <AuthContext.Consumer>
        {value => {
          const {logout} = value;
          return (
            <View style={{flex: 1, backgroundColor: '#F0F0F0'}}>
              <DefaultHeader {...this.props} title={'Settings'} />
              <View></View>
            </View>
          );
        }}
      </AuthContext.Consumer>
    );
  }
}

export default Settings;
