import { Component } from 'react';
import { Link } from 'react-router-dom';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F5F3EE] flex items-center justify-center px-8">
          <div className="max-w-md w-full text-center">
            <div className="p-8 border-2 border-[#0A0A0A] bg-white">
              <h1 className="text-2xl font-black uppercase tracking-tight text-[#0A0A0A] mb-4">Something went wrong</h1>
              <p className="text-sm text-[#6A6A6A] mb-6">An unexpected error occurred. Please try again.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={() => window.location.reload()}
                  className="h-10 px-6 bg-[#0A0A0A] text-[#F5F3EE] text-xs font-black uppercase tracking-widest hover:bg-[#2A2A2A] transition-colors">
                  Reload Page
                </button>
                <Link to="/"
                  className="h-10 px-6 border-2 border-[#0A0A0A] text-xs font-black uppercase tracking-widest flex items-center hover:bg-[#E8E6E1] transition-colors">
                  Go Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
