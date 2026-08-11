import React, { useState } from 'react';
import { X, Ruler, Info } from 'lucide-react';
import './SizeGuideModal.css';

export const SizeGuideModal = ({ isOpen, onClose, productName = "Product" }) => {
  const [unit, setUnit] = useState('cm'); // 'cm' or 'in'

  if (!isOpen) return null;

  const sizeChart = [
    { size: 'XS', chestCm: '82-86', chestIn: '32-34', waistCm: '66-70', waistIn: '26-28', hipsCm: '90-94', hipsIn: '35-37' },
    { size: 'S',  chestCm: '88-92', chestIn: '35-36', waistCm: '72-76', waistIn: '28-30', hipsCm: '96-100', hipsIn: '38-39' },
    { size: 'M',  chestCm: '94-98', chestIn: '37-39', waistCm: '78-82', waistIn: '31-32', hipsCm: '102-106', hipsIn: '40-42' },
    { size: 'L',  chestCm: '100-104', chestIn: '40-41', waistCm: '84-88', waistIn: '33-35', hipsCm: '108-112', hipsIn: '43-44' },
    { size: 'XL', chestCm: '106-110', chestIn: '42-43', waistCm: '90-94', waistIn: '36-37', hipsCm: '114-118', hipsIn: '45-46' },
  ];

  return (
    <div className="sg-overlay">
      <div className="sg-backdrop" onClick={onClose} />

      <div className="sg-modal">
        <button className="sg-close-btn" onClick={onClose} aria-label="Close size guide">
          <X size={18} />
        </button>

        <div className="sg-header">
          <div className="sg-title-row">
            <Ruler size={20} className="sg-icon" />
            <div>
              <h3 className="sg-title">Size & Fit Guide</h3>
              <p className="sg-subtitle">Measurements for {productName}</p>
            </div>
          </div>

          {/* Unit Toggle */}
          <div className="sg-unit-toggle">
            <button
              className={`sg-unit-btn ${unit === 'cm' ? 'active' : ''}`}
              onClick={() => setUnit('cm')}
            >
              CM
            </button>
            <button
              className={`sg-unit-btn ${unit === 'in' ? 'active' : ''}`}
              onClick={() => setUnit('in')}
            >
              INCHES
            </button>
          </div>
        </div>

        {/* Fit Scale Bar */}
        <div className="sg-fit-scale">
          <span className="sg-fit-label">FIT RECOMMENDATION:</span>
          <div className="sg-scale-bar">
            <div className="sg-scale-track">
              <div className="sg-scale-indicator" style={{ left: '50%' }} />
            </div>
            <div className="sg-scale-labels">
              <span>Runs Small</span>
              <span className="active">True to Size</span>
              <span>Runs Large</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="sg-table-container">
          <table className="sg-table">
            <thead>
              <tr>
                <th>SIZE</th>
                <th>CHEST</th>
                <th>WAIST</th>
                <th>HIPS</th>
              </tr>
            </thead>
            <tbody>
              {sizeChart.map((row) => (
                <tr key={row.size}>
                  <td className="sg-size-cell">{row.size}</td>
                  <td>{unit === 'cm' ? row.chestCm : row.chestIn}</td>
                  <td>{unit === 'cm' ? row.waistCm : row.waistIn}</td>
                  <td>{unit === 'cm' ? row.hipsCm : row.hipsIn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Measuring Tip */}
        <div className="sg-footer">
          <div className="sg-tip">
            <Info size={16} />
            <p>
              <strong>Model Measurements:</strong> Model is 5'10" (178 cm) wearing size <strong>S</strong>. If you are between sizes, we recommend sizing up for a relaxed luxury silhouette.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
