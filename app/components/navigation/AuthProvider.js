import React, {createContext, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {
  UNIVERSAL_ENTRY_POINT_ADDRESS,
  API_ROUTES_PATH,
  APP_INTERFACE_LOGIN_API_KEY,
  REFRESH_TOKEN_API_KEY,
  LOGIN_API_KEY,
} from '@env';
import {useDispatch} from 'react-redux';
import {changeUserInfo} from '../redux/actions';
import {ToastMessage, _apiErrorHandler} from '../util';

export const AuthContext = createContext();
export const AuthProvider = ({children}) => {
  const [token, setToken] = useState('');
  const dispatch = useDispatch();
  const _toBool = str => str === 'true';

  const authContext = React.useMemo(() => {
    return {
      token,
      setToken,
      login: async (partnerId, userId, password) => {
        if (!partnerId) {
          throw new Error('Partner Id is required!');
        }
        if (!userId) {
          throw new Error('User Id is required!');
        }
        if (!password) {
          throw new Error('Password is required!');
        }

        return axios
          .post(
            UNIVERSAL_ENTRY_POINT_ADDRESS + API_ROUTES_PATH + LOGIN_API_KEY,
            {
              partnerId,
              username: userId,
              password,
            },
          )
          .then(async res => {
            if (res?.data?.result === 'success') {
              await AsyncStorage.setItem('token', partnerId);
              setToken(partnerId);
              dispatch(changeUserInfo({partnerId}));
              return true;
            }
            ToastMessage('Incorrect credentials');
            return false;
          })
          .catch(async err => {
            await AsyncStorage.setItem('token', '');
            setToken('');
            const errors = {401: {msg: 'Invalid credentials', callback: null}};
            _apiErrorHandler(err, null, {401: errors[401]});
            throw err;
          });
      },
      interfaceLogin: async (partnerId, userId, password) => {
        if (!partnerId) {
          throw new Error('Partner Id is required!');
        }
        if (!userId) {
          throw new Error('User Id is required!');
        }
        if (!password) {
          throw new Error('Password is required!');
        }

        return axios
          .post(
            UNIVERSAL_ENTRY_POINT_ADDRESS +
              API_ROUTES_PATH +
              APP_INTERFACE_LOGIN_API_KEY,
            {
              partnerId,
              username: userId,
              password,
            },
          )
          .then(async res => {
            if (_toBool(res?.data?.success)) {
              await AsyncStorage.setItem('app_interface_access', 'true');
              dispatch(changeUserInfo({appInterfaceAccess: true}));
              return true;
            }
            ToastMessage('Incorrect credentials');
            return false;
          })
          .catch(async err => {
            await AsyncStorage.removeItem('app_interface_access');
            const errors = {401: {msg: 'Invalid credentials', callback: null}};
            _apiErrorHandler(err, null, {401: errors[401]});
            throw err;
          });
      },
      logout: async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('app_interface_access');
        dispatch(changeUserInfo({appInterfaceAccess: false, partnerId: ''}));
        setToken('');
      },
      refreshToken: async authToken => {
        console.log('authToken =', authToken);
        const UNIVERSAL_ENTRY = UNIVERSAL_ENTRY_POINT_ADDRESS;
        return axios
          .get(UNIVERSAL_ENTRY + API_ROUTES_PATH + REFRESH_TOKEN_API_KEY, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          })
          .then(res => {
            setToken('res.data.token'); // Next two line is just for testing purpose
            return true;
          })
          .catch(err => {
            setToken('res.data.token'); // Next two line is just for testing purpose
            return true;
          });
      },
    };
  });

  return (
    <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>
  );
};
