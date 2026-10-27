import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminSettings() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    openingHours: '',
    priceRange: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ text: '', isError: false });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .getRestaurant()
      .then((data) => {
        if (!isMounted || !data) return;
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          email: data.email || '',
          address: data.address?.fullAddress || '',
          openingHours: data.openingHours || '',
          priceRange: data.priceRange || '',
        });
      })
      .catch((err) => {
        console.error('Settings load error:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg({ text: '', isError: false });

    const payload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: {
        fullAddress: formData.address.trim(),
      },
      openingHours: formData.openingHours.trim(),
      priceRange: formData.priceRange.trim(),
    };

    try {
      await api.updateRestaurant(payload);
      setStatusMsg({ text: 'Settings saved successfully!', isError: false });
    } catch (err) {
      setStatusMsg({
        text: err.message || 'Failed to save settings.',
        isError: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section active" id="settings">
      <div className="section-header">
        <h2>Restaurant Settings</h2>
      </div>

      {loading ? (
        <p>Loading restaurant settings...</p>
      ) : (
        <form
          id="settingsForm"
          className="settings-form"
          onSubmit={handleSubmit}
          style={{ maxWidth: '600px' }}
        >
          <div className="form-group">
            <label>Restaurant Name</label>
            <input
              type="text"
              id="restaurantName"
              name="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              type="text"
              id="restaurantPhone"
              name="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              id="restaurantEmail"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <textarea
              id="restaurantAddress"
              name="address"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Opening Hours</label>
            <input
              type="text"
              id="restaurantHours"
              name="openingHours"
              value={formData.openingHours}
              onChange={(e) =>
                setFormData({ ...formData, openingHours: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Price Range</label>
            <input
              type="text"
              id="restaurantPriceRange"
              name="priceRange"
              value={formData.priceRange}
              onChange={(e) =>
                setFormData({ ...formData, priceRange: e.target.value })
              }
            />
          </div>

          {statusMsg.text && (
            <p
              style={{
                color: statusMsg.isError ? 'var(--primary-color)' : 'var(--success-color)',
                marginBottom: '16px',
                fontWeight: 500,
              }}
            >
              {statusMsg.text}
            </p>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      )}
    </section>
  );
}
