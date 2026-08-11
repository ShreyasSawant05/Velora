import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import './ImageLightbox.css';

export const ImageLightbox = ({ isOpen, onClose, images = [], initialIndex = 0, productName = "Product" }) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isZoomed, setIsZoomed] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setIsZoomed(false);
  }, [initialIndex, isOpen]);

  const handleNext = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrev = useCallback(() => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handleNext, handlePrev]);

  if (!isOpen || !images.length) return null;

  const currentImg = images[currentIndex];

  return (
    <div className="lb-overlay">
      <div className="lb-backdrop" onClick={onClose} />

      {/* Top Header */}
      <div className="lb-header">
        <span className="lb-title">{productName} ({currentIndex + 1} / {images.length})</span>
        <div className="lb-actions">
          <button
            className="lb-action-btn"
            onClick={() => setIsZoomed(!isZoomed)}
            aria-label="Toggle zoom"
            title={isZoomed ? "Zoom out" : "Zoom in"}
          >
            {isZoomed ? <ZoomOut size={18} /> : <ZoomIn size={18} />}
          </button>
          <button className="lb-action-btn lb-close-btn" onClick={onClose} aria-label="Close fullscreen view">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Center Image Canvas */}
      <div className={`lb-stage ${isZoomed ? 'lb-zoomed' : ''}`} onClick={() => setIsZoomed(!isZoomed)}>
        <img
          src={currentImg}
          alt={`${productName} view ${currentIndex + 1}`}
          className="lb-main-image"
        />
      </div>

      {/* Prev / Next Arrows */}
      {images.length > 1 && (
        <>
          <button className="lb-nav-btn lb-prev" onClick={handlePrev} aria-label="Previous image">
            <ChevronLeft size={24} />
          </button>
          <button className="lb-nav-btn lb-next" onClick={handleNext} aria-label="Next image">
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Bottom Thumbnail Strip */}
      {images.length > 1 && (
        <div className="lb-thumbnails">
          {images.map((imgUrl, idx) => (
            <button
              key={idx}
              className={`lb-thumb ${idx === currentIndex ? 'active' : ''}`}
              onClick={() => {
                setIsZoomed(false);
                setCurrentIndex(idx);
              }}
            >
              <img src={imgUrl} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
