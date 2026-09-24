import type { LucideIcon } from "lucide-react";

// ──────────────────────────────────────────────
// Navigation
// ──────────────────────────────────────────────

export interface NavLink {
  id: string;
  label: string;
  href: string;
}

// ──────────────────────────────────────────────
// Services
// ──────────────────────────────────────────────

export interface Service {
  icon: LucideIcon;
  image: string;
  title: string;
  desc: string;
  tag: string;
}

// ──────────────────────────────────────────────
// Delivery Process
// ──────────────────────────────────────────────

export interface ProcessStep {
  id: string;
  title: string;
  desc: string;
}

// ──────────────────────────────────────────────
// Customer Reviews
// ──────────────────────────────────────────────

export interface Review {
  quote: string;
  name: string;
  company: string;
  initials: string;
}

// ──────────────────────────────────────────────
// Tracking
// ──────────────────────────────────────────────

export interface TrackingStep {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface TrackingStatus {
  id: string;
  sender: string;
  recipient: string;
  origin: string;
  destination: string;
  status: string;
  estimatedDelivery: string;
  steps: TrackingStep[];
}

// ──────────────────────────────────────────────
// Request Shipment Form
// ──────────────────────────────────────────────

export interface RequestFormData {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderCompany?: string;
  senderAddress: string;
  
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientAddress: string;
  
  originLocationId: string;
  destinationLocationId: string;
  
  packageWeight: string;
  weightUnit: string;
  packageCount: string;
  packageDescription: string;
  requestNotes: string;
}

// ──────────────────────────────────────────────
// Why Choose Us
// ──────────────────────────────────────────────

export interface Feature {
  id: string;
  text: string;
}

// ──────────────────────────────────────────────
// Footer
// ──────────────────────────────────────────────

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterLinkGroup {
  title: string;
  links: FooterLink[];
}

export interface SocialLink {
  label: string;
  href: string;
  iconName: "facebook" | "linkedin" | "youtube" | "whatsapp";
}

// ──────────────────────────────────────────────
// Company Info
// ──────────────────────────────────────────────

export interface CompanyInfo {
  name: string;
  tagline: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  expressHelpline: string;
}

// ──────────────────────────────────────────────
// Shipment Type Options (Form)
// ──────────────────────────────────────────────

export interface ShipmentTypeOption {
  value: string;
  label: string;
}

// ──────────────────────────────────────────────
// API Models (from Backend PDF)
// ──────────────────────────────────────────────

export interface LocationCount {
  currentShipments?: number;
  originShipments?: number;
  destinationShipments?: number;
  originRequests?: number;
  destinationRequests?: number;
}

export interface Location {
  id: string;
  name: string;
  code: string;
  city: string;
  country: string;
  address?: string | null;
  isActive?: boolean;
  _count?: LocationCount;
  createdAt?: string;
  updatedAt?: string;
}

export interface LocationResponse {
  success: boolean;
  data: Location[];
  meta: PaginatedMeta;
  message?: string;
}

export interface SingleLocationResponse {
  success: boolean;
  data: Location;
  message?: string;
}

export interface CreateLocationInput {
  name: string;
  code: string;
  city: string;
  country: string;
  address?: string;
}

export interface UpdateLocationInput {
  name?: string;
  code?: string;
  city?: string;
  country?: string;
  address?: string | null;
}


export interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string;
  company?: string | null;
  createdAt?: string;
  updatedAt?: string;
  _count?: {
    courierRequests?: number;
  };
}

export interface CustomerListItem {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  company: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    courierRequests?: number;
  };
}

export interface CustomerListResponse {
  success: boolean;
  data: CustomerListItem[];
  meta: PaginatedMeta;
  message?: string;
}

export interface CustomerRequestHistoryItem {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  packageDescription: string;
  packageWeight: string | number;
  weightUnit?: string;
  packageCount: number;
  createdAt: string;
  originLocation: Location;
  destinationLocation: Location;
  shipment?: {
    id: string;
    trackingNumber: string;
    currentStatus: string;
  } | null;
}

export interface CustomerDetail extends CustomerListItem {
  courierRequests: CustomerRequestHistoryItem[];
}

export interface SingleCustomerResponse {
  success: boolean;
  data: CustomerDetail;
  message?: string;
}

export interface UpdateCustomerInput {
  name?: string;
  email?: string;
  phone?: string;
  company?: string | null;
}


export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CourierRequest {
  id: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderCompany?: string | null;
  senderAddress?: string | null;
  recipientName: string;
  recipientPhone?: string | null;
  recipientEmail?: string | null;
  recipientAddress?: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  packageDescription: string;
  packageWeight: string | number;
  weightUnit: string;
  packageCount: number;
  requestNotes?: string | null;
  reviewNotes?: string | null;
  reviewedAt?: string | null;
  reviewedBy?: {
    id?: string;
    firstName: string;
    lastName: string;
    role: string;
  } | null;
  customer?: Customer;
  originLocation: Location;
  destinationLocation: Location;
  createdAt: string;
  updatedAt?: string;
  shipment?: {
    id: string;
    trackingNumber: string;
    currentStatus: string;
  } | null;
}

export interface CreateCourierRequestInput {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderAddress: string;
  senderCompany?: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail?: string;
  recipientAddress: string;
  originLocationId: string;
  destinationLocationId: string;
  packageDescription: string;
  packageWeight: number;
  weightUnit: "KG" | "LB" | string;
  packageCount: number;
  requestNotes?: string;
  customerId?: string;
}

export interface ReviewCourierRequestInput {
  action: "APPROVE" | "REJECT";
  reviewNotes?: string;
}

export interface CancelCourierRequestInput {
  reason: string;
}

export interface CourierRequestResponse {
  success: boolean;
  data: CourierRequest[];
  meta: PaginatedMeta;
  message?: string;
}

// ──────────────────────────────────────────────
// Shipment Types (PDF Spec Section 7.4 & 7.5)
// ──────────────────────────────────────────────

export type ShipmentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED"
  | "PROCESSING"
  | "IN_TRANSIT"
  | "ARRIVED_AT_HUB"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_DELIVERY"
  | "ON_HOLD"
  | "RETURNED";

export interface StaffUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE" | string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RegisterStaffInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE" | string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: "ADMIN" | "MANAGER" | "EMPLOYEE" | string;
}

export interface TrackingUpdateItem {
  id: string;
  shipmentId?: string;
  status: ShipmentStatus | string;
  description: string;
  timestamp: string;
  isPublic: boolean;
  location?: Location;
  locationId?: string;
  createdBy?: {
    firstName: string;
    lastName: string;
    role: string;
  };
  createdAt?: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  currentStatus: ShipmentStatus;
  senderName: string;
  senderPhone?: string;
  senderAddress?: string;
  recipientName: string;
  recipientPhone?: string;
  recipientAddress?: string;
  originLocation: Location;
  destinationLocation: Location;
  currentLocation?: Location;
  estimatedDeliveryDate?: string | null;
  assignedTo?: StaffUser | null;
  assignedToId?: string | null;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  trackingUpdates?: TrackingUpdateItem[];
}

export interface UpdateShipmentInput {
  assignedToId?: string | null;
  estimatedDeliveryDate?: string | null;
  internalNotes?: string | null;
}

export interface ShipmentResponse {
  success: boolean;
  data: Shipment[];
  meta: PaginatedMeta;
  message?: string;
}

export interface SingleShipmentResponse {
  success: boolean;
  data: Shipment;
  message?: string;
}

export interface StaffResponse {
  success: boolean;
  data: StaffUser[];
  meta?: PaginatedMeta;
  message?: string;
}
