import http from "../../../shared/services/http-common.ts";
import type { Plant } from "../model/plants.entity";


export class PlantsService {

    // baseURL en http-common.ts ya apunta a '/api', por eso aquí usamos '/v1/plants'
    resourceEndpoint = '/v1/plants';

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
        // GET /api/v1/plants/user/{userId}?t=timestamp para evitar caché
        const timestamp = Date.now();
        const res = await http.get<any[]>(`${this.resourceEndpoint}/user/${userId}?t=${timestamp}`);
        const mapped = (res.data || []).map(r => this.mapBackendToPlant(r));
        return { ...res, data: mapped };
    }


    async getPlantById(plantId: number | string) {
        // GET /api/v1/plants/1
        const res = await http.get<any>(`${this.resourceEndpoint}/${plantId}`);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async createPlant(plantResource: Omit<Plant, 'id'>) {
        // POST /api/v1/plants
        // El backend Spring espera el userId en el body
        const body = {
            ...plantResource,
            status: (plantResource.status || 'healthy').toUpperCase(),
            humidity: Number(plantResource.humidity || 0)
        };
        // Debug: mostrar payload y token preview
        try {
            const token = localStorage.getItem('token');
            const tokenPreview = token ? `${token.substring(0,6)}...${token.substring(token.length-6)}` : 'no-token';
            console.debug('[PlantsService] createPlant body (con userId)=', body, 'token=', tokenPreview);
        } catch (e) {
            // ignore
        }

        const res = await http.post<any>(`${this.resourceEndpoint}`, body);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async updatePlant(plantId: number | string, plantResource: Plant) {
        // PUT /api/v1/plants/1
        const body = { ...plantResource, status: (plantResource.status || 'healthy').toUpperCase() };
        const res = await http.put<any>(`${this.resourceEndpoint}/${plantId}`, body);
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async deletePlant(plantId: number | string) {
        // DELETE /api/v1/plants/1
        return http.delete(`${this.resourceEndpoint}/${plantId}`);
    }
}