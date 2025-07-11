import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { useDispatch, useSelector, useStore } from 'react-redux'
import themeReducer, { namespace as themeNamespace } from './theme/theme.slice';
import { bridgeApi } from '../services/bridge';
import { stargateApi } from '@/services/stargate-bridge';
import { layerZeroScanApi } from '@/services/layerzero-scan';
import { stargateTransactionApi } from '@/services/stargate-transaction';
import { preSaleAuthApi } from '@/services/pre-sale/pre-sale-auth';
import { preSaleTokenManagementApi } from '@/services/pre-sale/pre-sale-token';
import { uploadApi } from '@/services/upload';
import { preSaleCreateTokenApi } from '@/services/pre-sale/create-token';
import { preSaleApi } from '@/services/pre-sale/presales';
import { preSaleGeneralApi } from '@/services/pre-sale/pre-sale-general';

export const listenerMiddleware = createListenerMiddleware({
  onError: () => console.error('An error listener middleware occurred'),
});


const reducer = {
  [themeNamespace]: themeReducer,
  [bridgeApi.reducerPath]: bridgeApi.reducer,
  [uploadApi.reducerPath]: uploadApi.reducer,
  [preSaleCreateTokenApi.reducerPath]: preSaleCreateTokenApi.reducer,
  [stargateApi.reducerPath]: stargateApi.reducer,
  [layerZeroScanApi.reducerPath]: layerZeroScanApi.reducer,
  [stargateTransactionApi.reducerPath]: stargateTransactionApi.reducer,
  // pre-sale
  [preSaleAuthApi.reducerPath]: preSaleAuthApi.reducer,
  [preSaleTokenManagementApi.reducerPath]: preSaleTokenManagementApi.reducer,
  [preSaleApi.reducerPath]: preSaleApi.reducer,
  [preSaleGeneralApi.reducerPath]: preSaleGeneralApi.reducer,
  
};

export const store = configureStore({
  reducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware()
    .concat(
      bridgeApi.middleware,
      uploadApi.middleware,
      stargateApi.middleware,
      layerZeroScanApi.middleware,
      preSaleCreateTokenApi.middleware,
      stargateTransactionApi.middleware,
      // pre-sale
      preSaleAuthApi.middleware,
      preSaleTokenManagementApi.middleware,
      preSaleApi.middleware,
      preSaleGeneralApi.middleware
    )
    .prepend(listenerMiddleware.middleware)
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = typeof store.dispatch;

export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppStore = useStore.withTypes<AppStore>()

