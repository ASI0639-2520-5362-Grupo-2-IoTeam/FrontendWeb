import axios, { type AxiosInstance } from "axios";


const platformApi: string = import.meta.env.VITE_LEARNING_PLATFORM_API_URL;

export class BaseApi {

    private httpInstance: AxiosInstance;

    constructor() {
        this.httpInstance = axios.create({
            baseURL: platformApi,
        });
    }


    public get http(): AxiosInstance {
        return this.httpInstance;
    }
}