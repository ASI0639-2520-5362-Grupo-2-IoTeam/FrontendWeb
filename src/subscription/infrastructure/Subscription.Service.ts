import http from "../../shared/services/http-common.ts";
import type { AxiosResponse } from "axios";
import type { Subscription } from "../domain/model/Subscription.model.ts";

export class SubscriptionService {

    async getByUserId(uuid: string): Promise<AxiosResponse<Subscription>> {
        return http.get<Subscription>(`/subscriptions/${uuid}`);
    }

    async cancel(userId: string): Promise<AxiosResponse<Subscription>> {
        return http.post<Subscription>(`/subscriptions/${userId}/cancelled`);
    }

    async reactivate(userId: string): Promise<AxiosResponse<Subscription>> {
        return http.post<Subscription>(`/subscriptions/${userId}/active`);
    }

    async subscribeOrChangePlan(data: {
        userId: string;
        planType: string;
    }): Promise<AxiosResponse<Subscription>> {
        return http.post<Subscription>("/subscriptions", data);
    }

    async getAll(): Promise<AxiosResponse<Subscription[]>> {
        return http.get<Subscription[]>("/subscriptions");
    }
}
