// src/components/ErrorBoundary.jsx

import React, { Component } from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render shows the fallback UI
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        // Log the error to your logging service
        console.error("ErrorBoundary caught an error", error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary">
                    <div className="error-animation">
                        <div className="error-icon">😵</div>
                        <h1 className="error-title">Oops! Something went wrong.</h1>
                        <p className="error-message">We encountered an unexpected issue. Please try refreshing the page.</p>
                        <button className="error-button" onClick={() => window.location.reload()}>Reload Page</button>
                    </div>
                </div>
            );
        }

        return this.props.children; 
    }
}

export default ErrorBoundary;
