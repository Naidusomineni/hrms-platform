export type AssetCategory =
  | 'LAPTOP'
  | 'MONITOR'
  | 'MOBILE_DEVICE'
  | 'ACCESS_CARD'
  | 'PERIPHERAL'
  | 'LICENSE';

export type AssetStatus = 'AVAILABLE' | 'ALLOCATED' | 'MAINTENANCE' | 'RETIRED';

export interface Asset {
  id: number;
  assetTag: string;
  category: AssetCategory;
  brand: string;
  model: string;
  serialNumber: string;
  cost?: number;
  conditionStatus: string;
  status: AssetStatus;
  assignedToEmployeeId?: number;
  assignedToEmployeeName?: string;
}

export interface AssetAllocation {
  id: number;
  assetId: number;
  assetTag: string;
  assetModel: string;
  employeeId: number;
  employeeName: string;
  allocatedAt: string;
  returnedAt?: string;
  notes?: string;
}

