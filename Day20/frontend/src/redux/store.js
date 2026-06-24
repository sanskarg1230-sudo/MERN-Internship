import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import courseReducer from './slices/courseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    courses: courseReducer,
    // Other reducers will go here (courses, quizzes, etc)
  },
  devTools: process.env.NODE_ENV !== 'production',
});
