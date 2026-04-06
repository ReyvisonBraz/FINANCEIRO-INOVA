import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

export interface ApiResponse<T> {
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  message: string;
  status?: number;
  details?: unknown;
}

const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: '/api',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    (error) => {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            window.location.href = '/login';
            break;
          case 403:
            console.error('Acesso negado');
            break;
          case 404:
            console.error('Recurso não encontrado');
            break;
          case 500:
            console.error('Erro interno do servidor');
            break;
          default:
            console.error('Erro na requisição:', error.response.data);
        }
      } else if (error.request) {
        console.error('Sem resposta do servidor');
      } else {
        console.error('Erro ao configurar requisição:', error.message);
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createApiInstance();
export default api;
