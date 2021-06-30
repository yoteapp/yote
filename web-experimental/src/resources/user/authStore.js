import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

import apiUtils from '../../global/utils/api';

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const sendLogin = createAsyncThunk(
  'auth/sendLogin',
  async (userInfo) => {
    const response = await apiUtils.callAPI('/api/users/login', 'POST', userInfo);
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

export const sendLogout = createAsyncThunk(
  'auth/sendLogout',
  async () => {
    const response = await apiUtils.callAPI('/api/users/logout', 'POST');
    // The value we return becomes the `fulfilled` action payload
    return response;
  }
);

export const authStore = createSlice({
  name: 'auth',
  initialState: {
    loggedInUser: null,
    status: 'idle',
    error: null,
  },
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    // none needed here
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {
    builder
      .addCase(sendLogin.pending, (state) => {
        state.status = 'loading';
        state.error = null
      })
      .addCase(sendLogin.fulfilled, (state, {payload}) => {
        console.log('state', state);
        console.log('payload', payload);
        if(payload.success) {
          state.status = 'idle';
          state.loggedInUser = payload.user;
        } else {
          state.status = 'error'
          state.error = payload.message
        }
      })
      .addCase(sendLogin.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error
      })
      .addCase(sendLogout.pending, (state) => {
        state.status = 'loading';
        state.error = null
      })
      .addCase(sendLogout.fulfilled, (state) => {
        state.status = 'idle';
        state.loggedInUser = null
      })
      .addCase(sendLogout.rejected, (state, action) => {
        state.status = 'error'
        state.error = action.error
      })
  }
});





// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
/**
 * 
 * @returns logged in user object
 */
export const getLoggedInUser = ({auth}) => {
  return auth.loggedInUser;
}

export default authStore.reducer;

