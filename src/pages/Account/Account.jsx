import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { User, Package, MapPin, LogOut, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import './Account.css';

export const Account = () => {
  const { customer, loading, error, login, register, logout, addAddress, removeAddress } = useAuth();

  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'orders' | 'addresses'

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [formError, setFormError] = useState(null);

  // New Address state
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [addrLine1, setAddrLine1] = useState('');
  const [addrLine2, setAddrLine2] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [country, setCountry] = useState('India');
  const [zip, setZip] = useState('');

  const handleSubmitAuth = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, firstName, lastName);
      }
    } catch (err) {
      setFormError(err.message || 'Authentication failed');
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addAddress({
        address1: addrLine1,
        address2: addrLine2,
        city,
        province,
        country,
        zip
      });
      setShowAddAddr(false);
      setAddrLine1('');
      setAddrLine2('');
      setCity('');
      setProvince('');
      setZip('');
    } catch (err) {
      alert(err.message || 'Failed to add address');
    }
  };

  if (!customer) {
    return (
      <div className="acc-page">
        <div className="acc-container">
          <div className="acc-card">
            {/* Header Tabs */}
            <div className="acc-tabs">
              <button
                onClick={() => { setMode('login'); setFormError(null); }}
                className={`acc-tab ${mode === 'login' ? 'acc-tab-active' : ''}`}
              >
                SIGN IN
              </button>
              <button
                onClick={() => { setMode('register'); setFormError(null); }}
                className={`acc-tab ${mode === 'register' ? 'acc-tab-active' : ''}`}
              >
                CREATE ACCOUNT
              </button>
            </div>

            {formError && (
              <div className="acc-error-box" style={{ marginBottom: '16px' }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitAuth} className="acc-form">
              {mode === 'register' && (
                <>
                  <div className="acc-field">
                    <label className="acc-label">FIRST NAME</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="acc-input"
                    />
                  </div>
                  <div className="acc-field">
                    <label className="acc-label">LAST NAME</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="acc-input"
                    />
                  </div>
                </>
              )}

              <div className="acc-field">
                <label className="acc-label">EMAIL ADDRESS</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="acc-input"
                />
              </div>

              <div className="acc-field">
                <label className="acc-label">PASSWORD</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="acc-input"
                />
              </div>

              <button type="submit" disabled={loading} className="acc-submit-btn">
                {loading ? 'AUTHENTICATING...' : (mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="acc-page">
      <div className="acc-container">
        <h1 className="acc-title">
          Welcome back, {customer.firstName || 'Customer'}
        </h1>
        <p className="acc-sub">{customer.email}</p>

        {/* Dashboard Navigation */}
        <div className="acc-dash-nav">
          <button
            onClick={() => setActiveTab('profile')}
            className={`acc-dash-btn ${activeTab === 'profile' ? 'acc-dash-btn-active' : ''}`}
          >
            <User size={14} style={{ display: 'inline', marginRight: '6px' }} /> PROFILE
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`acc-dash-btn ${activeTab === 'orders' ? 'acc-dash-btn-active' : ''}`}
          >
            <Package size={14} style={{ display: 'inline', marginRight: '6px' }} /> ORDERS ({customer.orders?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`acc-dash-btn ${activeTab === 'addresses' ? 'acc-dash-btn-active' : ''}`}
          >
            <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} /> ADDRESSES ({customer.addresses?.length || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <div className="acc-section">
            <div className="acc-card" style={{ maxWidth: '100%', margin: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontFamily: 'var(--font-sans)', fontSize: '14px' }}>
                <div><strong>First Name:</strong> {customer.firstName || 'N/A'}</div>
                <div><strong>Last Name:</strong> {customer.lastName || 'N/A'}</div>
                <div><strong>Email:</strong> {customer.email}</div>
                {customer.phone && <div><strong>Phone:</strong> {customer.phone}</div>}
              </div>

              <button
                onClick={logout}
                className="acc-submit-btn"
                style={{ backgroundColor: 'var(--destructive)', marginTop: '24px', width: 'fit-content', padding: '0 24px' }}
              >
                <LogOut size={14} style={{ display: 'inline', marginRight: '6px' }} /> LOG OUT
              </button>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="acc-section">
            {customer.orders?.length === 0 ? (
              <p style={{ fontFamily: 'var(--font-sans)', color: 'var(--muted-foreground)' }}>
                You have not placed any orders yet.
              </p>
            ) : (
              customer.orders.map(order => (
                <div key={order.id} className="acc-order-card">
                  <div className="acc-order-header">
                    <div>
                      <span className="acc-order-name">{order.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', marginLeft: '12px', fontFamily: 'var(--font-sans)' }}>
                        {new Date(order.processedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="acc-order-status">{order.financialStatus}</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.lineItems?.map((item, idx) => (
                      <div key={idx} className="acc-order-item">
                        <span>{item.title} ({item.variantTitle}) × {item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 600, fontFamily: 'var(--font-sans)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                    Total: {order.totalPrice}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'addresses' && (
          <div className="acc-section">
            <button
              onClick={() => setShowAddAddr(!showAddAddr)}
              className="acc-submit-btn"
              style={{ width: 'fit-content', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={14} /> {showAddAddr ? 'CANCEL' : 'ADD NEW ADDRESS'}
            </button>

            {showAddAddr && (
              <form onSubmit={handleAddAddress} className="acc-card" style={{ maxWidth: '100%', margin: 0 }}>
                <h3 style={{ margin: '0 0 16px', fontFamily: 'var(--font-serif)', fontSize: '18px' }}>Add Address</h3>
                <div className="acc-form">
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    required
                    className="acc-input"
                  />
                  <input
                    type="text"
                    placeholder="Address Line 2 (Optional)"
                    value={addrLine2}
                    onChange={(e) => setAddrLine2(e.target.value)}
                    className="acc-input"
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <input
                      type="text"
                      placeholder="City"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="acc-input"
                    />
                    <input
                      type="text"
                      placeholder="State / Province"
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      required
                      className="acc-input"
                    />
                    <input
                      type="text"
                      placeholder="ZIP / Postal Code"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                      className="acc-input"
                    />
                  </div>
                  <button type="submit" className="acc-submit-btn">SAVE ADDRESS</button>
                </div>
              </form>
            )}

            {customer.addresses?.map(addr => (
              <div key={addr.id} className="acc-address-card">
                <div>
                  <p style={{ margin: 0, fontWeight: 600 }}>{addr.address1}</p>
                  {addr.address2 && <p style={{ margin: '2px 0 0', color: 'var(--muted-foreground)', fontSize: '13px' }}>{addr.address2}</p>}
                  <p style={{ margin: '2px 0 0', color: 'var(--muted-foreground)', fontSize: '13px' }}>
                    {addr.city}, {addr.province} {addr.zip}, {addr.country}
                  </p>
                </div>
                <button
                  onClick={() => removeAddress(addr.id)}
                  style={{ background: 'none', border: 'none', color: 'var(--destructive)', cursor: 'pointer', padding: '4px' }}
                  aria-label="Delete Address"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
