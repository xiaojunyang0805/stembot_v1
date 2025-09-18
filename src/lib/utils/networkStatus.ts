/**
 * Network connectivity utilities
 * Provides functions for monitoring network status, connection quality,
 * and handling network-related operations
 */

// Types
export interface NetworkStatus {
  isOnline: boolean;
  connectionType: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface ConnectionInfo extends NetworkConnection {
  timestamp: number;
}

export interface NetworkConnection {
  type?: ConnectionType;
  effectiveType: EffectiveConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

export interface PingResult {
  success: boolean;
  latency: number;
  timestamp: number;
  error?: string;
}

export interface NetworkMetrics {
  isOnline: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'offline';
  averageLatency: number;
  packetLoss: number;
  bandwidth: number;
  lastChecked: number;
}

export type ConnectionType = 
  | 'bluetooth' 
  | 'cellular' 
  | 'ethernet' 
  | 'none' 
  | 'wifi' 
  | 'wimax' 
  | 'other' 
  | 'unknown';

export type EffectiveConnectionType = 'slow-2g' | '2g' | '3g' | '4g' | 'unknown';

export type NetworkEventType = 'online' | 'offline' | 'change';

export interface NetworkEventCallback {
  (status: NetworkStatus): void;
}

// Constants
export const NETWORK_CONSTANTS = {
  DEFAULT_PING_TIMEOUT: 5000,
  DEFAULT_PING_INTERVAL: 30000,
  CONNECTION_QUALITY_THRESHOLDS: {
    EXCELLENT_RTT: 50,
    GOOD_RTT: 150,
    FAIR_RTT: 300,
    POOR_RTT: 1000,
    EXCELLENT_DOWNLINK: 10,
    GOOD_DOWNLINK: 5,
    FAIR_DOWNLINK: 1,
  },
  PING_ENDPOINTS: [
    'https://www.google.com/favicon.ico',
    'https://www.cloudflare.com/cdn-cgi/trace',
    'https://httpbin.org/status/200',
  ],
  DEFAULT_PING_URL: 'https://www.google.com/favicon.ico',
  MAX_RETRY_ATTEMPTS: 3,
  OFFLINE_THRESHOLD_MS: 10000,
} as const;

// Network Status Manager Class
class NetworkStatusManager {
  private listeners: Map<string, NetworkEventCallback> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private currentStatus: NetworkStatus | null = null;
  private metricsHistory: NetworkMetrics[] = [];
  private maxHistorySize = 100;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  private handleOnline(): void {
    this.updateStatus();
    this.notifyListeners('online');
  }

  private handleOffline(): void {
    this.updateStatus();
    this.notifyListeners('offline');
  }

  private notifyListeners(_eventType: NetworkEventType): void {
    if (this.currentStatus) {
      this.listeners.forEach((callback) => {
        try {
          callback(this.currentStatus!);
        } catch (error) {
          console.error('Error in network status callback:', error);
        }
      });
    }
  }

  private updateStatus(): void {
    this.currentStatus = getCurrentNetworkStatus();
    this.recordMetrics();
  }

  private recordMetrics(): void {
    if (!this.currentStatus) return;

    const metrics: NetworkMetrics = {
      isOnline: this.currentStatus.isOnline,
      connectionQuality: this.getConnectionQuality(this.currentStatus),
      averageLatency: this.currentStatus.rtt,
      packetLoss: 0, // Would need additional implementation to calculate
      bandwidth: this.currentStatus.downlink,
      lastChecked: Date.now(),
    };

    this.metricsHistory.push(metrics);
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  private getConnectionQuality(status: NetworkStatus): NetworkMetrics['connectionQuality'] {
    if (!status.isOnline) return 'offline';

    const { rtt, downlink } = status;
    const { EXCELLENT_RTT, GOOD_RTT, FAIR_RTT, EXCELLENT_DOWNLINK, GOOD_DOWNLINK, FAIR_DOWNLINK } = 
      NETWORK_CONSTANTS.CONNECTION_QUALITY_THRESHOLDS;

    if (rtt <= EXCELLENT_RTT && downlink >= EXCELLENT_DOWNLINK) return 'excellent';
    if (rtt <= GOOD_RTT && downlink >= GOOD_DOWNLINK) return 'good';
    if (rtt <= FAIR_RTT && downlink >= FAIR_DOWNLINK) return 'fair';
    return 'poor';
  }

  public addEventListener(id: string, callback: NetworkEventCallback): void {
    this.listeners.set(id, callback);
  }

  public removeEventListener(id: string): void {
    this.listeners.delete(id);
  }

  public getCurrentStatus(): NetworkStatus {
    return this.currentStatus || getCurrentNetworkStatus();
  }

  public getMetricsHistory(): NetworkMetrics[] {
    return [...this.metricsHistory];
  }

  public startMonitoring(interval: number = NETWORK_CONSTANTS.DEFAULT_PING_INTERVAL): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      this.updateStatus();
    }, interval);
  }

  public stopMonitoring(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  public cleanup(): void {
    this.stopMonitoring();
    this.listeners.clear();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline.bind(this));
      window.removeEventListener('offline', this.handleOffline.bind(this));
    }
  }
}

// Global instance
let networkManager: NetworkStatusManager | null = null;

// Core Functions
export function getCurrentNetworkStatus(): NetworkStatus {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      isOnline: true,
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      saveData: false,
    };
  }

  const connection = getConnectionInfo();
  
  return {
    isOnline: navigator.onLine,
    connectionType: connection?.type as ConnectionType || 'unknown',
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || 0,
    rtt: connection?.rtt || 0,
    saveData: connection?.saveData || false,
  };
}

export function getConnectionInfo(): NetworkConnection | null {
  if (typeof window === 'undefined') return null;

  // @ts-ignore - NetworkInformation is not fully typed
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  
  if (!connection) return null;

  return {
    effectiveType: connection.effectiveType || 'unknown',
    downlink: connection.downlink || 0,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine;
}

export function isOffline(): boolean {
  return !isOnline();
}

export async function ping(url?: string, timeout: number = NETWORK_CONSTANTS.DEFAULT_PING_TIMEOUT): Promise<PingResult> {
  const pingUrl: string = url ?? NETWORK_CONSTANTS.PING_ENDPOINTS[0];
  const startTime = performance.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    await fetch(pingUrl, {
      method: 'HEAD',
      mode: 'no-cors',
      signal: controller.signal,
      cache: 'no-cache',
    });

    clearTimeout(timeoutId);
    const latency = performance.now() - startTime;

    return {
      success: true,
      latency: Math.round(latency),
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      success: false,
      latency: -1,
      timestamp: Date.now(),
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function pingMultiple(
  urls: string[] = [...NETWORK_CONSTANTS.PING_ENDPOINTS],
  timeout: number = NETWORK_CONSTANTS.DEFAULT_PING_TIMEOUT
): Promise<PingResult[]> {
  const promises = urls.map(url => ping(url, timeout));
  return Promise.all(promises);
}

export async function measureNetworkSpeed(): Promise<{
  downloadSpeed: number;
  latency: number;
  timestamp: number;
}> {
  const startTime = performance.now();
  
  try {
    // Use a small test file for speed measurement
    const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB test
    const response = await fetch(testUrl, { cache: 'no-cache' });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    await response.blob();
    const endTime = performance.now();
    const duration = endTime - startTime;
    const bytes = 1024; // 1KB
    const bitsPerSecond = (bytes * 8) / (duration / 1000);
    
    return {
      downloadSpeed: Math.round(bitsPerSecond / 1000), // Convert to Kbps
      latency: Math.round(duration),
      timestamp: Date.now(),
    };
  } catch (error) {
    return {
      downloadSpeed: 0,
      latency: -1,
      timestamp: Date.now(),
    };
  }
}

export function getConnectionQuality(): 'excellent' | 'good' | 'fair' | 'poor' | 'offline' {
  const status = getCurrentNetworkStatus();
  
  if (!status.isOnline) return 'offline';
  
  const { rtt, downlink } = status;
  const { EXCELLENT_RTT, GOOD_RTT, FAIR_RTT, EXCELLENT_DOWNLINK, GOOD_DOWNLINK, FAIR_DOWNLINK } = 
    NETWORK_CONSTANTS.CONNECTION_QUALITY_THRESHOLDS;

  if (rtt <= EXCELLENT_RTT && downlink >= EXCELLENT_DOWNLINK) return 'excellent';
  if (rtt <= GOOD_RTT && downlink >= GOOD_DOWNLINK) return 'good';
  if (rtt <= FAIR_RTT && downlink >= FAIR_DOWNLINK) return 'fair';
  return 'poor';
}

export function isSaveDataEnabled(): boolean {
  const connection = getConnectionInfo();
  return connection?.saveData || false;
}

export function isSlowConnection(): boolean {
  const status = getCurrentNetworkStatus();
  return status.effectiveType === 'slow-2g' || status.effectiveType === '2g';
}

export function isFastConnection(): boolean {
  const status = getCurrentNetworkStatus();
  return status.effectiveType === '4g' && status.downlink > 5;
}

// Network Manager Functions
export function getNetworkManager(): NetworkStatusManager {
  if (!networkManager) {
    networkManager = new NetworkStatusManager();
  }
  return networkManager;
}

export function addNetworkStatusListener(id: string, callback: NetworkEventCallback): void {
  const manager = getNetworkManager();
  manager.addEventListener(id, callback);
}

export function removeNetworkStatusListener(id: string): void {
  const manager = getNetworkManager();
  manager.removeEventListener(id);
}

export function startNetworkMonitoring(interval?: number): void {
  const manager = getNetworkManager();
  manager.startMonitoring(interval);
}

export function stopNetworkMonitoring(): void {
  const manager = getNetworkManager();
  manager.stopMonitoring();
}

export function getNetworkMetrics(): NetworkMetrics[] {
  const manager = getNetworkManager();
  return manager.getMetricsHistory();
}

// Utility Functions
export async function waitForConnection(timeout: number = 30000): Promise<boolean> {
  if (isOnline()) return true;

  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      cleanup();
      resolve(false);
    }, timeout);

    const handleOnline = () => {
      cleanup();
      resolve(true);
    };

    const cleanup = () => {
      clearTimeout(timeoutId);
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
    }
  });
}

export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxAttempts: number = NETWORK_CONSTANTS.MAX_RETRY_ATTEMPTS,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxAttempts) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

export function formatNetworkSpeed(bitsPerSecond: number): string {
  if (bitsPerSecond < 1000) {
    return `${bitsPerSecond.toFixed(1)} bps`;
  } else if (bitsPerSecond < 1000000) {
    return `${(bitsPerSecond / 1000).toFixed(1)} Kbps`;
  } else if (bitsPerSecond < 1000000000) {
    return `${(bitsPerSecond / 1000000).toFixed(1)} Mbps`;
  } else {
    return `${(bitsPerSecond / 1000000000).toFixed(1)} Gbps`;
  }
}

export function getNetworkStatusIcon(status?: NetworkStatus): string {
  const networkStatus = status || getCurrentNetworkStatus();
  
  if (!networkStatus.isOnline) return '📡❌';
  
  switch (networkStatus.effectiveType) {
    case 'slow-2g':
    case '2g':
      return '📡🔴';
    case '3g':
      return '📡🟡';
    case '4g':
      return '📡🟢';
    default:
      return '📡';
  }
}

// Cleanup function for library consumers
export function cleanupNetworkUtils(): void {
  if (networkManager) {
    networkManager.cleanup();
    networkManager = null;
  }
}

// React Hook (if using React)
export function useNetworkStatus() {
  if (typeof window === 'undefined') {
    return {
      isOnline: true,
      connectionType: 'unknown' as ConnectionType,
      effectiveType: 'unknown' as EffectiveConnectionType,
      downlink: 0,
      rtt: 0,
      saveData: false,
    };
  }

  // This would need React imports to work properly
  // const [status, setStatus] = useState(getCurrentNetworkStatus);
  
  // useEffect(() => {
  //   const id = 'react-hook';
  //   addNetworkStatusListener(id, setStatus);
  //   return () => removeNetworkStatusListener(id);
  // }, []);

  return getCurrentNetworkStatus();
}