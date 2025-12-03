import type { Analytics, AnalyticsSummary, SensorData } from "../../domain/model/analytics.entity";
import type { Metric } from "../../../plants/domain/model/plants.entity";

/**
 * Assembler para convertir y agregar datos de sensores en analytics
 */
export class AnalyticsAssembler {
    
    /**
     * Convierte datos del backend al formato SensorData del dominio
     */
    static mapSensorData(raw: any): SensorData {
        console.log('[AnalyticsAssembler] Mapping raw data:', raw);
        
        const mapped = {
            id: Number(raw.id || 0),
            device_id: String(raw.deviceId || ''),
            temperature: Number(raw.airTemperatureC || 0),
            humidity: Number(raw.airHumidityPct || 0),
            light: Number(raw.lightIntensityLux || 0),
            soil_humidity: Number(raw.soilMoisturePct || 0),
            created_at: raw.timestamp || new Date().toISOString()
        };
        
        console.log('[AnalyticsAssembler] Mapped result:', mapped);
        return mapped;
    }

    /**
     * Calcula estadísticas desde un array de datos de sensores
     */
    static calculateSummary(sensorData: SensorData[]): AnalyticsSummary {
        if (!sensorData || sensorData.length === 0) {
            return {
                avgTemperature: 0,
                avgHumidity: 0,
                avgSoilMoisture: 0,
                avgLight: 0,
                minTemperature: 0,
                maxTemperature: 0,
                totalReadings: 0
            };
        }

        const temperatures = sensorData.map(d => d.temperature);
        const humidities = sensorData.map(d => d.humidity);
        const soilHumidities = sensorData.map(d => d.soil_humidity);
        const lights = sensorData.map(d => d.light);

        return {
            avgTemperature: this.average(temperatures),
            avgHumidity: this.average(humidities),
            avgSoilMoisture: this.average(soilHumidities),
            avgLight: this.average(lights),
            minTemperature: Math.min(...temperatures),
            maxTemperature: Math.max(...temperatures),
            totalReadings: sensorData.length
        };
    }

    /**
     * Convierte métricas de planta a analytics
     */
    static fromPlantMetrics(plantId: number, metrics: Metric[], deviceId?: string): Analytics {
        const sensorData: SensorData[] = metrics.map(m => ({
            id: m.id ?? 0,
            device_id: m.deviceId,
            temperature: m.airTemperatureC,
            humidity: m.airHumidityPct,
            light: m.lightIntensityLux,
            soil_humidity: m.soilMoisturePct,
            created_at: m.timestamp
        }));

        const dates = sensorData.map(d => new Date(d.created_at).getTime());
        const periodStart = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : new Date().toISOString();
        const periodEnd = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : new Date().toISOString();

        return {
            deviceId: deviceId || (metrics.length > 0 && metrics[0] ? metrics[0].deviceId : ''),
            plantId,
            periodStart,
            periodEnd,
            summary: this.calculateSummary(sensorData),
            sensorData
        };
    }

    /**
     * Agrupa datos de sensores por usuario (desde plantas)
     */
    static aggregateByUser(_sensorData: any[], _userId: string): Analytics[] {
        // Este método requeriría información adicional de las plantas
        // Por ahora retorna un array vacío, se usará el método que trabaja directamente con plantas
        return [];
    }

    /**
     * Agrupa datos de sensores por planta
     */
    static aggregateByPlant(sensorData: any[], plantId: number, deviceId?: string): Analytics {
        const mapped = sensorData.map(d => this.mapSensorData(d));
        
        // Filtrar por deviceId si se proporciona
        const filtered = deviceId 
            ? mapped.filter(d => d.device_id === deviceId)
            : mapped;

        const dates = filtered.map(d => new Date(d.created_at).getTime());
        const periodStart = dates.length > 0 ? new Date(Math.min(...dates)).toISOString() : new Date().toISOString();
        const periodEnd = dates.length > 0 ? new Date(Math.max(...dates)).toISOString() : new Date().toISOString();

        return {
            deviceId: deviceId || (filtered.length > 0 && filtered[0] ? filtered[0].device_id : ''),
            plantId,
            periodStart,
            periodEnd,
            summary: this.calculateSummary(filtered),
            sensorData: filtered
        };
    }

    /**
     * Calcula el promedio de un array de números
     */
    private static average(numbers: number[]): number {
        if (numbers.length === 0) return 0;
        const sum = numbers.reduce((acc, val) => acc + val, 0);
        return Math.round((sum / numbers.length) * 100) / 100; // 2 decimales
    }

    /**
     * Convierte Analytics a formato para enviar al backend
     */
    static toBackend(sensorData: Omit<SensorData, 'id'>[]): any {
        return sensorData.map(data => ({
            deviceId: data.device_id,
            airTemperatureC: Number(data.temperature),
            airHumidityPct: Number(data.humidity),
            lightIntensityLux: Number(data.light),
            soilMoisturePct: Number(data.soil_humidity),
            timestamp: data.created_at
        }));
    }
}