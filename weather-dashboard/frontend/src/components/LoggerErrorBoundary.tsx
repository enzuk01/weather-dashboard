import React, { Component, ErrorInfo } from 'react';
import { logger } from '../utils/logger';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class LoggerErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        // Attempt to log the error, but handle the case where logger itself is the problem
        try {
            logger.error('Error caught by LoggerErrorBoundary', {
                error: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack
            });
        } catch (loggerError) {
            console.error('Failed to log error:', error);
            console.error('Logger error:', loggerError);
        }
    }

    render(): React.ReactNode {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-500/20 rounded-lg">
                    <h2 className="text-lg font-semibold text-red-200 mb-2">
                        Logging System Error
                    </h2>
                    <p className="text-red-100 mb-4">
                        The logging system encountered an error. The application will continue to function,
                        but some monitoring features may be unavailable.
                    </p>
                    <div className="bg-black/20 p-4 rounded text-sm font-mono text-red-200 overflow-x-auto">
                        {this.state.error?.message}
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}