import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { tenantService } from '../../modules/tenant/services/tenantService';

export interface TenantInfo {
  id?: string;
  tenantId?: string;
  name?: string;
  subdomain?: string;
  domain?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  customCss?: string;
  subscriptionTier?: string;
  authConfig?: any;
}

export interface TenantState {
  tenant: TenantInfo | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export function applyTenantTheme(hexColor?: string): void {
  if (!hexColor || !/^#[0-9A-Fa-f]{6}$/.test(hexColor)) return;
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.style.setProperty('--brand-primary-600', hexColor);

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  root.style.setProperty('--brand-primary-rgb', `${r}, ${g}, ${b}`);

  const mix = (factor: number, target: number): string => {
    const nr = Math.min(255, Math.max(0, Math.round(r + (target - r) * factor)));
    const ng = Math.min(255, Math.max(0, Math.round(g + (target - g) * factor)));
    const nb = Math.min(255, Math.max(0, Math.round(b + (target - b) * factor)));
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  root.style.setProperty('--brand-primary-50', mix(0.92, 255));
  root.style.setProperty('--brand-primary-100', mix(0.82, 255));
  root.style.setProperty('--brand-primary-200', mix(0.65, 255));
  root.style.setProperty('--brand-primary-300', mix(0.45, 255));
  root.style.setProperty('--brand-primary-400', mix(0.25, 255));
  root.style.setProperty('--brand-primary-500', mix(0.12, 255));
  root.style.setProperty('--brand-primary-700', mix(0.15, 0));
  root.style.setProperty('--brand-primary-800', mix(0.30, 0));
  root.style.setProperty('--brand-primary-900', mix(0.50, 0));
  root.style.setProperty('--brand-primary-950', mix(0.70, 0));
}

export const fetchTenantBranding = createAsyncThunk<TenantInfo, void, { rejectValue: string }>(
  'tenant/fetchTenantBranding',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tenantService.getCurrentTenant();
      const tenant = response.data?.data;
      if (tenant?.primaryColor) {
        applyTenantTheme(tenant.primaryColor);
      }
      return tenant;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to load tenant info';
      return rejectWithValue(msg);
    }
  }
);

export const updateTenantBrandingThunk = createAsyncThunk<TenantInfo, any, { rejectValue: string }>(
  'tenant/updateTenantBranding',
  async (brandingData, { rejectWithValue }) => {
    try {
      const response = await tenantService.updateBranding(brandingData);
      const tenant = response.data?.data;
      if (tenant?.primaryColor) {
        applyTenantTheme(tenant.primaryColor);
      }
      return tenant;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to update branding';
      return rejectWithValue(msg);
    }
  }
);

export const uploadTenantLogoThunk = createAsyncThunk<TenantInfo, File, { rejectValue: string }>(
  'tenant/uploadTenantLogo',
  async (file, { rejectWithValue }) => {
    try {
      const response = await tenantService.uploadLogo(file);
      const tenant = response.data?.data;
      return tenant;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to upload logo';
      return rejectWithValue(msg);
    }
  }
);

const initialState: TenantState = {
  tenant: null,
  loading: false,
  saving: false,
  error: null,
};

const tenantSlice = createSlice({
  name: 'tenant',
  initialState,
  reducers: {
    setTenantBranding: (state, action: PayloadAction<TenantInfo>) => {
      state.tenant = action.payload;
      if (action.payload?.primaryColor) {
        applyTenantTheme(action.payload.primaryColor);
      }
    },
  },
  extraReducers: builder => {
    builder
      // fetch
      .addCase(fetchTenantBranding.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTenantBranding.fulfilled, (state, action) => {
        state.loading = false;
        state.tenant = action.payload;
      })
      .addCase(fetchTenantBranding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load';
      })
      // update
      .addCase(updateTenantBrandingThunk.pending, state => {
        state.saving = true;
      })
      .addCase(updateTenantBrandingThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.tenant = action.payload;
      })
      .addCase(updateTenantBrandingThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload || 'Failed to update';
      })
      // upload logo
      .addCase(uploadTenantLogoThunk.fulfilled, (state, action) => {
        state.tenant = action.payload;
      });
  },
});

export const { setTenantBranding } = tenantSlice.actions;
export default tenantSlice.reducer;
