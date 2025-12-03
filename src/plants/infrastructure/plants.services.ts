import type { Plant } from "../domain/model/plants.entity.ts";
import { BaseApi, ENDPOINTS } from "../../shared/infrastructure/base-endpoint.ts";
import type { AxiosRequestConfig } from 'axios';
import { PlantAssembler } from "./assambler/plants-assembler.ts";


export class PlantsService {
  private baseApi: BaseApi;
  private resourceEndpoint = ENDPOINTS.PLANTS;

  constructor() {
    this.baseApi = new BaseApi();
  }

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

  async getPlantsByUser(userId: string) {
    if (!userId || userId === 'undefined' || userId === 'null') {
      throw new Error('Invalid userId provided to getPlantsByUser');
    }
    const res = await this.baseApi.http.get<any>(
      `/users/${encodeURIComponent(userId)}/plants`,
      this.getAuthHeaders()
    );
    const data = Array.isArray(res.data) ? res.data : [];
    const mapped = data.map(r => PlantAssembler.toDomain(r));
    return { ...res, data: mapped };
  }

  async getPlantById(plantId: number | string) {
    const res = await this.baseApi.http.get<any>(
      `${this.resourceEndpoint}/${plantId}`,
      this.getAuthHeaders()
    );
    return { ...res, data: PlantAssembler.toDomain(res.data) };
  }

  async createPlant(plantResource: { userId: string; name: string; type: string; imgUrl?: string; bio?: string; location?: string; }) {
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
    return { ...res, data: PlantAssembler.toDomain(res.data) };
  }

  async updatePlant(plantId: number | string, plantResource: Plant) {
    const body = PlantAssembler.toBackend(plantResource);
    const res = await this.baseApi.http.put<any>(
      `${this.resourceEndpoint}/${plantId}`,
      body,
      this.getAuthHeaders()
    );
    return { ...res, data: PlantAssembler.toDomain(res.data) };
  }

  async deletePlant(plantId: number | string) {
    return this.baseApi.http.delete(
      `${this.resourceEndpoint}/${plantId}`,
      this.getAuthHeaders()
    );
  }

  async waterPlant(plantId: number | string, wateredAt?: string) {
    const body = wateredAt ? { wateredAt } : {};
    await this.baseApi.http.post<any>(
      `${this.resourceEndpoint}/${plantId}/watering`,
      body,
      this.getAuthHeaders()
    );
    // After watering, always re-fetch the plant data to get the updated state including metrics.
    return this.getPlantById(plantId);
  }
}
