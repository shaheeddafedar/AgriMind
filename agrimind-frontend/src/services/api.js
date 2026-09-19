import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
    withCredentials: true
});

export const rootApi = axios.create({
    baseURL: '/',
    withCredentials: true
});

export default api;