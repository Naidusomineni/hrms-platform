import apiClient from './apiClient';
import type { ApiResponse, TenantModuleManifest } from '../types';

export const tenantModuleAPI = {
  getTenantModules: () =>
    apiClient.get<ApiResponse<TenantModuleManifest[]>>('/v1/tenant/modules'),

  getEnabledModuleKeys: () =>
    apiClient.get<ApiResponse<string[]>>('/v1/tenant/modules/enabled'),

  toggleModule: (moduleKey: string, enabled: boolean) =>
    apiClient.put<ApiResponse<TenantModuleManifest>>(`/v1/tenant/modules/${moduleKey}`, { enabled }),

  batchUpdateModules: (moduleMap: Record<string, boolean>) =>
    apiClient.put<ApiResponse<TenantModuleManifest[]>>('/v1/tenant/modules/batch', moduleMap),
};

