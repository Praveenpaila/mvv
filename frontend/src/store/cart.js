import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    cart: [],
    cartTotal: 0,
  },
  reducers: {
    clearCart: (state) => {
      state.cart = [];
    },
    addToCart: (state, action) => {
      const { _id, quantity } = action.payload;
      if (!_id) return;

      const itemIndex = state.cart.findIndex((i) => i._id === _id);

      if (itemIndex >= 0) {
        state.cart[itemIndex].quantity = Math.max(0, quantity);
      } else {
        state.cart.push({ _id, quantity: Math.max(0, quantity) });
      }
    },

    removeItem: (state, action) => {
      state.cart = state.cart.filter((i) => i._id !== action.payload);
    },

    total: (state, action) => {
      state.cartTotal = action.payload;
    },
  },
});

export const { addToCart, removeItem, total, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
