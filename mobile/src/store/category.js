import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    category: [],
  },
  reducers: {
    addCat: (state, action) => {
      state.category = action.payload;
    },
  },
});

export const { addCat } = categorySlice.actions;
export default categorySlice.reducer;
