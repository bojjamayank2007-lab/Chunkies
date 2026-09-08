const nodemailer = require('nodemailer');

const createTransporter = () => {
  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE = 'true'
  } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP not configured. Email notifications will be skipped.');
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: SMTP_SECURE === 'true',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
};

const sendEmail = async (to, subject, html) => {
  const transporter = createTransporter();
  if (!transporter) return false;

  try {
    await transporter.sendMail({
      from: `"CHUNKIES" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    return false;
  }
};

const sendOrderConfirmation = async (order) => {
  const restaurantEmail = process.env.NOTIFICATION_EMAIL;
  const customerEmail = order.email;

  const subject = `Order Confirmation - ${order.orderId}`;
  const itemsHtml = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>₹${item.price}</td>
      <td>₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <h2>Thank you for ordering with CHUNKIES!</h2>
    <p><strong>Order ID:</strong> ${order.orderId}</p>
    <p><strong>Order Type:</strong> ${order.orderType}</p>
    <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
    <table border="1" cellpadding="8" cellspacing="0">
      <thead>
        <tr><th>Item</th><th>Qty</th><th>Price</th><th>Total</th></tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>
    <p><strong>Subtotal:</strong> ₹${order.subtotal}</p>
    <p><strong>Tax:</strong> ₹${order.tax}</p>
    <p><strong>Total:</strong> ₹${order.total}</p>
    <p>We will notify you when your order status changes.</p>
  `;

  if (customerEmail) {
    await sendEmail(customerEmail, subject, html);
  }

  if (restaurantEmail && restaurantEmail !== customerEmail) {
    await sendEmail(restaurantEmail, `New Order ${order.orderId}`, html);
  }
};

module.exports = {
  sendEmail,
  sendOrderConfirmation
};
