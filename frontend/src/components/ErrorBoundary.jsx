import { Component } from 'react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-16">
          <p className="text-lg font-semibold text-slate-700 mb-4">
            Algo salió mal en esta sección.
          </p>
          <button
            className="btn-primary px-6 py-2.5"
            onClick={() => this.setState({ hasError: false })}
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
