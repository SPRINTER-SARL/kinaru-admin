// store/slices/residentialPropertiesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ResidentialProperty {
  id: string;
  nom: string;
  description: string;
  created_at: string;
  // Add other fields as needed
}

export interface ResidentialPropertiesState {
  list: ResidentialProperty[];
  loading: boolean;
  error: string | null;
}

const initialState: ResidentialPropertiesState = {
  list: [],
  loading: false,
  error: null,
};

const residentialPropertiesSlice = createSlice({
  name: 'residentialProperties',
  initialState,
  reducers: {
    setResidentialProperties: (state, action: PayloadAction<ResidentialProperty[]>) => {
      state.list = action.payload;
    },
    addResidentialProperty: (state, action: PayloadAction<ResidentialProperty>) => {
      state.list.push(action.payload);
    },
    updateResidentialProperty: (state, action: PayloadAction<ResidentialProperty>) => {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteResidentialProperty: (state, action: PayloadAction<string>) => {
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
  setResidentialProperties,
  addResidentialProperty,
  updateResidentialProperty,
  deleteResidentialProperty,
  setLoading,
  setError,
} = residentialPropertiesSlice.actions;

export const residentialProperties =  residentialPropertiesSlice.reducer;