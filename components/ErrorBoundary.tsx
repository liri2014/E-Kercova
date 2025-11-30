import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });
        
        // Log error to console in development
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({ hasError: false, error: null, errorInfo: null });
    };

    handleReload = (): void => {
        window.location.reload();
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Custom fallback UI if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 text-center">
                        {/* Error Icon */}
                        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-red-600 dark:text-red-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                />
                            </svg>
                        </div>

                        {/* Error Message */}
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            We're sorry, but something unexpected happened. Please try again.
                        </p>

                        {/* Error Details (Development only) */}
                        {this.state.error && (
                            <div className="mb-6 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-left overflow-auto max-h-40">
                                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                                    {this.state.error.toString()}
                                </p>
                                {this.state.errorInfo && (
                                    <pre className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-2 whitespace-pre-wrap">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={this.handleRetry}
                                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={this.handleReload}
                                className="flex-1 py-3 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors"
                            >
                                Reload App
                            </button>
                        </div>

                        {/* Help Text */}
                        <p className="mt-6 text-xs text-slate-500 dark:text-slate-500">
                            If the problem persists, please contact support.
                        </p>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
