import React, {useContext} from 'react';
import {View, StyleSheet, Alert} from 'react-native';
import {DrawerContentScrollView, DrawerItem} from '@react-navigation/drawer';
import {Icon} from 'react-native-elements';
import AvatarImage from 'react-native-paper/lib/commonjs/components/Avatar/AvatarImage';
import Title from 'react-native-paper/lib/commonjs/components/Typography/Title';
import Caption from 'react-native-paper/lib/commonjs/components/Typography/Caption';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AuthContext} from './AuthProvider';
import {useSelector} from 'react-redux';

const DrawerContent = ({...props}) => {
  const user_info = useSelector(state => state.user_info);
  const {logout} = useContext(AuthContext);

  const _signOut = async () => {
    props.navigation.closeDrawer();
    Alert.alert(
      'Confirmation',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            try {
              logout();
            } catch (err) {
              console.log(err);
            }
          },
        },
      ],
      {cancelable: true},
    );
  };

  const {state} = props;
  const {index} = state;
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <View
          style={{
            ...styles.userInfoSection,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 50,
            marginBottom: 20,
          }}>
          <AvatarImage
            source={require('../../assets/default_profile.png')}
            size={70}
            style={{backgroundColor: 'transparent'}}
          />
          {Object.keys(user_info).length ? (
            <View style={{alignSelf: 'center', marginLeft: 20}}>
              <Title
                style={{
                  ...styles.title,
                }}>
                {user_info.name}
              </Title>

              <Caption style={styles.caption}>{user_info.email}</Caption>
            </View>
          ) : null}
        </View>

        <View>
          <DrawerItem
            focused={index === 0 ? true : false}
            icon={({color, size}) => (
              <Icon name="dashboard" color={color} size={size} />
            )}
            label="Dashboard"
            onPress={() =>
              props.navigation.reset({routes: [{name: 'DashboardRoot'}]})
            }
          />
        </View>

        {/* <View>
          <DrawerItem
            focused={index === 1 ? true : false}
            icon={({color, size}) => (
              <Icon name="settings" color={color} size={size} />
            )}
            label="Settings"
            onPress={() =>
              props.navigation.reset({routes: [{name: 'SettingsRoot'}]})
            }
          />
        </View> */}
      </DrawerContentScrollView>

      <SafeAreaView>
        <View style={styles.bottomDrawerSection}>
          <DrawerItem
            icon={({color, size}) => (
              <Icon name="exit-to-app" color={color} size={size} />
            )}
            label="Sign Out"
            onPress={() => _signOut()}
          />
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#e9e9e9',
    borderRadius: 4,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  caption: {
    fontSize: 13,
    lineHeight: 14,
    marginTop: -3,
  },
  bottomDrawerSection: {
    marginBottom: 10,
    borderColor: '#f1f1f1',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingTop: 2,
    paddingBottom: 2,
  },
});

export default DrawerContent;
