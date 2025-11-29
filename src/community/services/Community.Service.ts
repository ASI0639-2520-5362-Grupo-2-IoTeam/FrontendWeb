import http from '../../shared/services/http-common';
import type { AxiosResponse } from 'axios';

export interface JoinCommunityResponse {
    id: number;
    userId: string;
    joinedAt: string;
}

export interface CommunityMember {
    userId: string;
    role: string;
    joinedAt: string;
}

export interface CreatePostRequest {
    title: string;
    content: string;
    species: string;
    tag: string;
    userId: string;
}

export class CommunityService {
    
    constructor() {
        this.ensureCleanToken();
    }

    /**
     * Verifica y limpia el token en localStorage si tiene comillas extra.
     */
    private ensureCleanToken(): void {
        const token = localStorage.getItem('token');
        if (token && token.startsWith('"') && token.endsWith('"')) {
            const cleanToken = token.slice(1, -1);
            localStorage.setItem('token', cleanToken);
            console.debug('[CommunityService] 🧹 Token limpiado en localStorage');
        }
    }

    /**
     * Helper para obtener el token limpio para los headers.
     */
    private getAuthHeader(): { Authorization: string } | {} {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }

    /**
     * Helper para obtener la URL base correcta (sin /v1 si existe).
     */
    private getCommunityUrl(endpoint: string): string {
        let baseURL = http.defaults.baseURL || '';
        if (baseURL.endsWith('/v1')) {
            baseURL = baseURL.replace('/v1', '');
        }
        if (baseURL.endsWith('/')) {
            baseURL = baseURL.slice(0, -1);
        }
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseURL}${path}`;
    }

    /**
     * Verifica si el usuario ya está registrado en la comunidad.
     */
    async checkMembership(userId: string): Promise<boolean> {
        try {
            console.debug('[CommunityService] Verificando membresía para:', userId);
            const url = this.getCommunityUrl('/community/members');
            
            const response = await http.get<CommunityMember[]>(url, {
                headers: { 
                    'Accept': '*/*',
                    ...this.getAuthHeader()
                }
            });
            
            const isMember = response.data.some(member => member.userId === userId);
            return isMember;
        } catch (error: any) {
            console.error('[CommunityService] Error verificando membresía:', error);
            return false;
        }
    }

    /**
     * Registra al usuario en la comunidad.
     */
    async joinCommunity(userId: string): Promise<AxiosResponse<JoinCommunityResponse>> {
        try {
            console.debug('[CommunityService] Registrando usuario:', userId);
            const url = this.getCommunityUrl(`/community/members?userId=${userId}`);
            
            const response = await http.post<JoinCommunityResponse>(
                url,
                {}, 
                { 
                    headers: { 
                        'Accept': '*/*',
                        ...this.getAuthHeader()
                    } 
                }
            );
            return response;
        } catch (error) {
            console.error('[CommunityService] Error en registro:', error);
            throw error;
        }
    }

    /**
     * Crea un nuevo post en la comunidad.
     * POST /community/posts?userId=...&title=...
     */
    async createPost(postData: CreatePostRequest): Promise<AxiosResponse<any>> {
        try {
            console.debug('[CommunityService] Creando post (Query Params):', postData);
            
            // Construir Query Params
            const params = new URLSearchParams();
            params.append('userId', postData.userId);
            params.append('title', postData.title);
            params.append('content', postData.content);
            params.append('species', postData.species);
            params.append('tag', postData.tag);

            const url = this.getCommunityUrl(`/community/posts?${params.toString()}`);
            
            // Enviar POST con URL completa y cuerpo vacío
            const response = await http.post(
                url,
                {}, // Cuerpo vacío
                { 
                    headers: { 
                        'Accept': '*/*',
                        ...this.getAuthHeader()
                    } 
                }
            );
            
            console.debug('[CommunityService] Post creado exitosamente');
            return response;
        } catch (error) {
            console.error('[CommunityService] Error creando post:', error);
            throw error;
        }
    }

    /**
     * Elimina un post de la comunidad.
     * DELETE /community/posts/{postId}?userId=...
     */
    async deletePost(postId: number, userId: string): Promise<AxiosResponse<any>> {
        try {
            console.debug(`[CommunityService] Eliminando post ${postId} del usuario ${userId}`);
            
            const url = this.getCommunityUrl(`/community/posts/${postId}?userId=${userId}`);
            
            const response = await http.delete(
                url,
                { 
                    headers: { 
                        'Accept': '*/*',
                        ...this.getAuthHeader()
                    } 
                }
            );
            
            console.debug('[CommunityService] Post eliminado exitosamente');
            return response;
        } catch (error) {
            console.error('[CommunityService] Error eliminando post:', error);
            throw error;
        }
    }
}

export const communityService = new CommunityService();
