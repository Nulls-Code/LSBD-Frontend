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
  fullName: string;
  phone: string;
  email: string;
  weight: string;
  origin: string;
  destination: string;
  shipmentType: string;
  message: string;
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
