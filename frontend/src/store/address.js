import { createSlice } from "@reduxjs/toolkit";

const addressSlice = createSlice({
  name: "address",
  initialState: {
    address: [],
  },
  reducers: {
    // expects ARRAY from backend
    addAddress: (state, action) => {
      state.address = action.payload;
    },

    removeAddress: (state, action) => {
      state.address = state.address.filter(
        (addr) => addr._id !== action.payload,
      );
    },
  },
});

export const { addAddress, removeAddress } = addressSlice.actions;
export default addressSlice.reducer;
