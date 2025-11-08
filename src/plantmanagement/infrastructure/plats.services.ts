import type { Plant } from "../domain/model/plants.entity.ts";
import { BaseApi, ENDPOINTS } from "../../shared/infrastructure/base-endpoint";


export class PlantsService {
    private baseApi: BaseApi;

    constructor() {
        this.baseApi = new BaseApi();
    }

    // Endpoint de la fake API para plants
    resourceEndpoint = ENDPOINTS.PLANTS;

    private normalizeStatus(s?: string): Plant['status'] {
        if (!s) return 'healthy';
        const up = String(s).toUpperCase();
        switch (up) {
            case 'HEALTHY': return 'healthy';
            case 'WARNING': return 'warning';
            case 'CRITICAL': return 'critical';
            default: return up.toLowerCase() as Plant['status'];
        }
    }

    private mapBackendToPlant(raw: any): Plant {
        return {
            id: Number(raw.id),
            userId: String(raw.userId),
            name: raw.name ?? '',
            type: raw.type ?? '',
            imgUrl: raw.imgUrl ?? '',
            bio: raw.bio ?? '',
            location: raw.location ?? '',
            status: this.normalizeStatus(raw.status),
            lastWatered: raw.lastWatered ?? '',
            nextWatering: raw.nextWatering ?? '',
            metrics: raw.metrics ?? [],
            wateringLogs: raw.wateringLogs ?? [],
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        };
    }


    async getPlantsByUser(userId: string) {
        // Validación defensiva: evitar peticiones con userId inválido
        if (!userId || userId === 'undefined' || userId === 'null') {
            throw new Error('Invalid userId provided to getPlantsByUser');
        }
        // GET /api/v1/plants/users/{userId}/plants
        const res = await this.baseApi.http.get<any>(`/plants/users/${encodeURIComponent(userId)}/plants`);
        
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map(r => this.mapBackendToPlant(r));

        return { ...res, data: mapped };
    }


    async getPlantById(plantId: number | string) {
        // GET https://fakeapiplant.vercel.app/plants/{plantId}
        const res = await this.baseApi.http.get<any>(`${this.resourceEndpoint}/${plantId}`);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async createPlant(plantResource: Omit<Plant, 'id'>) {
        // POST https://fakeapiplant.vercel.app/plants
        const body = {
            ...plantResource,
            status: (plantResource.status || 'healthy').toUpperCase(),
        };
        const res = await this.baseApi.http.post<any>(`${this.resourceEndpoint}`, body);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async updatePlant(plantId: number | string, plantResource: Plant) {
        // PUT https://fakeapiplant.vercel.app/plants/{plantId}
        const body = { ...plantResource, status: (plantResource.status || 'healthy').toUpperCase() };
        const res = await this.baseApi.http.put<any>(`${this.resourceEndpoint}/${plantId}`, body);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async deletePlant(plantId: number | string) {
        // DELETE https://fakeapiplant.vercel.app/plants/{plantId}
        return this.baseApi.http.delete(`${this.resourceEndpoint}/${plantId}`);
    }
}
