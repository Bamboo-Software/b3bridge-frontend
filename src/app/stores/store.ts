import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux'
import themeReducer, { namespace as themeNamespace } from './theme/theme.slice';
import { bridgeApi } from '../services/bridge';

export const listenerMiddleware = createListenerMiddleware({
  onError: () => console.error('An error listener middleware occurred'),
});


const reducer = {
  [themeNamespace]: themeReducer,
  [bridgeApi.reducerPath]: bridgeApi.reducer,
};

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
    .concat(
      bridgeApi.middleware
    )
    .prepend(listenerMiddleware.middleware)
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppStore = useStore.withTypes<AppStore>()

