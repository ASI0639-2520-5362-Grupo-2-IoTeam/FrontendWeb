export interface AnalyticsSummary {
  /** Promedio de humedad durante el período (en porcentaje). */
  avgHumidity: number;

  /** Promedio de humedad del suelo durante el período (en porcentaje). */
  avgSoilMoisture: number;

  /** Número total de riegos durante el período. */
  wateringCount: number;

  /** Número de alertas críticas generadas durante el período. */
  criticalAlerts: number;
}

export interface Analytics {
  /** Identificador único del análisis. */
  id: number;

  /** El ID del usuario al que pertenece este análisis (UUID string). */
  userId: string;

  /** El ID de la planta analizada. */
  plantId: number;

  /** Fecha de inicio del período de análisis (ISO 8601 string). */
  periodStart: string;

  /** Fecha de fin del período de análisis (ISO 8601 string). */
  periodEnd: string;

  /** Resumen estadístico del período analizado. */
  summary: AnalyticsSummary;

  /** Fechas del backend (opcional). */
  createdAt?: string;
  updatedAt?: string;
}