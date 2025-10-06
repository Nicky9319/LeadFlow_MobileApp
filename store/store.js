import { configureStore } from '@reduxjs/toolkit';
import bucketsReducer from './slices/bucketsSlice';

export const store = configureStore({
  reducer: {
    buckets: bucketsReducer,
  },
});

export default store;
