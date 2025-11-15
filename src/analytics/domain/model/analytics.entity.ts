/**
 * Datos de sensor recibidos del backend
 */
export interface SensorData {
  /** ID único del dato del sensor */
  id: number;

  /** ID del dispositivo/sensor */
  device_id: string;

  /** Temperatura en grados Celsius */
  temperature: number;

  /** Humedad ambiental en porcentaje */
  humidity: number;

  /** Nivel de luz */
  light: number;

  /** Humedad del suelo en porcentaje */
  soil_humidity: number;

  /** Fecha de creación del registro (ISO 8601 string) */
  created_at: string;
}

/**
 * Resumen estadístico calculado a partir de los datos del sensor
 */
export interface AnalyticsSummary {
  /** Promedio de temperatura durante el período (°C) */
  avgTemperature: number;

  /** Promedio de humedad ambiental durante el período (%) */
  avgHumidity: number;

  /** Promedio de humedad del suelo durante el período (%) */
  avgSoilMoisture: number;

  /** Promedio de luz durante el período */
  avgLight: number;

  /** Temperatura mínima registrada */
  minTemperature: number;

  /** Temperatura máxima registrada */
  maxTemperature: number;

  /** Número total de lecturas */
  totalReadings: number;
}

/**
 * Analytics agregados por dispositivo/planta
 */
export interface Analytics {
  /** ID del dispositivo asociado */
  deviceId: string;

  /** ID de la planta (si está asociada) */
  plantId?: number;

  /** Fecha de inicio del período de análisis */
  periodStart: string;

  /** Fecha de fin del período de análisis */
  periodEnd: string;

  /** Resumen estadístico del período */
  summary: AnalyticsSummary;

  /** Datos crudos del sensor */
  sensorData: SensorData[];
}
