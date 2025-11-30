import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = {
        hasError: false,
        error: null
    };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div style={{ 
                    minHeight: '100vh', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    padding: '1rem',
                    backgroundColor: '#f8fafc'
                }}>
                    <div style={{ 
                        maxWidth: '400px', 
                        width: '100%', 
                        backgroundColor: 'white', 
                        borderRadius: '1rem',
                        padding: '2rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <div style={{ 
                            width: '64px', 
                            height: '64px', 
                            margin: '0 auto 1.5rem',
                            backgroundColor: '#fef2f2',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <span style={{ fontSize: '2rem' }}>⚠️</span>
                        </div>

                        <h1 style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 'bold', 
                            color: '#1e293b',
                            marginBottom: '0.5rem'
                        }}>
                            Oops! Something went wrong
                        </h1>
                        <p style={{ 
                            color: '#64748b', 
                            marginBottom: '1.5rem' 
                        }}>
                            We're sorry, but something unexpected happened.
                        </p>

                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                backgroundColor: '#4f46e5',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                fontWeight: '600',
                                cursor: 'pointer'
                            }}
                        >
                            Reload App
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
