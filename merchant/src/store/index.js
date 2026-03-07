import { configureStore } from "@reduxjs/toolkit";
import categoryReducer from "./category";
import productReducer from "./product";
import cartReducer from "./cart";
import addressReducer from "./address";
const store = configureStore({
  reducer: {
    category: categoryReducer,
    product: productReducer,
    cart: cartReducer,
    address: addressReducer,
  },
});

export default store;
