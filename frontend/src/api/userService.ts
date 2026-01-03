import axiosInstance from "./axiosInstance";
import type { components } from "../types/api";

export type UserResponse = components["schemas"]["UserResponse"];
export type UserCreate = components["schemas"]["UserCreate"];

export const userService = {
  /**
   * Demo login endpoint that returns a JWT token without Auth0.
   */
  demoLogin: async (): Promise<{
    access_token: string;
    token_type: string;
    user: UserResponse;
  }> => {
    const { data } = await axiosInstance.post("/auth/demo-login");
    return data;
  },

  /**
   * Sync or create user in backend from Auth0 authentication.
   * This ensures the backend has the latest user information.
   */
  syncUser: async (
    token: string,
    userData: UserCreate
  ): Promise<UserResponse> => {
    const { data } = await axiosInstance.post<UserResponse>(
      "/users/sync",
      userData,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return data;
  },

  /**
   * Get current user profile from backend.
   * Requires user to be synced first.
   */
  getProfile: async (token: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.get<UserResponse>("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  },
};
