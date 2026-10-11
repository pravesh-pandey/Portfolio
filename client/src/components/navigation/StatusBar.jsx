import "./statusBar.css";

export const StatusBar = ({ children }) => (
  <div className="status-bar">
    <div className="status-bar__left">{children}</div>
    <span className="status-bar__copy">© {new Date().getFullYear()} Pravesh Pandey</span>
  </div>
);
