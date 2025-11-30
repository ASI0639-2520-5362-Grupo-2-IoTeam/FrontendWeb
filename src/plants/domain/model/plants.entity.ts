
export interface Metric {
  id: number | null;
  plantId: number;
  deviceId: string;
  airTemperatureC: number;
  airHumidityPct: number;
  lightIntensityLux: number;
  soilMoisturePct: number;
  timestamp: string;
}

export interface WateringLog {
  id: number;
  plantId: number;
  wateredAt: string;
}

export interface Plant {
  id: number;
  userId: string;
  name: string;
  type: string;
  imgUrl: string;
  bio: string;
  location: string;
  status: PlantStatus;
  lastWatered: string;
  nextWatering: string;
  metrics: Metric[];
  wateringLogs: WateringLog[];
  createdAt: string;
  updatedAt: string;
}


export type PlantStatus = 'healthy' | 'warning' | 'critical';
