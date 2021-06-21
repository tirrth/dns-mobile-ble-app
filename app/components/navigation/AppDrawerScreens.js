import React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';
import {createStackNavigator} from '@react-navigation/stack';
import Dashboard from '../../screens/Dashboard';
import Settings from '../../screens/Settings';
import DrawerContent from './DrawerContent';
import BarcodeScan from '../../screens/BarcodeScan';
import CaptureBarcode from '../../screens/CaptureBarcode';
import BluetoothModule from '../../screens/BluetoothModule';
import {getFocusedRouteNameFromRoute} from '@react-navigation/native';
import InterfaceLogin from '../../screens/InterfaceLogin';

const AppDrawer = createDrawerNavigator();
const DashboardStack = createStackNavigator();
const SettingsStack = createStackNavigator();

const DashboardStackScreens = () => {
  return (
    <DashboardStack.Navigator
      initialRouteName="Dashboard"
      mode="modal"
      screenOptions={{headerShown: false}}>
      <DashboardStack.Screen name="Dashboard" component={Dashboard} />
      <DashboardStack.Screen name="BarcodeScanModal" component={BarcodeScan} />
      <DashboardStack.Screen
        name="CaptureBarcodeModal"
        component={CaptureBarcode}
      />
      <DashboardStack.Screen
        name="BluetoothModule"
        component={BluetoothModule}
      />
      <DashboardStack.Screen name="InterfaceLogin" component={InterfaceLogin} />
    </DashboardStack.Navigator>
  );
};

export const SettingsStackScreens = () => {
  return (
    <SettingsStack.Navigator
      initialRouteName="Settings"
      screenOptions={{headerShown: false}}>
      <SettingsStack.Screen name="Settings" component={Settings} />
    </SettingsStack.Navigator>
  );
};

const AppDrawerScreens = () => {
  const swipeDisabledRoutes = ['BarcodeScanModal', 'CaptureBarcodeModal'];
  const _isSwipeEnabled = route => {
    const routeName = getFocusedRouteNameFromRoute(route);
    return !swipeDisabledRoutes.includes(routeName);
  };

  return (
    <AppDrawer.Navigator
      initialRouteName="DashboardRoot"
      backBehavior="initialRoute"
      drawerType="slide"
      drawerContent={props => <DrawerContent {...props} />}>
      <AppDrawer.Screen
        name="DashboardRoot"
        component={DashboardStackScreens}
        options={({route}) => {
          return {
            swipeEnabled: _isSwipeEnabled(route),
          };
        }}
      />
      <AppDrawer.Screen
        name="SettingsRoot"
        component={SettingsStackScreens}
        options={({route}) => {
          return {
            swipeEnabled: _isSwipeEnabled(route),
          };
        }}
      />
    </AppDrawer.Navigator>
  );
};

export default AppDrawerScreens;
