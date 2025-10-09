import axios from "axios";
import type { Plant } from "../domain/model/plants.entity.ts";


export class PlantsService {

    // Cambiamos la baseURL a la de la fake API
    resourceEndpoint = 'https://fakeapiplant.vercel.app/plants';

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
            humidity: raw.humidity != null ? Number(raw.humidity) : 0,
            lastWatered: raw.lastWatered ?? '',
            nextWatering: raw.nextWatering ?? '',
            status: this.normalizeStatus(raw.status),
            bio: raw.bio ?? '',
            location: raw.location ?? '',
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt
        } as Plant;
    }


    async getPlantsByUser(userId: string) {
        // Validación defensiva: evitar peticiones con userId inválido
        if (!userId || userId === 'undefined' || userId === 'null') {
            throw new Error('Invalid userId provided to getPlantsByUser');
        }
        // GET https://fakeapiplant.vercel.app/plants?userId={userId}
        const res = await axios.get<any[]>(`${this.resourceEndpoint}?userId=${encodeURIComponent(userId)}`);
        const mapped = (res.data || []).map(r => this.mapBackendToPlant(r));
        return { ...res, data: mapped };
    }


    async getPlantById(plantId: number | string) {
        // GET https://fakeapiplant.vercel.app/plants/{plantId}
        const res = await axios.get<any>(`${this.resourceEndpoint}/${plantId}`);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async createPlant(plantResource: Omit<Plant, 'id'>) {
        // POST https://fakeapiplant.vercel.app/plants
        const body = {
            ...plantResource,
            status: (plantResource.status || 'healthy').toUpperCase(),
            humidity: Number(plantResource.humidity || 0)
        };
        const res = await axios.post<any>(`${this.resourceEndpoint}`, body);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async updatePlant(plantId: number | string, plantResource: Plant) {
        // PUT https://fakeapiplant.vercel.app/plants/{plantId}
        const body = { ...plantResource, status: (plantResource.status || 'healthy').toUpperCase() };
        const res = await axios.put<any>(`${this.resourceEndpoint}/${plantId}`, body);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async deletePlant(plantId: number | string) {
        // DELETE https://fakeapiplant.vercel.app/plants/{plantId}
        return axios.delete(`${this.resourceEndpoint}/${plantId}`);
    }
}