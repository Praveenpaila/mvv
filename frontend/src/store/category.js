import { createSlice } from "@reduxjs/toolkit";

const categoryslice = createSlice({
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

export const { addCat } = categoryslice.actions;
export default categoryslice.reducer;
