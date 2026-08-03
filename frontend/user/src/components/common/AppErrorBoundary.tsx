import { Component, type ErrorInfo, type ReactNode } from 'react';
import ServerUnavailable from './ServerUnavailable';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    // Render errors are intentionally logged without serializing user data.
    console.error('Application render error', error);
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) return <ServerUnavailable onRetry={this.handleRetry} />;
    return this.props.children;
  }
}
