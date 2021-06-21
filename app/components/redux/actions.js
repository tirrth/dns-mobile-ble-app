import {CHANGE_USER_INFO} from './action-types';

export function changeUserInfo(payload = {}) {
  return {type: CHANGE_USER_INFO, payload};
}
