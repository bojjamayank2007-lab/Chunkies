import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    todayRevenue: 0,
    totalMenuItems: 0,
    totalOrders: 0,
    onlineRevenue: 0,
    codRevenue: 0,
  });
  const [popularItems, setPopularItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.all([api.getOrders(), api.getMenu()])
      .then(([orders, menuItems]) => {
        if (!isMounted) return;

        const allOrders = orders || [];
        const allMenu = menuItems || [];

        const todayStr = new Date().toDateString();
        const todayOrdersList = allOrders.filter(
          (o) => new Date(o.createdAt).toDateString() === todayStr
        );
        const pending = allOrders.filter((o) => o.status === 'Pending').length;
        const completed = allOrders.filter((o) => o.status === 'Completed').length;
        const todayRev = todayOrdersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        const nonCancelled = allOrders.filter((o) => o.status !== 'Cancelled');
        const onlineRev = nonCancelled
          .filter((o) => o.paymentMethod === 'Online' && o.paymentStatus === 'Paid')
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        const codRev = nonCancelled
          .filter((o) => o.paymentMethod === 'COD')
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0);

        setStats({
          todayOrders: todayOrdersList.length,
          pendingOrders: pending,
          completedOrders: completed,
          todayRevenue: todayRev,
          totalMenuItems: allMenu.length,
          totalOrders: nonCancelled.length,
          onlineRevenue: onlineRev,
          codRevenue: codRev,
        });

        // Compute popular items
        const itemMap = {};
        allOrders.forEach((o) => {
          (o.items || []).forEach((it) => {
            const name = it.name || 'Unknown Item';
            if (!itemMap[name]) {
              itemMap[name] = { name, timesOrdered: 0, quantitySold: 0 };
            }
            itemMap[name].timesOrdered += 1;
            itemMap[name].quantitySold += Number(it.quantity) || 0;
          });
        });

        const sortedPopular = Object.values(itemMap)
          .sort((a, b) => b.quantitySold - a.quantitySold)
          .slice(0, 5);

        setPopularItems(sortedPopular);
        setRecentOrders(allOrders.slice(0, 5));
      })
      .catch((err) => console.error('Dashboard load error:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="section active" id="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3 id="todayOrders">{stats.todayOrders}</h3>
            <p>Today's Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-clock"></i>
          </div>
          <div className="stat-info">
            <h3 id="pendingOrders">{stats.pendingOrders}</h3>
            <p>Pending Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-check-circle"></i>
          </div>
          <div className="stat-info">
            <h3 id="completedOrders">{stats.completedOrders}</h3>
            <p>Completed Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-rupee-sign"></i>
          </div>
          <div className="stat-info">
            <h3 id="todayRevenue">₹{stats.todayRevenue}</h3>
            <p>Today's Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-utensils"></i>
          </div>
          <div className="stat-info">
            <h3 id="totalMenuItems">{stats.totalMenuItems}</h3>
            <p>Total Menu Items</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-shopping-bag"></i>
          </div>
          <div className="stat-info">
            <h3 id="totalOrders">{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-credit-card"></i>
          </div>
          <div className="stat-info">
            <h3 id="onlineRevenue">₹{stats.onlineRevenue}</h3>
            <p>Online Revenue</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-money-bill-wave"></i>
          </div>
          <div className="stat-info">
            <h3 id="codRevenue">₹{stats.codRevenue}</h3>
            <p>COD Revenue</p>
          </div>
        </div>
      </div>

      <div className="popular-items">
        <h2>Popular Items</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Item Name</th>
                <th>Times Ordered</th>
                <th>Quantity Sold</th>
              </tr>
            </thead>
            <tbody id="popularItemsTable">
              {loading ? (
                <tr>
                  <td colSpan="3">Loading...</td>
                </tr>
              ) : popularItems.length === 0 ? (
                <tr>
                  <td colSpan="3">No items ordered yet</td>
                </tr>
              ) : (
                popularItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.name}</td>
                    <td>{item.timesOrdered}</td>
                    <td>{item.quantitySold}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="recent-orders">
        <h2>Recent Orders</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody id="recentOrdersTable">
              {loading ? (
                <tr>
                  <td colSpan="6">Loading...</td>
                </tr>
              ) : recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6">No recent orders</td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const statusClass = (order.status || 'Pending')
                    .toLowerCase()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-z-]/g, '');

                  return (
                    <tr key={order._id || order.orderId}>
                      <td>{order.orderId}</td>
                      <td>{order.customerName}</td>
                      <td>{order.phone}</td>
                      <td>₹{order.total}</td>
                      <td>
                        <span className={`status-badge status-${statusClass}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
