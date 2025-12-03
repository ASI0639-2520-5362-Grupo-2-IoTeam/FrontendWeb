import type { Analytics, SensorData } from "../domain/model/analytics.entity.ts";
import http from "../../shared/services/http-common.ts";
import type { AxiosResponse } from "axios";
import { AnalyticsAssembler } from "./assembler/analytics-assembler.ts";

export class AnalyticsService {
    private resourceEndpoint = '/analytics';

    /**
     * Obtener todos los datos de sensores
     * GET /api/v1/analytics/data
     */
    async getAllSensorData(): Promise<AxiosResponse<SensorData[]>> {
        const res = await http.get<any[]>(`${this.resourceEndpoint}/data`);
        return res;
    }

    /**
     * Obtener datos de sensor para un dispositivo específico
     * GET /api/v1/analytics/devices/{deviceId}/data
     */
    async getSensorDataByDevice(deviceId: string): Promise<AxiosResponse<SensorData[]>> {
        if (!deviceId || deviceId === 'undefined' || deviceId === 'null') {
            throw new Error('Invalid deviceId provided to getSensorDataByDevice');
        }
        const res = await http.get<any[]>(`${this.resourceEndpoint}/devices/${encodeURIComponent(deviceId)}/data`);
        return res;
    }

    /**
     * Importar datos de sensor
     * POST /api/v1/analytics/imports
     */
    async importSensorData(sensorData: Omit<SensorData, 'id'>[]): Promise<AxiosResponse<any>> {
        const res = await http.post<any>(`${this.resourceEndpoint}/imports`, sensorData);
        return res;
    }

    /**
     * Obtener analytics agregados para las plantas de un usuario
     * Calcula estadísticas desde los datos de las plantas
     */
    async getAnalyticsByUser(userId: string): Promise<AxiosResponse<Analytics[]>> {
        if (!userId || userId === 'undefined' || userId === 'null') {
            throw new Error('Invalid userId provided to getAnalyticsByUser');
        }
        
        // Obtener todos los datos y filtrar por el contexto del usuario
        // En este caso, necesitamos obtener las plantas del usuario y luego sus métricas
        const res = await http.get<any[]>(`${this.resourceEndpoint}/data`);
        
        // Los datos serán procesados y agrupados por el assembler
        const analytics = AnalyticsAssembler.aggregateByUser(res.data, userId);
        
        return { ...res, data: analytics };
    }

    /**
     * Obtener analytics para una planta específica usando sus métricas
     */
    async getAnalyticsByPlant(plantId: number, deviceId?: string): Promise<AxiosResponse<Analytics>> {
        let sensorData: SensorData[];
        
        if (deviceId) {
            const res = await this.getSensorDataByDevice(deviceId);
            sensorData = res.data;
        } else {
            const res = await this.getAllSensorData();
            sensorData = res.data;
        }
        
        const analytics = AnalyticsAssembler.aggregateByPlant(sensorData, plantId, deviceId);
        
        return {
            data: analytics,
            status: 200,
            statusText: 'OK',
            headers: {},
            config: {} as any
        };
    }

    /**
     * Calcular analytics desde las métricas de una planta
     */
    calculateAnalyticsFromMetrics(plantId: number, metrics: any[], deviceId?: string): Analytics {
        return AnalyticsAssembler.fromPlantMetrics(plantId, metrics, deviceId);
    }

    /**
     * Obtener el promedio de los últimos N datos de sensores
     * Ordena por fecha y toma los más recientes
     */
    async getRecentAverages(limit: number = 5): Promise<AxiosResponse<any>> {
        const res = await this.getAllSensorData();
        
        console.log('[AnalyticsService] Raw data from backend:', res.data);
        
        // Ordenar por fecha (más reciente primero)
        const sortedData = [...res.data].sort((a: any, b: any) => 
            new Date(b.timestamp || b.created_at).getTime() - new Date(a.timestamp || a.created_at).getTime()
        );
        
        // Tomar los últimos N registros ordenados
        const recentData = sortedData.slice(0, limit);
        
        console.log('[AnalyticsService] Recent data selected:', recentData);
        
        if (recentData.length === 0) {
            return {
                ...res,
                data: {
                    avgTemperature: 0,
                    avgHumidity: 0,
                    avgSoilMoisture: 0,
                    avgLight: 0,
                    minTemperature: 0,
                    maxTemperature: 0,
                    count: 0,
                    period: { start: null, end: null },
                    history: []
                }
            };
        }

        // Mapear los datos crudos a SensorData
        const mappedData = recentData.map((d: any) => AnalyticsAssembler.mapSensorData(d));
        console.log('[AnalyticsService] Mapped data:', mappedData);
        
        const summary = AnalyticsAssembler.calculateSummary(mappedData);
        console.log('[AnalyticsService] Calculated summary:', summary);

        const dates = recentData.map((d: any) => d.timestamp || d.created_at);
        
        return {
            ...res,
            data: {
                ...summary,
                count: recentData.length,
                period: {
                    start: dates[dates.length - 1], // El más antiguo de los últimos N
                    end: dates[0] // El más reciente
                },
                history: mappedData
            }
        };
    }
}
