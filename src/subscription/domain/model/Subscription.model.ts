export interface Subscription {
    id: string;
    userId: string;
    planName: {
        id: string;
        type: 'NONE' | 'BASIC' | 'PREMIUM';
        description: string;
        price: number;
    };
    status: 'PENDING' | 'ACTIVE' | 'CANCELLED';
    startDate: string;
    endDate?: string;
    nextBillingDate?: string;
}
export interface SubscriptionResponse {
    id: string;
    userId: string;
    planName: string;
    status: 'PENDING' | 'ACTIVE' | 'CANCELLED';
    startDate: string;
    endDate?: string;
    nextBillingDate?: string;
}