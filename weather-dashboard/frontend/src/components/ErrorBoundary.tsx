import React, { Component, ErrorInfo, ReactNode } from 'react';
import GlassCard from './ui/GlassCard';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
        // Update state so the next render will show the fallback UI
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // You can also log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
        this.setState({ errorInfo });
    }

    resetError = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null
        });
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom fallback if provided, otherwise use default error UI
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <GlassCard className="p-5">
                    <div className="flex flex-col items-center text-center">
                        <div className="text-5xl text-red-400 mb-4">⚠️</div>
                        <h3 className="text-xl font-bold text-white mb-2">Something went wrong</h3>
                        <p className="text-white/80 mb-4">
                            {this.state.error?.message || 'An unexpected error occurred'}
                        </p>
                        <details className="mb-4 text-left">
                            <summary className="text-white/70 cursor-pointer">Show more details</summary>
                            <pre className="mt-2 p-3 bg-gray-800 rounded text-white/70 text-xs overflow-auto">
                                {this.state.error?.stack}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                        <button
                            onClick={this.resetError}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </GlassCard>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;