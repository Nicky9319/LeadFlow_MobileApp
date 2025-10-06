import { createSlice } from '@reduxjs/toolkit';

const leadsSlice = createSlice({
  name: 'leads',
  initialState: {
    leads: [],
    loading: false,
    error: null,
    selectedBucketId: null,
  },
  reducers: {
    setLeads: (state, action) => {
      state.leads = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedBucketId: (state, action) => {
      state.selectedBucketId = action.payload;
    },
    updateLead: (state, action) => {
      const { leadId, updates } = action.payload;
      const lead = state.leads.find(l => l.leadId === leadId);
      if (lead) {
        Object.assign(lead, updates);
      }
    },
    addLead: (state, action) => {
      state.leads.push(action.payload);
    },
    deleteLead: (state, action) => {
      state.leads = state.leads.filter(lead => lead.leadId !== action.payload);
    },
  },
});

export const { setLeads, setLoading, setError, setSelectedBucketId, updateLead, addLead, deleteLead } = leadsSlice.actions;
export default leadsSlice.reducer;
