type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    data?: any;
    stack?: string;
}

interface PerformanceMetric {
    avg: number;
    min: number;
    max: number;
}

class Logger {
    private static instance: Logger | null = null;
    private logs: LogEntry[] = [];
    private maxLogs: number = 1000;
    private metrics: Record<string, { startTime: number; durations: number[] }> = {};
    private initialized: boolean = false;
    private initializationPromise: Promise<void>;

    private constructor() {
        this.initializationPromise = this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            // Add a small delay to ensure proper initialization
            await new Promise(resolve => setTimeout(resolve, 0));
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize logger:', error);
            throw error;
        }
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private async ensureInitialized(): Promise<void> {
        if (!this.initialized) {
            await this.initializationPromise;
        }
    }

    public async startPerformanceMetric(name: string): Promise<void> {
        await this.ensureInitialized();
        try {
            this.metrics[name] = {
                startTime: (typeof window !== 'undefined' && window.performance)
                    ? window.performance.now()
                    : Date.now(),
                durations: []
            };
        } catch (error) {
            console.warn('Failed to start performance metric:', error);
        }
    }

    public async endPerformanceMetric(name: string): Promise<void> {
        await this.ensureInitialized();
        try {
            const metric = this.metrics[name];
            if (metric) {
                const now = (typeof window !== 'undefined' && window.performance)
                    ? window.performance.now()
                    : Date.now();
                const duration = now - metric.startTime;
                metric.durations.push(duration);
            }
        } catch (error) {
            console.warn('Failed to end performance metric:', error);
        }
    }

    public async getPerformanceMetrics(): Promise<Record<string, PerformanceMetric>> {
        await this.ensureInitialized();
        const result: Record<string, PerformanceMetric> = {};

        try {
            for (const [name, metric] of Object.entries(this.metrics)) {
                if (metric.durations.length > 0) {
                    const durations = metric.durations;
                    result[name] = {
                        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
                        min: Math.min(...durations),
                        max: Math.max(...durations)
                    };
                }
            }
        } catch (error) {
            console.warn('Failed to get performance metrics:', error);
        }

        return result;
    }

    private getConsoleMethod(level: LogLevel): (message?: any, ...args: any[]) => void {
        switch (level) {
            case 'ERROR': return console.error.bind(console);
            case 'WARN': return console.warn.bind(console);
            case 'INFO': return console.info.bind(console);
            case 'DEBUG': return console.debug.bind(console);
        }
    }

    private async log(level: LogLevel, message: string, data?: any): Promise<void> {
        await this.ensureInitialized();
        try {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level,
                message,
                data,
                ...(data instanceof Error && { stack: data.stack })
            };

            this.logs.unshift(entry);

            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(0, this.maxLogs);
            }

            // Log to console in development
            if (process.env.NODE_ENV === 'development') {
                const consoleMethod = this.getConsoleMethod(level);
                consoleMethod(`[${level}] ${message}`, data);
            }
        } catch (error) {
            console.warn('Failed to log message:', error);
        }
    }

    public async debug(message: string, data?: any): Promise<void> {
        await this.log('DEBUG', message, data);
    }

    public async info(message: string, data?: any): Promise<void> {
        await this.log('INFO', message, data);
    }

    public async warn(message: string, data?: any): Promise<void> {
        await this.log('WARN', message, data);
    }

    public async error(message: string, error?: Error | any): Promise<void> {
        await this.log('ERROR', message, error);
    }

    public async getLogs(): Promise<LogEntry[]> {
        await this.ensureInitialized();
        try {
            return [...this.logs];
        } catch (error) {
            console.warn('Failed to get logs:', error);
            return [];
        }
    }

    public async clearLogs(): Promise<void> {
        await this.ensureInitialized();
        try {
            this.logs = [];
        } catch (error) {
            console.warn('Failed to clear logs:', error);
        }
    }

    public getMemoryInfo(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | null {
        try {
            if (typeof window !== 'undefined' && window.performance && (performance as any).memory) {
                const memory = (performance as any).memory;
                return {
                    usedJSHeapSize: memory.usedJSHeapSize || 0,
                    totalJSHeapSize: memory.totalJSHeapSize || 0,
                    jsHeapSizeLimit: memory.jsHeapSizeLimit || 0
                };
            }
        } catch (error) {
            console.warn('Failed to get memory info:', error);
        }
        return null;
    }
}

// Create the logger instance immediately
const logger = Logger.getInstance();

// Export the logger instance
export { logger };