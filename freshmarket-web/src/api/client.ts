import axios from "axios";
import { endpoints } from "../lib/endpoints";

const client = axios.create({
  baseURL: "http://localhost:5045",
  headers: { "Content-Type": "application/json" },
});

// ─── Request: anexar access token ───────────────────────────────────────────
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Response: tentar refresh em 401, depois redirecionar ───────────────────
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (err: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Ignora erros que não sejam 401, ou que já foram retentados, ou que sejam do próprio endpoint de refresh
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Enfileirar pedidos enquanto o refresh está em curso
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(client(original));
          },
          reject,
        });
      });
    }

    original._retry   = true;
    isRefreshing      = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      isRefreshing = false;
      localStorage.removeItem("accessToken");
      window.location.href = "/auth";
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post(
        `http://localhost:5045${endpoints.auth.refresh}`,
        { refreshToken }
      );

      localStorage.setItem("accessToken",  data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      client.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
      original.headers.Authorization = `Bearer ${data.accessToken}`;

      processQueue(null, data.accessToken);
      return client(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/auth";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default client;