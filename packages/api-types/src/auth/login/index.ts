export interface LoginRequest {
  credential: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
}
