import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  name: '',
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login(state, action) {
      state.name = action.payload;
      state.isLoggedIn = true;
    },
    logout(state) {
      state.name = '';
      state.isLoggedIn = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
