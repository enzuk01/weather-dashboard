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

// Disable logging in production to reduce overhead
const LOGGING_ENABLED = process.env.NODE_ENV === 'development';
// Set a much smaller log retention in production
const MAX_LOGS = process.env.NODE_ENV === 'development' ? 1000 : 20;

class Logger {
    private static instance: Logger | null = null;
    private logs: LogEntry[] = [];
    private maxLogs: number = MAX_LOGS;
    private metrics: Record<string, { startTime: number; durations: number[] }> = {};
    // Only track metrics for critical operations
    private criticalMetrics: Set<string> = new Set([
        'fetchCurrentWeather',
        'fetchHourlyForecast',
        'fetchDailyForecast'
    ]);

    private constructor() {
        // No async initialization
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    public startPerformanceMetric(name: string): void {
        // Skip non-critical metrics in production
        if (!LOGGING_ENABLED && !this.criticalMetrics.has(name)) {
            return;
        }

        try {
            this.metrics[name] = {
                startTime: (typeof window !== 'undefined' && window.performance)
                    ? window.performance.now()
                    : Date.now(),
                durations: []
            };
        } catch (error) {
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to start performance metric:', error);
            }
        }
    }

    public endPerformanceMetric(name: string): void {
        // Skip non-critical metrics in production
        if (!LOGGING_ENABLED && !this.criticalMetrics.has(name)) {
            return;
        }

        try {
            const metric = this.metrics[name];
            if (metric) {
                const now = (typeof window !== 'undefined' && window.performance)
                    ? window.performance.now()
                    : Date.now();
                const duration = now - metric.startTime;

                // Keep a smaller number of metrics in production
                if (metric.durations.length >= (LOGGING_ENABLED ? 20 : 5)) {
                    metric.durations.shift(); // Remove oldest
                }

                metric.durations.push(duration);
            }
        } catch (error) {
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to end performance metric:', error);
            }
        }
    }

    public getPerformanceMetrics(): Record<string, PerformanceMetric> {
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
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to get performance metrics:', error);
            }
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

    private log(level: LogLevel, message: string, data?: any): void {
        // Skip all log operations in production except errors
        if (!LOGGING_ENABLED && level !== 'ERROR') {
            return;
        }

        try {
            const entry: LogEntry = {
                timestamp: new Date().toISOString(),
                level,
                message,
                ...(data instanceof Error && {
                    data: data.message, // Only store message, not full object
                    stack: data.stack
                })
            };

            // Only store a few logs in memory
            this.logs.unshift(entry);
            if (this.logs.length > this.maxLogs) {
                this.logs = this.logs.slice(0, this.maxLogs);
            }

            // Log to console in development only
            if (LOGGING_ENABLED) {
                const consoleMethod = this.getConsoleMethod(level);
                consoleMethod(`[${level}] ${message}`, data);
            }
        } catch (error) {
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to log message:', error);
            }
        }
    }

    public debug(message: string, data?: any): void {
        this.log('DEBUG', message, data);
    }

    public info(message: string, data?: any): void {
        this.log('INFO', message, data);
    }

    public warn(message: string, data?: any): void {
        this.log('WARN', message, data);
    }

    public error(message: string, error?: Error | any): void {
        this.log('ERROR', message, error);
    }

    public getLogs(): LogEntry[] {
        try {
            return [...this.logs];
        } catch (error) {
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to get logs:', error);
            }
            return [];
        }
    }

    public clearLogs(): void {
        try {
            this.logs = [];
        } catch (error) {
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to clear logs:', error);
            }
        }
    }

    public getMemoryInfo(): { usedJSHeapSize: number; totalJSHeapSize: number; jsHeapSizeLimit: number } | null {
        // Skip in production
        if (!LOGGING_ENABLED) {
            return null;
        }

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
            // Silent fail in production
            if (LOGGING_ENABLED) {
                console.warn('Failed to get memory info:', error);
            }
        }
        return null;
    }
}

// Create the logger instance immediately
const logger = Logger.getInstance();

// Export the logger instance
export { logger };