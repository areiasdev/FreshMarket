export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  role: "Customer" | "Admin";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}
