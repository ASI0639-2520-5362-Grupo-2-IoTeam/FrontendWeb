import { BaseApi } from '../../shared/infrastructure/base-api';
import type {
	UserProfile,
	ProfileUpdateRequest,
	AvatarUploadResponse,
	UserStats,
	AchievementsResponse,
} from '../model/profile.entity';
import type { AxiosRequestConfig } from 'axios';

class ProfileService {
	private baseApi: BaseApi;
	// BaseApi.baseURL already includes the `/api/v1` prefix from the environment variable.
	// Use the relative resource path (same pattern as PlantsService) to avoid duplicating `/api/v1`.
	private readonly resourceEndpoint = '/users';

	constructor() {
		this.baseApi = new BaseApi();
	}

	private getAuthHeaders(): AxiosRequestConfig {
		const token = localStorage.getItem('token');
		if (!token) {
			console.warn('[ProfileService] No token found in localStorage. Request will be sent without Authorization.');
		}
		return {
			headers: {
				'Authorization': token ? `Bearer ${token}` : '',
				'Content-Type': 'application/json'
			}
		};
	}

	async getProfile(): Promise<UserProfile> {
		const token = localStorage.getItem('token');
		console.log('[ProfileService] getProfile() - Token present:', !!token);
		const response = await this.baseApi.http.get<UserProfile>(
			`${this.resourceEndpoint}/profile`,
			this.getAuthHeaders()
		);
		console.log('[ProfileService] getProfile() response:', response.data);
		return response.data;
	}

	async updateProfile(data: ProfileUpdateRequest): Promise<UserProfile> {
		const response = await this.baseApi.http.patch<UserProfile>(
			`${this.resourceEndpoint}/profile`,
			data,
			this.getAuthHeaders()
		);
		return response.data;
	}

	async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
		const formData = new FormData();
		formData.append('file', file);

		const response = await this.baseApi.http.post<AvatarUploadResponse>(
			`${this.resourceEndpoint}/profile/avatar`,
			formData,
			{
				...this.getAuthHeaders(),
				headers: {
					'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : '',
					'Content-Type': 'multipart/form-data',
				},
			}
		);
		return response.data;
	}

	async getStats(): Promise<UserStats> {
		const response = await this.baseApi.http.get<UserStats>(
			`${this.resourceEndpoint}/stats`,
			this.getAuthHeaders()
		);
		return response.data;
	}

	async getAchievements(): Promise<AchievementsResponse> {
		const response = await this.baseApi.http.get<AchievementsResponse>(
			`${this.resourceEndpoint}/achievements`,
			this.getAuthHeaders()
		);
		return response.data;
	}
}

export const profileService = new ProfileService();
