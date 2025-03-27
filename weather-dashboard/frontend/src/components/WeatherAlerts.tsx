import React, { useState, useEffect } from 'react';
import GlassCard from './ui/GlassCard';

interface WeatherAlert {
    id: string;
    title: string;
    description: string;
    severity: 'minor' | 'moderate' | 'severe' | 'extreme';
    start: string; // ISO datetime string
    end: string;   // ISO datetime string
    source: string;
}

interface WeatherAlertsProps {
    latitude: number;
    longitude: number;
    className?: string;
    onError?: (error: Error) => void;
}

const WeatherAlerts: React.FC<WeatherAlertsProps> = ({
    latitude,
    longitude,
    className = '',
    onError
}) => {
    const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedAlerts, setExpandedAlerts] = useState<Set<string>>(new Set());

    // Toggle alert expansion
    const toggleAlert = (id: string) => {
        setExpandedAlerts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    // Format date for display
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get severity color
    const getSeverityColor = (severity: WeatherAlert['severity']): string => {
        switch (severity) {
            case 'minor': return 'bg-yellow-400/80';
            case 'moderate': return 'bg-orange-500/80';
            case 'severe': return 'bg-red-600/80';
            case 'extreme': return 'bg-purple-700/80';
            default: return 'bg-yellow-400/80';
        }
    };

    // Get severity text
    const getSeverityText = (severity: WeatherAlert['severity']): string => {
        switch (severity) {
            case 'minor': return 'Minor';
            case 'moderate': return 'Moderate';
            case 'severe': return 'Severe';
            case 'extreme': return 'Extreme';
            default: return 'Unknown';
        }
    };

    // Fetch weather alerts
    useEffect(() => {
        const fetchAlerts = async () => {
            try {
                setLoading(true);

                // In a real implementation, this would call the backend API
                // For now, we'll simulate with mock data
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

                // Randomly determine if we should show mock alerts (for demo purposes)
                const showMockAlerts = Math.random() > 0.5;

                if (showMockAlerts) {
                    const now = new Date();
                    const tomorrow = new Date(now);
                    tomorrow.setDate(tomorrow.getDate() + 1);

                    const mockAlerts: WeatherAlert[] = [
                        {
                            id: 'alert-1',
                            title: 'Severe Thunderstorm Warning',
                            description: 'The National Weather Service has issued a severe thunderstorm warning for your area. Strong winds, heavy rain, and hail are possible. Seek shelter indoors and stay away from windows.',
                            severity: 'severe',
                            start: now.toISOString(),
                            end: tomorrow.toISOString(),
                            source: 'National Weather Service'
                        },
                        {
                            id: 'alert-2',
                            title: 'Flood Watch',
                            description: 'A flood watch is in effect for your region. Heavy rainfall may cause flooding in low-lying areas. Monitor local weather reports and be prepared to move to higher ground if necessary.',
                            severity: 'moderate',
                            start: now.toISOString(),
                            end: tomorrow.toISOString(),
                            source: 'Local Weather Authority'
                        }
                    ];

                    setAlerts(mockAlerts);
                } else {
                    // No alerts
                    setAlerts([]);
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching weather alerts:', err);
                setError('Failed to load weather alerts');
                if (onError && err instanceof Error) {
                    onError(err);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchAlerts();
    }, [latitude, longitude, onError]);

    // If loading, show loading state
    if (loading) {
        return (
            <GlassCard className={`p-4 ${className}`}>
                <div className="flex items-center justify-center h-20">
                    <div className="animate-spin h-6 w-6 border-2 border-white/30 border-t-white rounded-full mr-2"></div>
                    <span className="text-white/80">Loading weather alerts...</span>
                </div>
            </GlassCard>
        );
    }

    // If error, show error state
    if (error) {
        return (
            <GlassCard className={`p-4 ${className}`}>
                <div className="flex items-center justify-center h-20 text-red-400">
                    <span>⚠️ {error}</span>
                </div>
            </GlassCard>
        );
    }

    // If no alerts, show message
    if (alerts.length === 0) {
        return (
            <GlassCard className={`p-4 ${className}`}>
                <div className="flex items-center justify-center py-6">
                    <div className="text-white/80 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 mx-auto mb-2 text-green-400"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            aria-hidden="true"
                        >
                            <path
                                fillRule="evenodd"
                                d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                                clipRule="evenodd"
                            />
                        </svg>
                        <p className="text-lg font-medium">No weather alerts</p>
                        <p className="text-sm">The weather conditions in your area are currently stable.</p>
                    </div>
                </div>
            </GlassCard>
        );
    }

    // Show alerts
    return (
        <GlassCard className={`p-4 ${className}`}>
            <h3 className="text-xl font-semibold text-white mb-3">
                Weather Alerts
                <span className="ml-2 px-2 py-0.5 bg-red-500/80 rounded-full text-xs text-white align-middle">
                    {alerts.length} Active
                </span>
            </h3>

            <div className="space-y-3">
                {alerts.map(alert => (
                    <div
                        key={alert.id}
                        className="border border-white/10 rounded-lg overflow-hidden"
                    >
                        {/* Alert header */}
                        <div
                            className={`px-4 py-3 flex justify-between items-center cursor-pointer ${getSeverityColor(alert.severity)}`}
                            onClick={() => toggleAlert(alert.id)}
                            aria-expanded={expandedAlerts.has(alert.id)}
                            aria-controls={`alert-content-${alert.id}`}
                        >
                            <div>
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        className="w-5 h-5 mr-2 text-white"
                                        aria-hidden="true"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    <span className="font-bold text-white">{alert.title}</span>
                                </div>
                                <span className="text-xs text-white/90">
                                    {getSeverityText(alert.severity)} • {formatDate(alert.start)} - {formatDate(alert.end)}
                                </span>
                            </div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                className={`w-5 h-5 text-white transition-transform ${expandedAlerts.has(alert.id) ? 'rotate-180' : ''}`}
                                aria-hidden="true"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>

                        {/* Alert content */}
                        {expandedAlerts.has(alert.id) && (
                            <div
                                id={`alert-content-${alert.id}`}
                                className="p-4 bg-black/20"
                            >
                                <p className="text-white mb-3">{alert.description}</p>
                                <div className="text-sm text-white/70">
                                    Source: {alert.source}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Screen reader text for alerts */}
            <div className="sr-only" role="status" aria-live="polite">
                {alerts.length} active weather alerts. {alerts.map(alert =>
                    `${getSeverityText(alert.severity)} alert: ${alert.title}. ${alert.description}`
                ).join('. ')}
            </div>
        </GlassCard>
    );
};

export default WeatherAlerts;