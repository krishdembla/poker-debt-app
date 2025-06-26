import './AlertBanner.css';

const AlertBanner = ({ message, onClose }) => (
  <div className="alert-banner">
    <span>{message}</span>
    <button className="close" onClick={onClose} aria-label="Close alert">×</button>
  </div>
);

export default AlertBanner;
