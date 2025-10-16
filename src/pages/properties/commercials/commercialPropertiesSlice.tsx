// store/slices/commercialPropertiesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CommercialProperty {
  id: string;
  nom: string;
  description: string;
  created_at: string;
  // Add other fields as needed (e.g., images, price, etc.)
}

export interface CommercialPropertiesState {
  list: CommercialProperty[];
  loading: boolean;
  error: string | null;
}

const initialState: CommercialPropertiesState = {
  list: [],
  loading: false,
  error: null,
};

const commercialPropertiesSlice = createSlice({
  name: 'commercialProperties',
  initialState,
  reducers: {
    setCommercialProperties: (state, action: PayloadAction<CommercialProperty[]>) => {
      state.list = action.payload;
    },
    addCommercialProperty: (state, action: PayloadAction<CommercialProperty>) => {
      state.list.push(action.payload);
    },
    updateCommercialProperty: (state, action: PayloadAction<CommercialProperty>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteCommercialProperty: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setCommercialProperties,
  addCommercialProperty,
  updateCommercialProperty,
  deleteCommercialProperty,
  setLoading,
  setError,
} = commercialPropertiesSlice.actions;
export const commercialProperties =  commercialPropertiesSlice.reducer;

export default commercialPropertiesSlice.reducer;