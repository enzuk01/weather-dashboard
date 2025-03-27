import React, { useState, useEffect } from 'react';
import { useLogger } from '../contexts/LoggerContext';
import { formatBytes, formatDuration } from '../utils/formatters';

interface PerformanceMetric {
    avg: number;
    min: number;
    max: number;
}

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    data?: any;
    stack?: string;
}

interface SystemStatus {
    performance: {
        metrics: Record<string, PerformanceMetric>;
    };
    memory: {
        usedJSHeapSize: number;
        totalJSHeapSize: number;
        jsHeapSizeLimit: number;
    } | null;
    logs: LogEntry[];
}

export const StatusReport: React.FC = () => {
    const { logger, isInitialized, error: loggerError } = useLogger();
    const [status, setStatus] = useState<SystemStatus>({
        performance: { metrics: {} },
        memory: null,
        logs: []
    });
    const [showLogs, setShowLogs] = useState(false);
    const [logFilter, setLogFilter] = useState<string>('all');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isInitialized) {
            return;
        }

        const updateStatus = async () => {
            try {
                const [metrics, logs] = await Promise.all([
                    logger.getPerformanceMetrics(),
                    logger.getLogs()
                ]);
                const memory = await logger.getMemoryInfo();

                setStatus({
                    performance: { metrics },
                    memory,
                    logs
                });
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to update status');
                console.error('Error updating status:', err);
            }
        };

        // Update status every 5 seconds
        const interval = setInterval(() => {
            updateStatus().catch(console.error);
        }, 5000);

        // Initial update
        updateStatus().catch(console.error);

        return () => clearInterval(interval);
    }, [logger, isInitialized]);

    // If logger isn't initialized or there's a logger error, show appropriate message
    if (!isInitialized || loggerError) {
        return (
            <div className="bg-red-500/20 text-red-100 p-4 rounded-lg">
                {loggerError || 'Initializing logging system...'}
            </div>
        );
    }

    const filteredLogs = status.logs.filter(log =>
        logFilter === 'all' || log.level === logFilter
    );

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-500/20 text-red-100 p-4 rounded-lg">
                    {error}
                </div>
            )}

            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">System Status</h3>
                <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    {showLogs ? 'Hide Logs' : 'Show Logs'}
                </button>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Memory Usage</h4>
                    {status.memory ? (
                        <div className="space-y-1 text-sm">
                            <div>Used: {formatBytes(status.memory.usedJSHeapSize)}</div>
                            <div>Total: {formatBytes(status.memory.totalJSHeapSize)}</div>
                            <div>Limit: {formatBytes(status.memory.jsHeapSizeLimit)}</div>
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400">Memory metrics not available in this browser</div>
                    )}
                </div>

                <div className="bg-white/10 p-4 rounded-lg">
                    <h4 className="font-medium mb-2">API Performance</h4>
                    {Object.keys(status.performance.metrics).length > 0 ? (
                        <div className="space-y-1 text-sm">
                            {Object.entries(status.performance.metrics).map(([name, metric]) => (
                                <div key={name}>
                                    {name}: {formatDuration(metric.avg)} avg
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-400">No performance metrics available yet</div>
                    )}
                </div>
            </div>

            {/* Logs Section */}
            {showLogs && (
                <div className="mt-4">
                    <div className="flex gap-2 mb-2">
                        <select
                            value={logFilter}
                            onChange={(e) => setLogFilter(e.target.value)}
                            className="px-2 py-1 bg-white/10 rounded text-sm"
                        >
                            <option value="all">All Logs</option>
                            <option value="ERROR">Errors</option>
                            <option value="WARN">Warnings</option>
                            <option value="INFO">Info</option>
                            <option value="DEBUG">Debug</option>
                        </select>
                        <button
                            onClick={async () => {
                                try {
                                    await logger.clearLogs();
                                    setStatus(prev => ({ ...prev, logs: [] }));
                                } catch (err) {
                                    console.error('Failed to clear logs:', err);
                                }
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
                        >
                            Clear Logs
                        </button>
                    </div>

                    <div className="bg-black/20 p-4 rounded-lg max-h-96 overflow-y-auto">
                        {filteredLogs.length > 0 ? (
                            <div className="space-y-2 text-sm font-mono">
                                {filteredLogs.map((log, index) => (
                                    <div
                                        key={index}
                                        className={`p-2 rounded ${log.level === 'ERROR' ? 'bg-red-500/20' :
                                            log.level === 'WARN' ? 'bg-yellow-500/20' :
                                                log.level === 'INFO' ? 'bg-blue-500/20' :
                                                    'bg-gray-500/20'
                                            }`}
                                    >
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                            <span className={`font-semibold ${log.level === 'ERROR' ? 'text-red-400' :
                                                log.level === 'WARN' ? 'text-yellow-400' :
                                                    log.level === 'INFO' ? 'text-blue-400' :
                                                        'text-gray-400'
                                                }`}>
                                                {log.level}
                                            </span>
                                        </div>
                                        <div className="mt-1">{log.message}</div>
                                        {log.data && (
                                            <pre className="mt-1 text-xs text-gray-400 overflow-x-auto">
                                                {JSON.stringify(log.data, null, 2)}
                                            </pre>
                                        )}
                                        {log.stack && (
                                            <pre className="mt-1 text-xs text-red-400 overflow-x-auto">
                                                {log.stack}
                                            </pre>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center text-gray-400 py-4">
                                No logs available{logFilter !== 'all' ? ` for level: ${logFilter}` : ''}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};