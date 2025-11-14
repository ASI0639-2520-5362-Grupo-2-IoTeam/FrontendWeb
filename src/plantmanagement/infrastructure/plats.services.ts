import type { Plant } from "../domain/model/plants.entity.ts";
import { BaseApi, ENDPOINTS } from "../../shared/infrastructure/base-endpoint";
import type { AxiosRequestConfig } from 'axios';


export class PlantsService {
    private baseApi: BaseApi;

    constructor() {
        this.baseApi = new BaseApi();
    }

    // Endpoint de la API para plants
    resourceEndpoint = ENDPOINTS.PLANTS;

    /**
     * Obtiene el token JWT del localStorage para agregarlo en los headers
     */
    private getAuthHeaders(): AxiosRequestConfig {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('[PlantsService] No token found in localStorage. Request will be sent without Authorization.');
        }
        return {
            headers: {
                'Authorization': token ? `Bearer ${token}` : '',
                'Content-Type': 'application/json'
            }
        };
    }

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
        // GET /api/v1/users/{userId}/plants
        const res = await this.baseApi.http.get<any>(
            `/users/${encodeURIComponent(userId)}/plants`,
            this.getAuthHeaders()
        );

        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map(r => this.mapBackendToPlant(r));

        return { ...res, data: mapped };
    }


    async getPlantById(plantId: number | string) {
        // GET /api/v1/plants/{plantId}
        const res = await this.baseApi.http.get<any>(
            `${this.resourceEndpoint}/${plantId}`,
            this.getAuthHeaders()
        );
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async createPlant(plantResource: { userId: string; name: string; type: string; imgUrl?: string; bio?: string; location?: string; }) {
        /**
         * POST /api/v1/plants
         * Ahora el backend espera que se envíe el userId junto con los datos básicos.
         *
         * Body esperado por el backend:
         * {
         *   userId: string,
         *   name: string,
         *   type: string,
         *   imgUrl?: string,
         *   bio?: string,
         *   location?: string
         * }
         */
        const body = {
            userId: plantResource.userId,
            name: plantResource.name,
            type: plantResource.type,
            imgUrl: plantResource.imgUrl || '',
            bio: plantResource.bio || '',
            location: plantResource.location || ''
        };

        const res = await this.baseApi.http.post<any>(
            `${this.resourceEndpoint}`,
            body,
            this.getAuthHeaders()
        );

        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async updatePlant(plantId: number | string, plantResource: Plant) {
        // PUT /api/v1/plants/{plantId}
        const body = { ...plantResource, status: (plantResource.status || 'healthy').toUpperCase() };
        const res = await this.baseApi.http.put<any>(
            `${this.resourceEndpoint}/${plantId}`,
            body,
            this.getAuthHeaders()
        );
        return { ...res, data: this.mapBackendToPlant(res.data) };
    }


    async deletePlant(plantId: number | string) {
        // DELETE /api/v1/plants/{plantId}
        return this.baseApi.http.delete(
            `${this.resourceEndpoint}/${plantId}`,
            this.getAuthHeaders()
        );
    }

    /**
     * Registra un riego para una planta específica
     * POST /api/v1/plants/{plantId}/watering
     *
     * El backend:
     * 1. Autentica el token y obtiene userId
     * 2. Verifica que la planta pertenece al usuario
     * 3. Actualiza lastWatered y recalcula nextWatering
     * 4. Registra un log en wateringLogs
     * 5. Devuelve 200 OK con la planta actualizada
     *
     * @param plantId - ID de la planta a regar
     * @param wateredAt - (Opcional) Fecha/hora del riego. Si no se envía, el backend usa now()
     * @returns Promise con la planta actualizada
     */
    async waterPlant(plantId: number | string, wateredAt?: string) {
        const body = wateredAt ? { wateredAt } : {};

        const res = await this.baseApi.http.post<any>(
            `${this.resourceEndpoint}/${plantId}/watering`,
            body,
            this.getAuthHeaders()
        );

        // El backend debe devolver 200 OK con la planta actualizada
        // Si devuelve 204 No Content, necesitaremos hacer un GET adicional
        if (res.status === 204) {
            // Si el backend devuelve 204, hacer un GET para obtener la planta actualizada
            return this.getPlantById(plantId);
        }

        return { ...res, data: this.mapBackendToPlant(res.data) };
    }
}
