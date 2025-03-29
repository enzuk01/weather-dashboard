import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component that catches JavaScript errors in its child component tree
 * and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<Props, State> {
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
        // Log the error to an error reporting service
        console.error('Error caught by ErrorBoundary:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            // Fallback UI when an error occurs
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="p-4 rounded-md bg-red-50 border border-red-200">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h3>
                    <p className="text-sm text-red-700 mb-2">
                        There was an error loading this component. Please try refreshing the page.
                    </p>
                    <details className="text-xs text-red-600 mt-1">
                        <summary>Error details</summary>
                        <p className="mt-1 whitespace-pre-wrap font-mono">
                            {this.state.error?.message || 'Unknown error'}
                        </p>
                    </details>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-3 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md text-sm font-medium transition-colors"
                    >
                        Try again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;