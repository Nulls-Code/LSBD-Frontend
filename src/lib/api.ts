import { 
  CourierRequestResponse, 
  CourierRequest,
  CreateCourierRequestInput,
  ReviewCourierRequestInput,
  CancelCourierRequestInput,
  LocationResponse, 
  SingleLocationResponse,
  CreateLocationInput,
  UpdateLocationInput,
  Location,
  ShipmentResponse, 
  SingleShipmentResponse, 
  StaffResponse,
  CustomerListResponse,
  SingleCustomerResponse,
  UpdateCustomerInput,
  RegisterStaffInput,
  UpdateUserInput,
  StaffUser
} from "./types";

const API_BASE_URL = "http://localhost:5000/api/v1";

export async function fetchCourierRequests(
  page: number = 1,
  limit: number = 20,
  status?: string,
  originLocationId?: string,
  destinationLocationId?: string,
  startDate?: string,
  endDate?: string,
  search?: string
): Promise<CourierRequestResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (status && status !== "ALL") params.append("status", status);
  if (originLocationId) params.append("originLocationId", originLocationId);
  if (destinationLocationId) params.append("destinationLocationId", destinationLocationId);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);
  if (search) params.append("search", search);

  const response = await fetch(`${API_BASE_URL}/courier-requests?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // Required to send/receive cookies as per backend spec
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch courier requests: ${response.statusText}`);
  }

  return response.json();
}

export async function createCourierRequest(
  data: CreateCourierRequestInput
): Promise<{ success: boolean; data?: CourierRequest; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/courier-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(resJson.error?.message || resJson.message || `Failed to create courier request`);
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function reviewCourierRequest(
  id: string,
  data: ReviewCourierRequestInput
): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/courier-requests/${id}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(resJson.error?.message || resJson.message || `Failed to review courier request`);
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function cancelCourierRequest(
  id: string,
  data: CancelCourierRequestInput
): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/courier-requests/${id}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(resJson.error?.message || resJson.message || `Failed to cancel courier request`);
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function fetchCourierRequestStatusCounts(filters?: {
  originLocationId?: string;
  destinationLocationId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<Record<string, number>> {
  const statuses = ["ALL", "PENDING", "APPROVED", "REJECTED", "CANCELLED"];
  const counts: Record<string, number> = {
    ALL: 0,
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    CANCELLED: 0,
  };

  await Promise.all(
    statuses.map(async (status) => {
      try {
        const res = await fetchCourierRequests(
          1,
          1,
          status === "ALL" ? undefined : status,
          filters?.originLocationId,
          filters?.destinationLocationId,
          filters?.startDate,
          filters?.endDate,
          filters?.search
        );
        if (res.success && res.meta) {
          counts[status] = res.meta.total;
        }
      } catch {
        // Non-blocking
      }
    })
  );

  return counts;
}

export async function fetchLocations(
  page: number = 1,
  limit: number = 20,
  search?: string,
  isActive?: string
): Promise<LocationResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  
  if (search && search.trim()) {
    params.append("search", search.trim());
  }

  if (isActive && isActive !== "all" && isActive !== "ALL") {
    params.append("isActive", isActive);
  }

  const response = await fetch(`${API_BASE_URL}/locations?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resJson.error?.message || resJson.message || `Failed to fetch locations: ${response.statusText}`);
  }

  return resJson;
}

export async function fetchLocationById(id: string): Promise<SingleLocationResponse> {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resJson.error?.message || resJson.message || `Failed to fetch location details: ${response.statusText}`);
  }

  return resJson;
}

export async function createLocation(
  data: CreateLocationInput
): Promise<{ success: boolean; data?: Location; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/locations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(resJson.error?.message || resJson.message || `Failed to create location`);
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function updateLocation(
  id: string,
  data: UpdateLocationInput
): Promise<{ success: boolean; data?: Location; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(resJson.error?.message || resJson.message || `Failed to update location`);
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function updateLocationStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; data?: Location; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/locations/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ isActive }),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(resJson.error?.message || resJson.message || `Failed to update location status`);
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function fetchShipments(
  page: number = 1,
  limit: number = 20,
  currentStatus?: string,
  originLocationId?: string,
  destinationLocationId?: string,
  assignedToId?: string,
  trackingNumber?: string,
  startDate?: string,
  endDate?: string
): Promise<ShipmentResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (currentStatus && currentStatus !== "ALL") params.append("currentStatus", currentStatus);
  if (originLocationId) params.append("originLocationId", originLocationId);
  if (destinationLocationId) params.append("destinationLocationId", destinationLocationId);
  if (assignedToId) params.append("assignedToId", assignedToId);
  if (trackingNumber) params.append("trackingNumber", trackingNumber);
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await fetch(`${API_BASE_URL}/shipments?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shipments: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchShipmentById(id: string): Promise<SingleShipmentResponse> {
  const response = await fetch(`${API_BASE_URL}/shipments/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shipment details: ${response.statusText}`);
  }

  return response.json();
}

export async function logShipmentCheckpoint(
  shipmentId: string,
  data: {
    locationId: string;
    status: string;
    description: string;
    isPublic: boolean;
    timestamp?: string;
  }
): Promise<{ success: boolean; data?: any; message?: string }> {
  const response = await fetch(`${API_BASE_URL}/shipments/${shipmentId}/tracking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resJson.error?.message || resJson.message || `Failed to log checkpoint: ${response.statusText}`);
  }

  return resJson;
}

export async function fetchStaffUsers(
  page: number = 1,
  limit: number = 100,
  role?: string
): Promise<StaffResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (role) params.append("role", role);

    const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      return { success: false, data: [] };
    }

    return await response.json();
  } catch (e) {
    return { success: false, data: [] };
  }
}

// ──────────────────────────────────────────────
// Customer CRM API (PDF Spec Section 7.8)
// ──────────────────────────────────────────────

export async function fetchCustomers(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<CustomerListResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search && search.trim()) {
    params.append("search", search.trim());
  }

  const response = await fetch(`${API_BASE_URL}/customers?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      resJson.error?.message || resJson.message || `Failed to fetch customers: ${response.statusText}`
    );
  }

  return resJson;
}

export async function fetchCustomerById(id: string): Promise<SingleCustomerResponse> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      resJson.error?.message || resJson.message || `Failed to fetch customer profile: ${response.statusText}`
    );
  }

  return resJson;
}

export async function updateCustomer(
  id: string,
  data: UpdateCustomerInput
): Promise<{ success: boolean; data?: any; message?: string; error?: any }> {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || `Failed to update customer`
    );
    (errorObj as any).status = response.status;
    (errorObj as any).errors = resJson.error?.errors;
    (errorObj as any).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

// ──────────────────────────────────────────────
// User Administration API (PDF Spec Section 7.7)
// ──────────────────────────────────────────────

export async function fetchUsers(
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string,
  isActive?: string
): Promise<StaffResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (search && search.trim()) params.append("search", search.trim());
  if (role && role !== "ALL") params.append("role", role);
  if (isActive && isActive !== "ALL") params.append("isActive", isActive);

  const response = await fetch(`${API_BASE_URL}/users?${params.toString()}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      resJson.error?.message || resJson.message || `Failed to fetch users: ${response.statusText}`
    );
  }

  return resJson;
}

export async function registerStaff(
  data: RegisterStaffInput
): Promise<{ success: boolean; data?: StaffUser; message?: string; error?: { message?: string; errors?: Record<string, string[]> } }> {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || "Failed to register staff"
    );
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).status = response.status;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).errors = resJson.error?.errors;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function updateUser(
  id: string,
  data: UpdateUserInput
): Promise<{ success: boolean; data?: StaffUser; message?: string; error?: { message?: string; errors?: Record<string, string[]> } }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || "Failed to update user"
    );
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).status = response.status;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).errors = resJson.error?.errors;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function updateUserStatus(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; data?: StaffUser; message?: string; error?: { message?: string } }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ isActive }),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || "Failed to update user status"
    );
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).status = response.status;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).errors = resJson.error?.errors;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function resetUserPassword(
  id: string,
  newPassword: string
): Promise<{ success: boolean; message?: string; error?: { message?: string; errors?: Record<string, string[]> } }> {
  const response = await fetch(`${API_BASE_URL}/users/${id}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ newPassword }),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || "Failed to reset password"
    );
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).status = response.status;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).errors = resJson.error?.errors;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

// ──────────────────────────────────────────────
// Self-Service Profile & Auth API (PDF Spec Section 7.1.4 & 7.1.5)
// ──────────────────────────────────────────────

export async function fetchUserProfile(): Promise<{
  success: boolean;
  data?: StaffUser;
  message?: string;
  error?: { message?: string; code?: string };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || "Failed to fetch user profile"
    );
    (errorObj as unknown as { status: number; code?: string }).status = response.status;
    (errorObj as unknown as { status: number; code?: string }).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{
  success: boolean;
  message?: string;
  data?: { message?: string };
  error?: { message?: string; code?: string; errors?: Record<string, string[]> };
}> {
  const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ currentPassword, newPassword }),
  });

  const resJson = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorObj = new Error(
      resJson.error?.message || resJson.message || "Failed to change password"
    );
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).status = response.status;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).errors = resJson.error?.errors;
    (errorObj as unknown as { status: number; errors?: Record<string, string[]>; code?: string }).code = resJson.error?.code;
    throw errorObj;
  }

  return resJson;
}
