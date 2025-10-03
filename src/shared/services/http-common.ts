import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';


import { authenticationInterceptor} from "../../IAM/services/Authentication.Interceptor.ts";


const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:3000';


const http: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {

        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: 10000,
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
        }

        return Promise.reject(error);
    }
);


export default http;