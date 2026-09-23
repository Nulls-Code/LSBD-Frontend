import type {
  NavLink,
  CompanyInfo,
  FooterLinkGroup,
  SocialLink,
  ShipmentTypeOption,
} from "@/lib/types";

// ──────────────────────────────────────────────
// Company Information
// ──────────────────────────────────────────────

export const COMPANY_INFO: CompanyInfo = {
  name: "LOGISTIC STAR BD LTD.",
  tagline: "Fast, Reliable & Secure International Courier Solutions by Air",
  description:
    "International logistics solutions connecting China, Bangladesh and beyond. Air freight, ocean freight, and land transportation.",
  phone: "+880 [Your Number]",
  email: "info@logisticsstarbd.com",
  address: "[Office Address, Dhaka, Bangladesh]",
  expressHelpline: "+880 9612-LSBD-00",
};

// ──────────────────────────────────────────────
// Navigation Links
// ──────────────────────────────────────────────

export const NAV_LINKS: NavLink[] = [
  { id: "home", label: "Home", href: "#" },
  { id: "services", label: "Services", href: "services" },
  { id: "tracking", label: "Tracking", href: "tracking" },
  { id: "about", label: "About Us", href: "about" },
  { id: "news", label: "News", href: "news" },
  { id: "contact", label: "Contact", href: "contact" },
];

// ──────────────────────────────────────────────
// Footer Link Groups
// ──────────────────────────────────────────────

export const FOOTER_LINK_GROUPS: FooterLinkGroup[] = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Services", href: "#" },
      { label: "News", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Air Freight", href: "#" },
      { label: "Land Transportation", href: "#" },
      { label: "Warehousing", href: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Track Shipment", href: "#" },
      { label: "Get a Quote", href: "#" },
      { label: "Customer Support", href: "#" },
      { label: "FAQ", href: "#" },
    ],
  },
];

// ──────────────────────────────────────────────
// Social Links
// ──────────────────────────────────────────────

export const SOCIAL_LINKS: SocialLink[] = [
  { label: "Facebook", href: "#", iconName: "facebook" },
  { label: "LinkedIn", href: "#", iconName: "linkedin" },
  { label: "YouTube", href: "#", iconName: "youtube" },
  { label: "WhatsApp", href: "#", iconName: "whatsapp" },
];

// ──────────────────────────────────────────────
// Shipment Type Options (Request Form)
// ──────────────────────────────────────────────

export const SHIPMENT_TYPE_OPTIONS: ShipmentTypeOption[] = [
  { value: "Commercial cargo", label: "Commercial cargo" },
  { value: "International Express Parcel", label: "International Express Parcel" },
  { value: "Document & Samples", label: "Document & Samples" },
  { value: "Heavy Freight", label: "Heavy Freight" },
];
