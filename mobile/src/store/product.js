import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    products: [],
  },
  reducers: {
    add: (state, action) => {
      state.products = action.payload;
    },
  },
});

export const { add } = productSlice.actions;
export default productSlice.reducer;
