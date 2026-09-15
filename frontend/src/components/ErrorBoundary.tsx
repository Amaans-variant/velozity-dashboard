import { Component, ReactNode } from 'react';

// error boundaries have to be classes (react hooks still don't support
// this). without it, one bad API response anywhere white-screens the
// entire app. wraps the whole router; logic identical to before, restyled
interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  componentDidCatch(err: Error, info: unknown) {
    console.error('error boundary caught:', err, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-base-950 px-6 text-center text-ink-100">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-500/10 text-2xl">⚠</div>
          <h2 className="font-display text-xl font-semibold">Something broke on this page</h2>
          <p className="mt-2 max-w-sm text-sm text-ink-500">{this.state.message}</p>
          <button
            onClick={() => (window.location.href = '/login')}
            className="mt-6 rounded-lg bg-gradient-to-r from-accent to-accent-dim px-4 py-2 text-sm font-semibold text-base-950"
          >
            Take me back to login
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
