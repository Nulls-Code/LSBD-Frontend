import { PackageCheck, Plane, Zap, Truck } from "lucide-react";
import type { Service } from "@/lib/types";

export const SERVICES: Service[] = [
  {
    icon: PackageCheck,
    image: "/Service image-1.png",
    title: "International Courier",
    desc: "Reliable international parcel delivery to destinations around the world.",
    tag: "Global Parcel",
  },
  {
    icon: Plane,
    image: "/Service image-2.png",
    title: "Air Freight",
    desc: "Efficient air-freight solutions for commercial and larger shipments.",
    tag: "Commercial Freight",
  },
  {
    icon: Zap,
    image: "/Service image-3.png",
    title: "Express Delivery",
    desc: "Fast delivery solutions for time-sensitive documents and packages.",
    tag: "Time-Critical",
  },
  {
    icon: Truck,
    image: "/Service image-4.png",
    title: "Door-to-Door Logistics",
    desc: "Convenient shipment handling from collection through final delivery.",
    tag: "End-to-End",
  },
];
