import 'react-native-gesture-handler';
import React, {useContext, useEffect, useState} from 'react';
import {NavigationContainer} from '@react-navigation/native';
import LottieView from 'lottie-react-native';
import {AuthContext} from './AuthProvider';
import AuthStackScreens from './AuthStackScreens';
import AppDrawerScreens from './AppDrawerScreens';
import {View, StyleSheet, StatusBar} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from 'react-native-splash-screen';
import {connect} from 'react-redux';
import {CHANGE_USER_INFO} from '../redux/action-types';

const Routes = props => {
  const {token, setToken} = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const app_access = await AsyncStorage.getItem('app_interface_access');
        if (token) {
          setToken(token);
          props.changeUserInfo({
            partnerId: token,
            appInterfaceAccess: !!app_access,
          });
        }
        setIsLoading(false);
        // refreshToken(token)
        //   .catch(err => null)
        //   .finally(() => {
        //     setIsLoading(false);
        //   });
      } catch (err) {
        console.log(err);
        setToken('');
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    !isLoading && SplashScreen.hide();
  }, [isLoading]);

  return (
    <>
      <StatusBar
        translucent
        backgroundColor="#800000"
        barStyle="light-content"
      />
      {isLoading ? (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <LottieView
            style={{width: '100%', height: 200}}
            source={require('../../assets/animations/launch_screen_car_anim.json')}
            autoPlay
            loop
          />
        </View>
      ) : (
        <NavigationContainer>
          {token ? <AppDrawerScreens /> : <AuthStackScreens />}
        </NavigationContainer>
      )}
    </>
  );
};

const mapDispatchToProps = dispatch => {
  return {
    changeUserInfo: user_info => {
      dispatch({type: CHANGE_USER_INFO, payload: {...user_info}});
    },
  };
};

export default connect(null, mapDispatchToProps)(Routes);
