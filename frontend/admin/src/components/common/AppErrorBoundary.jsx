import { Component } from 'react';
import ServerUnavailable from './ServerUnavailable';

export default class AppErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  handleRetry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) return <ServerUnavailable onRetry={this.handleRetry} />;
    return this.props.children;
  }
}
