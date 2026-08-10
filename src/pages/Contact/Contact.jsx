import React, { useState } from 'react';
import { Mail, Clock, MapPin, ChevronDown, CheckCircle2, Send } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import './Contact.css';

export const Contact = () => {
  const { showToast } = useCart();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    showToast("Message sent successfully! We'll reply within 24 hours.");
  };

  const faqs = [
    {
      q: "How long does shipping take?",
      a: "Standard shipping takes 3-5 business days across major cities in India. Orders over ₹5,000 qualify for complimentary express delivery."
    },
    {
      q: "What is your return policy?",
      a: "We offer a hassle-free 14-day exchange and return policy for all unworn footwear in original packaging."
    },
    {
      q: "How do I choose the right size?",
      a: "VÉLORA footwear fits true to European standard sizing. If you are between sizes, we recommend sizing up for loafers and boots."
    },
    {
      q: "How can I track my order?",
      a: "Once dispatched, you will receive an automated email with tracking code details and live dispatch notifications."
    },
    {
      q: "Are VÉLORA shoes waterproof?",
      a: "Our leather boots are treated with water-resistant coating. For prolonged exposure to heavy rain, we recommend applying a suede protector."
    }
  ];

  return (
    <div className="contact-page">

      {/* Header Banner */}
      <section className="contact-header">
        <span className="contact-header-label">GET IN TOUCH</span>
        <h1 className="contact-header-heading">We're here to help.</h1>
        <p className="contact-header-sub">
          Have a question about sizing, orders, or care instructions? Our care team responds within 24 hours.
        </p>
      </section>

      {/* Main Grid: Contact Info & Form */}
      <section className="contact-main">
        <div className="contact-grid">

          {/* Left Column: Coordinates */}
          <div className="contact-info-col">
            <div className="contact-info-card">
              <h2 className="contact-info-title">Studio & Care</h2>

              <div className="contact-info-items">
                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Mail size={18} />
                  </div>
                  <div>
                    <h3 className="contact-info-item-title">Email Customer Care</h3>
                    <p className="contact-info-item-text">care@veloradummy.com</p>
                    <p className="contact-info-item-text">press@veloradummy.com</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <Clock size={18} />
                  </div>
                  <div>
                    <h3 className="contact-info-item-title">Studio Hours</h3>
                    <p className="contact-info-item-text">Monday – Friday: 9:00 AM – 6:00 PM IST</p>
                    <p className="contact-info-item-text">Saturday: 10:00 AM – 2:00 PM IST</p>
                  </div>
                </div>

                <div className="contact-info-item">
                  <div className="contact-info-icon">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <h3 className="contact-info-item-title">Design Studio</h3>
                    <p className="contact-info-item-text">
                      VÉLORA Atelier, Bandra West<br />
                      Mumbai, Maharashtra 400050
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-exchange-card">
              <p className="contact-exchange-title">Complimentary Exchanges</p>
              <p className="contact-exchange-text">
                Need a size swap? Exchanges across India are free of charge. Contact us with your order number to initiate.
              </p>
            </div>
          </div>

          {/* Right Column: Contact Form */}
          <div className="contact-form-col">
            <div className="contact-form-card">
              <h2 className="contact-form-title">Send Us a Message</h2>

              {submitted ? (
                <div className="contact-form-success">
                  <div className="contact-form-success-icon">
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="contact-form-success-title">Thank You</h3>
                  <p className="contact-form-success-text">
                    Your message has been received. Our team will get back to you within 24 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="contact-form-reset-btn"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="contact-form-row">
                    <div className="contact-form-field">
                      <label className="contact-form-label">First Name</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        placeholder="Jane"
                        className="contact-form-input"
                      />
                    </div>
                    <div className="contact-form-field">
                      <label className="contact-form-label">Last Name</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        placeholder="Doe"
                        className="contact-form-input"
                      />
                    </div>
                  </div>

                  <div className="contact-form-field">
                    <label className="contact-form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="jane.doe@example.com"
                      className="contact-form-input"
                    />
                  </div>

                  <div className="contact-form-field">
                    <label className="contact-form-label">Subject</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="contact-form-input"
                    >
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Sizing Help">Sizing Help</option>
                      <option value="Order Status">Order Status & Tracking</option>
                      <option value="Returns & Exchange">Returns & Exchange</option>
                    </select>
                  </div>

                  <div className="contact-form-field">
                    <label className="contact-form-label">Message</label>
                    <textarea
                      rows={5}
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us how we can assist you..."
                      className="contact-form-textarea"
                    />
                  </div>

                  <button type="submit" className="contact-form-submit">
                    Send Message <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* Accordion FAQ Section */}
      <section className="contact-faq-section">
        <div className="contact-faq-header">
          <span className="contact-faq-label">QUESTIONS & ANSWERS</span>
          <h2 className="contact-faq-heading">Frequently Asked Questions</h2>
        </div>

        <div className="contact-faq-list">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div key={idx} className="contact-faq-item">
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="contact-faq-question"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    style={{
                      color: isOpen ? 'var(--foreground)' : 'var(--muted-foreground)',
                      transition: 'transform 0.2s ease',
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0
                    }}
                  />
                </button>
                {isOpen && (
                  <div className="contact-faq-answer">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
