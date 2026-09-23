import type { ProcessStep } from "@/lib/types";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "01",
    title: "Booking",
    desc: "Share origin, destination, weight and dimensions; we confirm rate and transit time.",
  },
  {
    id: "02",
    title: "Pickup",
    desc: "We collect from your address or receive your package at our facility.",
  },
  {
    id: "03",
    title: "Packing & Consolidation",
    desc: "Package is checked, labelled, weighed and prepared for air carriage.",
  },
  {
    id: "04",
    title: "Export Clearance",
    desc: "Our team handles export customs and paperwork to keep departure on schedule.",
  },
  {
    id: "05",
    title: "Air Transit",
    desc: "Your shipment flies on the routing selected for the fastest safe arrival.",
  },
  {
    id: "06",
    title: "Import Clearance",
    desc: "Arrival handling, taxes and destination customs clearance are coordinated for you.",
  },
  {
    id: "07",
    title: "Door Delivery",
    desc: "Final-mile courier brings your shipment directly to the recipient.",
  },
];
