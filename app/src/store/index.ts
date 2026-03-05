// SMTU-TAU/app/src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { directionSlice } from "./slices/directionSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      direction: directionSlice.reducer,
    },
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
