import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center max-w-md px-6">
            <span className="material-symbols-outlined text-gray-200 text-6xl mb-4 block" aria-hidden="true">error</span>
            <h1 className="font-headline text-2xl font-extrabold tracking-tight mb-2">Something went wrong</h1>
            <p className="text-gray-500 text-sm mb-6">An unexpected error occurred. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all">
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
