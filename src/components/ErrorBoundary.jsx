import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0b1326] text-white p-10 text-center">
          <span className="material-symbols-outlined text-error text-6xl mb-4 animate-pulse">crisis_alert</span>
          <h2 className="font-headline font-black text-3xl mb-2 text-error uppercase tracking-widest">System Node Failure</h2>
          <p className="text-on-surface-variant font-medium max-w-lg mb-8">
            An unforeseen anomaly occurred during the rendering sequence. The AI engine intercepted the thread safely.
          </p>
          <div className="bg-error/10 border border-error/30 p-6 rounded-2xl mb-8 max-w-2xl w-full text-left overflow-x-auto">
             <code className="text-[0.65rem] text-error align-baseline">{this.state.error?.toString()}</code>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary hover:bg-indigo-400 text-white font-bold font-headline uppercase tracking-widest px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(195,192,255,0.3)] hover:scale-105"
          >
            Reboot Interface
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
