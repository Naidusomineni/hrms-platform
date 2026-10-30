import apiClient from './apiClient'

export const shiftAPI = {
  getShifts: () => apiClient.get('/v1/shifts'),
  createShift: (data) => apiClient.post('/v1/shifts', data),
  assignRoster: (data) => apiClient.post('/v1/shifts/roster/assign', data),
  getRosterSchedule: (params) => apiClient.get('/v1/shifts/roster', { params }),
  getMyRoster: (employeeId, params) => apiClient.get('/v1/shifts/roster/my', { params: { employeeId, ...params } }),
  createSwapRequest: (data) => apiClient.post('/v1/shifts/swaps', data),
  getIncomingSwaps: (employeeId) => apiClient.get('/v1/shifts/swaps/incoming', { params: { employeeId } }),
  getOutgoingSwaps: (employeeId) => apiClient.get('/v1/shifts/swaps/outgoing', { params: { employeeId } }),
  getPendingManagerSwaps: () => apiClient.get('/v1/shifts/swaps/pending-manager'),
  peerRespondSwap: (swapId, peerEmployeeId, data) =>
    apiClient.put(`/v1/shifts/swaps/${swapId}/peer-respond`, data, { params: { peerEmployeeId } }),
  managerReviewSwap: (swapId, data) => apiClient.put(`/v1/shifts/swaps/${swapId}/manager-review`, data),
}
