// Mock integration utilities for UI-only components
export interface IntegrationStatus {
  database: 'connected' | 'disconnected' | 'error';
  auth: 'configured' | 'missing' | 'error';
  ai: 'available' | 'unavailable' | 'error';
  storage: 'ready' | 'not-ready' | 'error';
  environment?: string;
  integrationMethod?: string;
  coreAvailable?: boolean;
  usingMocks?: boolean;
}

export const getIntegrationStatus = async (): Promise<IntegrationStatus> => {
  // Mock integration status for UI demo
  return {
    database: 'connected',
    auth: 'configured',
    ai: 'available',
    storage: 'ready',
    environment: 'development',
    integrationMethod: 'mock',
    coreAvailable: false,
    usingMocks: true
  };
};

export const checkIntegrationStatus = getIntegrationStatus;

export const testConnection = async (service: string): Promise<boolean> => {
  // Mock connection test
  return true;
};

export const coreIntegration = {
  status: 'connected',
  services: ['database', 'auth', 'ai', 'storage'],
  health: 'good',
  auth: {
    status: 'connected',
    getCurrentUser: async () => null
  },
  api: {
    status: 'connected',
    projects: {
      status: 'connected',
      list: async () => []
    },
    chat: {
      status: 'connected',
      sendMessage: async (...args: any[]) => ({ message: 'Mock response' })
    },
    memory: {
      status: 'connected',
      recall: async (...args: any[]) => ({ memories: [] })
    }
  }
};