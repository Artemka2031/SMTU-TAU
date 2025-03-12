import {configureStore} from "@reduxjs/toolkit";
// Импортируем ваши слайсы, если будут.
// Для простоты создадим один slice ниже.
import {directionSlice} from "./slices/directionSlice";

export const store = configureStore({
    reducer: {
        direction: directionSlice.reducer,
        // ...другие редьюсеры
    },
});

// Тип корневого состояния
export type RootState = ReturnType<typeof store.getState>;
// Тип dispatch
export type AppDispatch = typeof store.dispatch;
