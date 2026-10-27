import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const CATEGORIES = ['Burgers', 'Chicken', 'Wraps', 'Sides', 'Combos', 'Drinks'];

const initialForm = {
  id: '',
  name: '',
  description: '',
  price: '',
  category: 'Burgers',
  image: '',
  isVeg: false,
  isFeatured: false,
  isAvailable: true,
};

export default function AdminMenu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  const fetchMenu = () => {
    setLoading(true);
    api
      .getMenu()
      .then((data) => {
        setMenuItems(data || []);
      })
      .catch((err) => {
        console.error('Error loading menu:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleOpenAdd = () => {
    setFormData(initialForm);
    setModalOpen(true);
  };

  const handleOpenEdit = (item) => {
    setFormData({
      id: item._id,
      name: item.name || '',
      description: item.description || '',
      price: item.price ?? '',
      category: item.category || 'Burgers',
      image: item.image || '',
      isVeg: Boolean(item.isVeg),
      isFeatured: Boolean(item.isFeatured),
      isAvailable: item.isAvailable !== false,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.deleteMenuItem(id);
      setMenuItems((prev) => prev.filter((item) => item._id !== id));
    } catch (err) {
      alert('Failed to delete menu item: ' + err.message);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: parseFloat(formData.price),
      category: formData.category,
      image: formData.image.trim(),
      isVeg: formData.isVeg,
      isFeatured: formData.isFeatured,
      isAvailable: formData.isAvailable,
    };

    try {
      if (formData.id) {
        await api.updateMenuItem(formData.id, payload);
      } else {
        await api.createMenuItem(payload);
      }
      setModalOpen(false);
      fetchMenu();
    } catch (err) {
      alert('Failed to save menu item: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="section active" id="menu">
      <div className="section-header">
        <h2>Menu Management</h2>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenAdd}
        >
          <i className="fas fa-plus"></i> Add Item
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Featured</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="menuTable">
            {loading ? (
              <tr>
                <td colSpan="7">Loading menu...</td>
              </tr>
            ) : menuItems.length === 0 ? (
              <tr>
                <td colSpan="7">No menu items found</td>
              </tr>
            ) : (
              menuItems.map((item) => (
                <tr key={item._id}>
                  <td>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        background: 'var(--bg-dark)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <i
                        className="fas fa-utensils"
                        style={{
                          color: 'var(--text-light)',
                          display: item.image ? 'none' : 'flex',
                        }}
                      ></i>
                    </div>
                  </td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>₹{item.price}</td>
                  <td>{item.isFeatured ? '✓' : '✗'}</td>
                  <td>{item.isAvailable ? '✓' : '✗'}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        type="button"
                        className="action-btn"
                        onClick={() => handleOpenEdit(item)}
                        title="Edit item"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        type="button"
                        className="action-btn delete"
                        onClick={() => handleDelete(item._id)}
                        title="Delete item"
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Menu Modal */}
      {modalOpen && (
        <div className="modal active" id="menuModal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 id="menuModalTitle">
                {formData.id ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              <button
                type="button"
                className="modal-close"
                onClick={() => setModalOpen(false)}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form id="menuForm" onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  id="menuItemName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  id="menuItemDescription"
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  id="menuItemPrice"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  id="menuItemCategory"
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  id="menuItemImage"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                />
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    id="menuItemVeg"
                    checked={formData.isVeg}
                    onChange={(e) =>
                      setFormData({ ...formData, isVeg: e.target.checked })
                    }
                  />
                  Vegetarian
                </label>

                <label>
                  <input
                    type="checkbox"
                    id="menuItemFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) =>
                      setFormData({ ...formData, isFeatured: e.target.checked })
                    }
                  />
                  Featured
                </label>

                <label>
                  <input
                    type="checkbox"
                    id="menuItemAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                  />
                  Available
                </label>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
