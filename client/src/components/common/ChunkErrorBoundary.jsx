import { Component } from "react";

// Lazy chunks have hashed file names. After a redeploy, a tab opened earlier asks for a
// chunk that no longer exists; without this boundary React unmounts the whole app.
export class ChunkErrorBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    if (this.props.fallback !== undefined) return this.props.fallback;
    return (
      <div className={this.props.className ?? "page"} role="alert">
        <p>This part of the site was just updated.</p>
        <button type="button" className="button" onClick={() => window.location.reload()}>
          reload
        </button>
      </div>
    );
  }
}
