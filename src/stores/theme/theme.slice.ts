import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type Theme = "dark" | "light" | "system";

export interface ThemeState {
  theme: Theme;
}

const initialState: ThemeState = {
  theme: (localStorage.getItem("vite-ui-theme") as Theme) || "system", 
};

export const namespace = "theme";

const themeSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setTheme(state, action: PayloadAction<Theme>) {
      state.theme = action.payload;
      localStorage.setItem("vite-ui-theme", action.payload);
    },
  },
});

export const { setTheme } = themeSlice.actions;
export default themeSlice.reducer;