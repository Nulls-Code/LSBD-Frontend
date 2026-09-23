export interface TrackingHistory {
  timestamp: string;
  status: string;
  description: string;
  location: string | null;
}

export interface TrackingData {
  trackingNumber: string;
  currentStatus: string;
  origin: {
    city: string;
    country: string;
  };
  destination: {
    city: string;
    country: string;
  };
  currentLocation: {
    city: string;
    country: string;
  } | null;
  estimatedDeliveryDate: string | null;
  lastUpdated: string;
  history: TrackingHistory[];
}
