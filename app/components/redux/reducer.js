import {CHANGE_USER_INFO} from './action-types';

const initialState = {
  user_info: {},
};

const rootReducer = (state = initialState, action) => {
  if (action.type === CHANGE_USER_INFO) {
    console.log(action);
    return {
      ...state,
      user_info: {...state.user_info, ...action.payload},
    };
  }
  return state;
};

export default rootReducer;
