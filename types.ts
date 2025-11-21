

export enum ReportCategory {
  POTHOLE = 'Pothole',
  GARBAGE = 'Garbage',
  STREETLIGHT = 'Streetlight',
  GRAFFITI = 'Graffiti',
  DAMAGED_SIGN = 'Damaged Sign',
  PARK_MAINTENANCE = 'Park Maintenance',
  OTHER = 'Other',
}

export interface GeolocationState {
  latitude: number;
  longitude: number;
}

export interface Transaction {
  id: string;
  zoneName: string;
  plate: string;
  amount: number;
  timestamp: Date;
  durationHours: number;
}

export interface ParkingZone {
  name: string;
  rate: number;
  occupied: number;
  capacity: number;
}

export enum NewsStatus {
  UPCOMING = 'Upcoming',
  ONGOING = 'Ongoing',
  COMPLETED = 'Completed',
}

export enum NewsType {
  CONSTRUCTION = 'Construction',
  WATER_OUTAGE = 'Water Outage',
  POWER_OUTAGE = 'Power Outage',
  PUBLIC_NOTICE = 'Public Notice',
}

export interface NewsItem {
  id: string;
  type: NewsType;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export interface Report {
  id: string;
  title: string;
  category: ReportCategory;
  location: GeolocationState;
  photoPreviewUrl: string;
  timestamp: string; // ISO Date string
}
