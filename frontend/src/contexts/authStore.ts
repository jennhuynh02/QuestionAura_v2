// Module-level store for axiosInstance to access token outside React components
let demoTokenStore: string | null = null;

export function getDemoToken(): string | null {
  return demoTokenStore;
}

export function setDemoTokenStore(token: string | null): void {
  demoTokenStore = token;
}
