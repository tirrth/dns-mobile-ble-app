import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Dimensions,
} from 'react-native';
import Svg, {Path} from 'react-native-svg';
import {Input, Button} from 'react-native-elements';
import {AuthContext} from '../components/navigation/AuthProvider';
import {ScrollView} from 'react-native-gesture-handler';
import {connect} from 'react-redux';
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const WaveCurveBackground = () => {
  return (
    <View style={{flex: 1}}>
      <Svg
        height={100}
        width="100%"
        preserveAspectRatio="xMinYMin slice"
        viewBox="0 50 1440 320">
        <Path
          fill="#931C20"
          fill-opacity="1"
          d="M0,32L0,74.7C160,117,320,203,480,202.7C640,203,800,117,960,101.3C1120,85,1280,139,1360,165.3L1440,192L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z" // After some improvisations
        />
      </Svg>
      <View
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          marginTop: -30,
          backgroundColor: '#931C20',
        }}
      />
    </View>
  );
};

const InterfaceLogin = props => {
  const {interfaceLogin} = useContext(AuthContext);
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setPasswordVisibility] = useState(false);
  const [submitLoader, setSubmitLoader] = useState(false);
  const userIdInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const [inputErrMessages, setInputErrMessages] = useState({});

  useEffect(() => {
    if (!passwordInputRef.current) return;
    passwordInputRef.current.setNativeProps({
      style: {fontFamily: 'Roboto-Regular'},
    });
  }, [isPasswordVisible]);

  const _onLoginPress = () => {
    const {partnerId} = props.user_info;
    if (partnerId && userId && password) {
      setSubmitLoader(true);
      interfaceLogin(partnerId, userId, password)
        .then(res => res && props.navigation.navigate('BluetoothModule'))
        .catch(console.log)
        .finally(() => setSubmitLoader(false));
    }
    let inputErrMessages = {};
    !userId &&
      (inputErrMessages['userId'] = !userId
        ? 'User Id is required'
        : 'Invalid User Id');
    !password && (inputErrMessages['password'] = 'Password is required');
    setInputErrMessages(inputErrMessages);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        height: windowHeight,
        width: windowWidth,
      }}>
      <View
        style={{
          // marginTop: 40,
          marginTop: 80,
          marginBottom: 10,
          width: '70%',
          alignSelf: 'center',
        }}>
        <Image
          source={require('../assets/ble/app_interface.png')}
          style={{
            resizeMode: 'contain',
            width: '100%',
          }}
        />
        {/* <Image
          source={require('../assets/logo-mipmaps/DnS-1024px.png')}
          style={{
            resizeMode: 'contain',
            width: '100%',
          }}
        />
        <View>
          <Text
            style={{
              color: '#931C20',
              fontSize: 20,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}>
            App Interface
          </Text>
        </View> */}
      </View>
      <View style={{flex: 1}}>
        <WaveCurveBackground />
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            marginTop: 45,
            padding: 20,
          }}>
          <>
            <View style={{marginTop: 25}}>
              <Input
                errorMessage={inputErrMessages['userId']}
                onSubmitEditing={() => passwordInputRef.current.focus()}
                ref={userIdInputRef}
                value={userId}
                autoCapitalize="none"
                onChangeText={val => setUserId(val)}
                inputContainerStyle={{
                  borderBottomWidth: 0.4,
                  borderBottomColor: 'white',
                  color: 'white',
                }}
                inputStyle={{fontSize: 14, marginLeft: 4, color: 'white'}}
                placeholder="User Id"
                placeholderTextColor="white"
                leftIcon={{
                  type: 'font-awesome-5',
                  name: 'id-badge',
                  size: 16,
                  color: 'white',
                }}
                leftIconContainerStyle={{
                  marginLeft: 2,
                  width: 20,
                }}
              />

              <Input
                autoCapitalize="none"
                errorMessage={inputErrMessages['password']}
                onSubmitEditing={_onLoginPress}
                value={password}
                onChangeText={password => setPassword(password)}
                ref={passwordInputRef}
                textContentType="password"
                secureTextEntry={!isPasswordVisible}
                inputContainerStyle={{
                  borderBottomWidth: 0.4,
                  borderBottomColor: 'white',
                  color: 'white',
                }}
                inputStyle={{
                  fontSize: 14,
                  marginLeft: 4,
                  marginRight: 8,
                  color: 'white',
                }}
                placeholder="Password"
                placeholderTextColor="white"
                leftIcon={{
                  type: 'font-awesome-5',
                  name: 'key',
                  size: 16,
                  color: 'white',
                }}
                leftIconContainerStyle={{
                  marginLeft: 2,
                  width: 20,
                }}
                rightIcon={{
                  type: 'font-awesome-5',
                  name: isPasswordVisible ? 'eye-slash' : 'eye',
                  size: 16,
                  color: 'white',
                  onPress: () => setPasswordVisibility(!isPasswordVisible),
                }}
                rightIconContainerStyle={{
                  marginRight: !isPasswordVisible ? 2 : 1,
                }}
              />
            </View>
            <View style={{marginTop: 20}}>
              <Button
                onPress={_onLoginPress}
                buttonStyle={{backgroundColor: 'white'}}
                title="Login"
                titleStyle={{color: '#931C20', fontWeight: '700'}}
                raised
                loading={submitLoader}
                loadingProps={{color: '#931C20'}}
              />
            </View>
          </>
        </View>
      </View>
    </ScrollView>
  );
};

const mapStateToProps = ({user_info}) => ({user_info});

export default connect(mapStateToProps)(InterfaceLogin);
