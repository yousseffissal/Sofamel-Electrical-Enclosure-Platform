import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedBoxType: null,
  selectedTemplate: null,
  areas: [],
  areaItems: {},
  selectedItemsByArea: {},
};

const configuratorSlice = createSlice({
  name: "configurator",
  initialState,
  reducers: {
    setSelectedBoxType: (state, action) => {
      state.selectedBoxType = action.payload;
    },

    setSelectedTemplate: (state, action) => {
      state.selectedTemplate = action.payload;
    },

    setAreas: (state, action) => {
      state.areas = action.payload;
    },

    setAreaItems: (state, action) => {
      const { areaId, items } = action.payload;
      state.areaItems[areaId] = items;
    },

    addItemToArea: (state, action) => {
      const { areaId, item } = action.payload;

      if (!state.selectedItemsByArea[areaId]) {
        state.selectedItemsByArea[areaId] = [];
      }

      const templateMax = Number(state.selectedTemplate?.max_total_items || 0);

      const currentTotal = Object.values(state.selectedItemsByArea)
        .flat()
        .reduce((sum, i) => sum + i.quantity, 0);

      const existing = state.selectedItemsByArea[areaId].find(
        (i) => i.item.id === item.id
      );

      if (!existing && currentTotal >= templateMax) {
        return;
      }

      if (existing) {
        if (existing.quantity >= item.max_quantity) return;
        existing.quantity += 1;
      } else {
        state.selectedItemsByArea[areaId].push({
          item,
          quantity: 1,
          unitPrice: item.price,
        });
      }
    },

    increaseQuantity: (state, action) => {
      const { areaId, itemId } = action.payload;

      const item = state.selectedItemsByArea[areaId]?.find(
        (i) => i.item.id === itemId
      );

      if (!item) return;

      const templateMax = Number(state.selectedTemplate?.max_total_items || 0);

      const currentTotal = Object.values(state.selectedItemsByArea)
        .flat()
        .reduce((sum, i) => sum + i.quantity, 0);

      if (currentTotal >= templateMax) return;

      if (item.quantity >= item.item.max_quantity) return;

      item.quantity += 1;
    },

    decreaseQuantity: (state, action) => {
      const { areaId, itemId } = action.payload;

      const item = state.selectedItemsByArea[areaId]?.find(
        (i) => i.item.id === itemId
      );

      if (!item) return;

      item.quantity -= 1;

      if (item.quantity <= 0) {
        state.selectedItemsByArea[areaId] =
          state.selectedItemsByArea[areaId].filter(
            (i) => i.item.id !== itemId
          );
      }
    },

    removeItem: (state, action) => {
      const { areaId, itemId } = action.payload;

      state.selectedItemsByArea[areaId] =
        state.selectedItemsByArea[areaId].filter(
          (i) => i.item.id !== itemId
        );
    },

    resetConfigurator: () => initialState,
  },
});

export const {
  setSelectedBoxType,
  setSelectedTemplate,
  setAreas,
  setAreaItems,
  addItemToArea,
  increaseQuantity,
  decreaseQuantity,
  removeItem,
  resetConfigurator,
} = configuratorSlice.actions;

export default configuratorSlice.reducer;