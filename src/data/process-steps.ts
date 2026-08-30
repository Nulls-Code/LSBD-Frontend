import type { ProcessStep } from "@/lib/types";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    id: "01",
    title: "Booking",
    desc: "Share origin,\ndestination, weight\nand dimensions;\nwe confirm rate and\ntransit time",
  },
  {
    id: "02",
    title: "Pickup",
    desc: "We collect\nfrom your address or\nreceive your cargo\nat our facility",
  },
  {
    id: "03",
    title: "Packing &\nConsolidation",
    desc: "Cargo is checked,\nlabelled, weighed\nand prepared for\nair carriage",
  },
  {
    id: "04",
    title: "Export\nClearance",
    desc: "Documents are filed\nand the shipment is\ncleared for departure",
  },
  {
    id: "05",
    title: "Air Transit",
    desc: "Your shipment\nflies on the\nrouting selected\nfor the fastest\nsafe arrival",
  },
  {
    id: "06",
    title: "Import\nClearance",
    desc: "Arrival handling and\ndestination customs\nclearance are\ncoordinated for you",
  },
  {
    id: "07",
    title: "Door Delivery",
    desc: "Final-mile delivery\nto the recipient, with \nconfirmation back\nto you",
  },
];
