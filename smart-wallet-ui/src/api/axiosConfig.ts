import axios from 'axios';
import { isLocalToken, localAdapter } from '../lib/localAuth';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

const getCurrentToken = () => localStorage.getItem('token');

const isAuthEndpoint = (url?: string) => {
    const requestUrl = url ?? '';
    return requestUrl.includes('/v1/auth/authenticate') || requestUrl.includes('/v1/auth/register');
};

// Callback enregistré par AuthContext pour réagir à une session expirée
let unauthorizedHandler: (() => void) | null = null;

export const setUnauthorizedHandler = (handler: (() => void) | null) => {
    unauthorizedHandler = handler;
};

// Intercepteur pour ajouter le token automatiquement si présent
api.interceptors.request.use((config) => {
    if (isAuthEndpoint(config.url)) {
        return config;
    }

    const token = getCurrentToken();
    // Session locale (aucun backend) : les requêtes sont servies depuis le navigateur
    if (isLocalToken(token)) {
        config.adapter = localAdapter;
        return config;
    }
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Intercepteur global : un 401 hors authentification signifie token absent/expiré -> déconnexion
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401 && !isAuthEndpoint(error.config?.url)) {
            if (getCurrentToken() !== 'sw-demo-session') {
                localStorage.removeItem('token');
                unauthorizedHandler?.();
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Extrait un message lisible d'une erreur API.
 * Le backend renvoie soit `{ message }` (TransactionController), soit une chaîne brute (GlobalExceptionHandler).
 */
export const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (axios.isAxiosError(error)) {
        const data: unknown = error.response?.data;
        if (typeof data === 'string' && data.trim()) {
            if (data.includes('Username already in use')) return "Ce nom d'utilisateur est déjà utilisé.";
            if (data.includes('Email already in use')) return "Cette adresse e-mail est déjà utilisée.";
            return data;
        }
        if (data && typeof data === 'object') {
            if ('message' in data && typeof data.message === 'string' && data.message) {
                if (data.message.includes('Username already in use')) return "Ce nom d'utilisateur est déjà utilisé.";
                if (data.message.includes('Email already in use')) return "Cette adresse e-mail est déjà utilisée.";
                return data.message;
            }
            if ('error' in data && typeof data.error === 'string' && data.error) {
                return data.error;
            }
        }
        return fallback;
    }
    return error instanceof Error && error.message ? error.message : fallback;
};

export default api;
