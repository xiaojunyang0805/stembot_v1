/**
 * Integration Layer for StemBot MVP
 * Provides abstraction for accessing private core functionality
 */

interface CoreIntegration {
  auth: {
    login: (credentials: any) => Promise<any>;
    logout: () => Promise<void>;
    getCurrentUser: () => Promise<any>;
  };
  api: {
    projects: {
      list: () => Promise<any[]>;
      create: (data: any) => Promise<any>;
      update: (id: string, data: any) => Promise<any>;
      delete: (id: string) => Promise<void>;
    };
    chat: {
      sendMessage: (message: string, projectId?: string) => Promise<any>;
      getHistory: (projectId: string) => Promise<any[]>;
    };
    memory: {
      store: (data: any) => Promise<void>;
      recall: (query: string) => Promise<any[]>;
    };
  };
}

/**
 * Mock implementation for development/fallback
 */
const mockIntegration: CoreIntegration = {
  auth: {
    login: async (credentials) => {
      console.warn('[MOCK] Auth login called');
      return { user: { id: 'mock-user', email: credentials.email } };
    },
    logout: async () => {
      console.warn('[MOCK] Auth logout called');
    },
    getCurrentUser: async () => {
      console.warn('[MOCK] Get current user called');
      return null;
    }
  },
  api: {
    projects: {
      list: async () => {
        console.warn('[MOCK] Projects list called');
        return [];
      },
      create: async (data) => {
        console.warn('[MOCK] Project create called', data);
        return { id: 'mock-project', ...data };
      },
      update: async (id, data) => {
        console.warn('[MOCK] Project update called', id, data);
        return { id, ...data };
      },
      delete: async (id) => {
        console.warn('[MOCK] Project delete called', id);
      }
    },
    chat: {
      sendMessage: async (message, projectId) => {
        console.warn('[MOCK] Chat message sent', message, projectId);
        return { id: 'mock-message', content: 'Mock response to: ' + message };
      },
      getHistory: async (projectId) => {
        console.warn('[MOCK] Chat history requested', projectId);
        return [];
      }
    },
    memory: {
      store: async (data) => {
        console.warn('[MOCK] Memory store called', data);
      },
      recall: async (query) => {
        console.warn('[MOCK] Memory recall called', query);
        return [];
      }
    }
  }
};

/**
 * Production integration that communicates with private core via API
 */
const apiIntegration: CoreIntegration = {
  auth: {
    login: async (credentials) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });
      return response.json();
    },
    logout: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    getCurrentUser: async () => {
      const response = await fetch('/api/auth/user');
      return response.ok ? response.json() : null;
    }
  },
  api: {
    projects: {
      list: async () => {
        const response = await fetch('/api/projects');
        return response.json();
      },
      create: async (data) => {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      update: async (id, data) => {
        const response = await fetch(`/api/projects/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        return response.json();
      },
      delete: async (id) => {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      }
    },
    chat: {
      sendMessage: async (message, projectId) => {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message, projectId })
        });
        return response.json();
      },
      getHistory: async (projectId) => {
        const response = await fetch(`/api/chat/history?projectId=${projectId}`);
        return response.json();
      }
    },
    memory: {
      store: async (data) => {
        await fetch('/api/memory/store', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      },
      recall: async (query) => {
        const response = await fetch('/api/memory/recall', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query })
        });
        return response.json();
      }
    }
  }
};

/**
 * Integration factory that returns appropriate implementation
 */
function createIntegration(): CoreIntegration {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMocks = process.env.USE_MOCKS === 'true';
  const fallbackToMocks = process.env.FALLBACK_TO_MOCKS === 'true';

  if (useMocks || (!isProduction && fallbackToMocks)) {
    console.warn('Using mock integration - some features may not work');
    return mockIntegration;
  }

  return apiIntegration;
}

/**
 * Main integration instance
 */
export const coreIntegration = createIntegration();

/**
 * Helper hook for React components
 */
export function useCoreIntegration() {
  return coreIntegration;
}

/**
 * Integration status
 */
export function getIntegrationStatus() {
  const isProduction = process.env.NODE_ENV === 'production';
  const useMocks = process.env.USE_MOCKS === 'true';

  return {
    environment: process.env.NODE_ENV,
    usingMocks: useMocks || !isProduction,
    integrationMethod: process.env.INTEGRATION_METHOD || 'api',
    coreAvailable: !useMocks && isProduction
  };
}