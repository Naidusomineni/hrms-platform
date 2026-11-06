import apiClient from './apiClient'
import type { ApiResponse, Asset, AssetAllocation } from '../types'

export const assetAPI = {
  getAssets: () => apiClient.get<ApiResponse<Asset[]>>('/v1/assets'),
  createAsset: (data: Partial<Asset>) => apiClient.post<ApiResponse<Asset>>('/v1/assets', data),
  allocateAsset: (id: number | string, employeeId: number | string, notes = '') =>
    apiClient.post<ApiResponse<AssetAllocation>>(`/v1/assets/${id}/allocate?employeeId=${employeeId}&notes=${encodeURIComponent(notes)}`),
  returnAsset: (allocationId: number | string, notes = '') =>
    apiClient.post<ApiResponse<AssetAllocation>>(`/v1/assets/allocations/${allocationId}/return?notes=${encodeURIComponent(notes)}`),
  getEmployeeAssets: (empId: number | string) =>
    apiClient.get<ApiResponse<AssetAllocation[]>>(`/v1/assets/employee/${empId}`),
}

export default assetAPI

