import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Root-level error boundary — catches App() crashes that would otherwise show a blank page.
// Shows the error message so we can diagnose and fix the root cause.
class RootErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ minHeight: "100vh", background: "#09090b", color: "#f4f4f5", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", fontFamily: "monospace" }}>
          <div style={{ maxWidth: 540, width: "100%" }}>
            <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "#71717a", textTransform: "uppercase", marginBottom: 12 }}>GenAI Systems Lab — startup error</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f87171", marginBottom: 8 }}>{this.state.error?.message}</div>
            <pre style={{ fontSize: 11, color: "#a1a1aa", whiteSpace: "pre-wrap", wordBreak: "break-all", background: "#18181b", padding: "1rem", borderRadius: 8, border: "1px solid #27272a", marginBottom: 16 }}>
              {this.state.error?.stack?.slice(0, 800)}
            </pre>
            <button onClick={() => { this.setState({ error: null }); window.location.reload(); }}
              style={{ padding: "8px 20px", background: "#3f3f46", border: "1px solid #52525b", borderRadius: 8, color: "#e4e4e7", cursor: "pointer", fontSize: 13 }}>
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('[SW] Registered:', reg.scope))
      .catch(err => console.warn('[SW] Registration failed:', err));
  });
}
