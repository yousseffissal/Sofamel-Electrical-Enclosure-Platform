import { configureStore } from "@reduxjs/toolkit";
import configuratorReducer from "./slices/configuratorSlice";

export const store = configureStore({
  reducer: {
    configurator: configuratorReducer,
  },
});