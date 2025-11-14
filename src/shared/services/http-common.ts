import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


import { authenticationInterceptor} from "../../iam/services/Authentication.Interceptor.ts";


// Usar el proxy de Vite para evitar problemas CORS
// El proxy reescribe /api a http://localhost:8090/api
const API_BASE_URL: string = (import.meta.env.VITE_PLANTCARE_API_URL as string) || '/api/v1';


const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {

        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 30000,
    withCredentials: false
});


http.defaults.headers.common['Content-Type'] = 'application/json';
http.defaults.headers.common['Accept'] = 'application/json';



http.interceptors.request.use(

    authenticationInterceptor as (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig> | InternalAxiosRequestConfig,


    (error: AxiosError) => Promise.reject(error)
);


http.interceptors.response.use(

    (response: AxiosResponse) => response,


    (error: AxiosError) => {
        console.error('HTTP Error:', error.message);


        if (error.code === 'ENOTFOUND' || error.code === 'ERR_NETWORK') {
            console.error('Error de red o servidor no encontrado');
        }


        if (error.response) {
            console.error('Response Status:', error.response.status);
            try {
                console.error('Response Data:', error.response.data);
            } catch (e) { /* ignore */ }
        }

        return Promise.reject(error);
    }
);


export default http;