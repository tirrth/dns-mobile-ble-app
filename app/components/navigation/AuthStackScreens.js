import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import Login from '../../screens/Login';

const AuthStack = createStackNavigator();

const AuthStackScreens = () => {
  return (
    <AuthStack.Navigator
      screenOptions={{header: () => null}}
      initialRouteName="Login">
      <AuthStack.Screen name="Login" component={Login} />
    </AuthStack.Navigator>
  );
};

export default AuthStackScreens;
