import http from "../../../shared/services/http-common.ts";
import type { Plant } from "../model/plants.entity";


export class PlantsService {

    resourceEndpoint = '/plants';


    getPlantsByUser(userId: number) {
        // En json-server, esto se traduce a: GET /plants?userId=3
        return http.get<Plant[]>(`${this.resourceEndpoint}?userId=${userId}`);
    }


    getPlantById(plantId: number) {
        // GET /plants/1
        return http.get<Plant>(`${this.resourceEndpoint}/${plantId}`);
    }


    createPlant(plantResource: Omit<Plant, 'id'>) {
        // POST /plants (json-server automáticamente asigna el ID)
        return http.post<Plant>(`${this.resourceEndpoint}`, plantResource);
    }


    updatePlant(plantId: number, plantResource: Plant) {
        // PUT /plants/1
        return http.put<Plant>(`${this.resourceEndpoint}/${plantId}`, plantResource);
    }


    deletePlant(plantId: number) {
        // DELETE /plants/1
        return http.delete(`${this.resourceEndpoint}/${plantId}`);
    }
}