import { configureStore } from '@reduxjs/toolkit';
import bucketsReducer from './slices/bucketsSlice';
import leadsReducer from './slices/leadsSlice';

export const store = configureStore({
  reducer: {
    buckets: bucketsReducer,
    leads: leadsReducer,
  },
});

export default store;
