import {ToastAndroid} from 'react-native';
import {isFunction} from 'lodash';
import Snackbar from 'react-native-snackbar';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ToastMessage = (...args) => {
  let message = '';
  for (let msg of args) {
    message += ` ${msg}`;
  }
  ToastAndroid.showWithGravityAndOffset(
    message.trim(),
    ToastAndroid.SHORT,
    ToastAndroid.BOTTOM,
    25,
    50,
  );
};

export const _validateEndpoint = linkAddress => {
  const regexLink = /^http:\/\/\w+(\.\w+)*(:[0-9]+)?\/?/;
  if (linkAddress.match(regexLink)) {
    return true;
  }
  return false;
};

export function _validateEmail(emailAddress) {
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (emailAddress.match(regexEmail)) {
    return true;
  }
  return false;
}

export const _apiErrorHandler = (err = {}, authContext, errStatusMsgs = {}) => {
  // ------------------------ Status specific error messages ------------------------ //
  let status = parseInt(err.response?.status);
  status = isNaN(status) ? 0 : status;

  if (!err.response || !status) {
    Snackbar.show({
      text: 'Could not connect to the Network',
      duration: Snackbar.LENGTH_LONG,
    }); /* Connection error */
    return;
  }

  if (errStatusMsgs[status]?.msg) {
    ToastMessage(errStatusMsgs[status]?.msg);
    return;
  } else if (isFunction(errStatusMsgs[status]?.callback)) {
    errStatusMsgs[status]?.callback();
    return;
  }

  if (status == 401) {
    if (!authContext) {
      ToastMessage('You are unauthorized');
      return;
    }
    AsyncStorage.setItem('token', '').catch(err => null);
    authContext.setToken?.('');
    Snackbar.show({
      text: 'You are unauthorized. Login Again',
      duration: Snackbar.LENGTH_LONG,
    });
    return;
  } else if (status == 500) {
    ToastMessage('Internal server error');
    return;
  } else if (
    status == 422 ||
    Array.isArray(err.response?.data?.validation_errors)
  ) {
    let error_msg = '';
    const {validation_errors} = err.response.data;
    Object.values(validation_errors).map(
      error_arr =>
        Array.isArray(error_arr) &&
        error_arr.map(error => (error_msg = `${`${error}`.trim()} `)), // <-- OR --> (error => ((error = `${error}`.trim()), (error_msg = `${error} `))),
    );
    error_msg = error_msg.trimEnd();
    ToastMessage(error_msg || 'Unprocessable Entity');
    return;
  }

  // ------------------------ Default error message ------------------------ //
  ToastMessage(
    err.response?.data?.message || 'An error occurred while processing',
  );
};
