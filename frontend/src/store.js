import { configureStore } from "@reduxjs/toolkit";

// Slices
import authReducer from "./slices/authSlices";
import userReducer from "./slices/userSlices";
import photoReducer from "./slices/photoSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        photo: photoReducer
    }
});