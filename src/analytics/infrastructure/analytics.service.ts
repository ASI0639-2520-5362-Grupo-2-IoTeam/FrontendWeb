import type { Analytics, AnalyticsSummary } from "../domain/model/analytics.entity.ts";
import { BaseApi, ENDPOINTS } from "../../shared/infrastructure/base-endpoint";


export class AnalyticsService {
    private baseApi: BaseApi;

    constructor() {
        this.baseApi = new BaseApi();
    }

    // Endpoint de la fake API para analytics
    resourceEndpoint = ENDPOINTS.ANALYTICS;

    private mapBackendToAnalytics(raw: any): Analytics {
        return {
            id: Number(raw.id),
            userId: String(raw.userId),
            plantId: Number(raw.plantId),
            periodStart: raw.periodStart ?? '',
            periodEnd: raw.periodEnd ?? '',
            summary: {
                avgHumidity: raw.summary?.avgHumidity != null ? Number(raw.summary.avgHumidity) : 0,
                avgSoilMoisture: raw.summary?.avgSoilMoisture != null ? Number(raw.summary.avgSoilMoisture) : 0,
                wateringCount: raw.summary?.wateringCount != null ? Number(raw.summary.wateringCount) : 0,
                criticalAlerts: raw.summary?.criticalAlerts != null ? Number(raw.summary.criticalAlerts) : 0
            } as AnalyticsSummary,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        } as Analytics;
    }


    async getAnalyticsByUser(userId: string) {
        // Validación defensiva: evitar peticiones con userId inválido
        if (!userId || userId === 'undefined' || userId === 'null') {
            throw new Error('Invalid userId provided to getAnalyticsByUser');
        }
        // GET https://fakeapiplant.vercel.app/analytics?userId={userId}
        const res = await this.baseApi.http.get<any[]>(`${this.resourceEndpoint}?userId=${encodeURIComponent(userId)}`);
        const mapped = (res.data || []).map(r => this.mapBackendToAnalytics(r));
        return { ...res, data: mapped };
    }


    async getAnalyticsByPlant(plantId: number | string) {
        // GET https://fakeapiplant.vercel.app/analytics?plantId={plantId}
        const res = await this.baseApi.http.get<any[]>(`${this.resourceEndpoint}?plantId=${plantId}`);
        const mapped = (res.data || []).map(r => this.mapBackendToAnalytics(r));
        return { ...res, data: mapped };
    }


    async getAnalyticsById(analyticsId: number | string) {
        // GET https://fakeapiplant.vercel.app/analytics/{analyticsId}
        const res = await this.baseApi.http.get<any>(`${this.resourceEndpoint}/${analyticsId}`);
        return { ...res, data: this.mapBackendToAnalytics(res.data) };
    }


    async getAnalyticsByUserAndPlant(userId: string, plantId: number | string) {
        // Validación defensiva
        if (!userId || userId === 'undefined' || userId === 'null') {
            throw new Error('Invalid userId provided to getAnalyticsByUserAndPlant');
        }
        // GET https://fakeapiplant.vercel.app/analytics?userId={userId}&plantId={plantId}
        const res = await this.baseApi.http.get<any[]>(`${this.resourceEndpoint}?userId=${encodeURIComponent(userId)}&plantId=${plantId}`);
        const mapped = (res.data || []).map(r => this.mapBackendToAnalytics(r));
        return { ...res, data: mapped };
    }


    async createAnalytics(analyticsResource: Omit<Analytics, 'id'>) {
        // POST https://fakeapiplant.vercel.app/analytics
        const body = {
            ...analyticsResource,
            plantId: Number(analyticsResource.plantId),
            summary: {
                ...analyticsResource.summary,
                avgHumidity: Number(analyticsResource.summary.avgHumidity || 0),
                avgSoilMoisture: Number(analyticsResource.summary.avgSoilMoisture || 0),
                wateringCount: Number(analyticsResource.summary.wateringCount || 0),
                criticalAlerts: Number(analyticsResource.summary.criticalAlerts || 0)
            }
        };
        const res = await this.baseApi.http.post<any>(`${this.resourceEndpoint}`, body);
        return { ...res, data: this.mapBackendToAnalytics(res.data) };
    }


    async updateAnalytics(analyticsId: number | string, analyticsResource: Analytics) {
        // PUT https://fakeapiplant.vercel.app/analytics/{analyticsId}
        const body = {
            ...analyticsResource,
            plantId: Number(analyticsResource.plantId),
            summary: {
                ...analyticsResource.summary,
                avgHumidity: Number(analyticsResource.summary.avgHumidity || 0),
                avgSoilMoisture: Number(analyticsResource.summary.avgSoilMoisture || 0),
                wateringCount: Number(analyticsResource.summary.wateringCount || 0),
                criticalAlerts: Number(analyticsResource.summary.criticalAlerts || 0)
            }
        };
        const res = await this.baseApi.http.put<any>(`${this.resourceEndpoint}/${analyticsId}`, body);
        return { ...res, data: this.mapBackendToAnalytics(res.data) };
    }


    async deleteAnalytics(analyticsId: number | string) {
        // DELETE https://fakeapiplant.vercel.app/analytics/{analyticsId}
        return this.baseApi.http.delete(`${this.resourceEndpoint}/${analyticsId}`);
    }


    // Métodos adicionales específicos para analytics
    async getAnalyticsByDateRange(userId: string, startDate: string, endDate: string) {
        // Validación defensiva
        if (!userId || userId === 'undefined' || userId === 'null') {
            throw new Error('Invalid userId provided to getAnalyticsByDateRange');
        }
        // GET con filtros de fecha - la fake API podría no soportar esto completamente
        const res = await this.baseApi.http.get<any[]>(`${this.resourceEndpoint}?userId=${encodeURIComponent(userId)}`);
        // Filtrar por fecha en el cliente como fallback
        const filtered = (res.data || []).filter((item: any) => {
            const itemStart = new Date(item.periodStart);
            const itemEnd = new Date(item.periodEnd);
            const filterStart = new Date(startDate);
            const filterEnd = new Date(endDate);
            return itemStart >= filterStart && itemEnd <= filterEnd;
        });
        const mapped = filtered.map(r => this.mapBackendToAnalytics(r));
        return { ...res, data: mapped };
    }
}