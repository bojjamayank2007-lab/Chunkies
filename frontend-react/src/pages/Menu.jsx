import React, { useState, useEffect, useMemo } from 'react';
import MenuCard from '../components/MenuCard';
import api from '../utils/api';

const CATEGORIES = ['all', 'Burgers', 'Chicken', 'Wraps', 'Sides', 'Combos', 'Drinks'];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    api
      .getMenu()
      .then((items) => {
        if (!isMounted) return;
        setMenuItems(items || []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load menu. Please try again later.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...menuItems];

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(
        (item) => item.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      );
    }

    // Sort
    if (sortBy === 'price-low') {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === 'popularity') {
      result.sort((a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0));
    }

    return result;
  }, [menuItems, selectedCategory, searchQuery, sortBy]);

  return (
    <>
      {/* Menu Header */}
      <section className="page-header">
        <div className="container">
          <h1>OUR MENU</h1>
          <p>Big flavours for every craving</p>
        </div>
      </section>

      {/* Menu Filters */}
      <section className="menu-filters">
        <div className="container">
          <div className="filter-categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>

          <div className="filter-search">
            <input
              type="text"
              id="searchInput"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <i className="fas fa-search"></i>
          </div>

          <div className="filter-sort">
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Sort by</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="menu-section">
        <div className="container">
          {loading ? (
            <div className="loading" style={{ textAlign: 'center', padding: '60px 0' }}>
              Loading menu...
            </div>
          ) : error ? (
            <p className="error-message" style={{ textAlign: 'center', padding: '60px 0' }}>
              {error}
            </p>
          ) : filteredItems.length === 0 ? (
            <p className="empty-cart" style={{ textAlign: 'center', padding: '60px 0' }}>
              No items found matching your criteria.
            </p>
          ) : (
            <div className="menu-grid" id="menuGrid">
              {filteredItems.map((item) => (
                <MenuCard key={item._id || item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
