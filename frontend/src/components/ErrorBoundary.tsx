import { Component, ReactNode } from 'react';

// class component bc error boundaries HAVE to be classes, react hooks
// dont support this yet (yes even in 2026, dont ask me why, ask the react team)
//
// without this, one bad API response on any page white-screens the ENTIRE
// app - react just unmounts everything the second an uncaught error happens
// mid-render. this wraps the whole router and catches it so instead of a
// blank page the user sees an actual message and a way back out
interface Props { children: ReactNode }
interface State { hasError: boolean; message: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  // react calls this automatically the moment a child component throws
  // during render. we just flip a flag and stash the message
  static getDerivedStateFromError(err: Error) {
    return { hasError: true, message: err.message };
  }

  // separate lifecycle method just for logging/reporting, doesnt affect
  // state. would hook this up to sentry or w/e in a real prod app
  componentDidCatch(err: Error, info: unknown) {
    console.error('well that happened. error boundary caught:', err, info);
  }

  render() {
    if (this.state.hasError) {
      // deliberately ugly and plain, this is a "something went wrong" screen
      // not a feature, doesnt need to look nice
      return (
        <div className="app-shell" style={{ padding: 40, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="grid-backdrop" aria-hidden="true" />
          <h2 className="brand">uh oh, something broke on this page</h2>
          <p className="muted">{this.state.message}</p>
          <button onClick={() => (window.location.href = '/login')} className="btn btn-primary" style={{ marginTop: 10 }}>Take me back to login</button>
        </div>
      );
    }
    return this.props.children;
  }
}
