import React from 'react';

export function Privacy() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>PRIVACY POLICY</h1>
        </div>
      </section>

      <section className="checkout-section">
        <div className="container">
          <div className="order-summary" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <h2>Your Privacy</h2>
            <p>CHUNKIES respects your privacy. This policy explains what information we collect and how we use it.</p>
            <h3 style={{ marginTop: '20px' }}>Information We Collect</h3>
            <p>We collect information you provide during registration, ordering, and checkout, including your name, email, phone number, and delivery address.</p>
            <h3 style={{ marginTop: '20px' }}>How We Use It</h3>
            <p>We use your information to process orders, communicate order updates, improve our services, and prevent fraud.</p>
            <h3 style={{ marginTop: '20px' }}>Payments</h3>
            <p>Online payments are processed securely through Razorpay. We do not store your full card details.</p>
            <h3 style={{ marginTop: '20px' }}>Third Parties</h3>
            <p>We do not sell your personal information. We share data only with delivery partners or payment providers as necessary to fulfill orders.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Terms() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>TERMS OF SERVICE</h1>
        </div>
      </section>

      <section className="checkout-section">
        <div className="container">
          <div className="order-summary" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <h2>Terms of Service</h2>
            <p>By using the CHUNKIES website and ordering from our menu, you agree to these Terms of Service.</p>
            <h3 style={{ marginTop: '20px' }}>Orders & Fulfillment</h3>
            <p>All orders are subject to availability. Prices and item availability may change without prior notice.</p>
            <h3 style={{ marginTop: '20px' }}>Delivery & Timings</h3>
            <p>We strive to deliver orders in a timely manner. Delivery times are estimates and may vary based on traffic and weather conditions.</p>
          </div>
        </div>
      </section>
    </>
  );
}

export function Refund() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>REFUND & CANCELLATION</h1>
        </div>
      </section>

      <section className="checkout-section">
        <div className="container">
          <div className="order-summary" style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
            <h2>Refund Policy</h2>
            <p>At CHUNKIES, customer satisfaction is our top priority.</p>
            <h3 style={{ marginTop: '20px' }}>Cancellations</h3>
            <p>Orders can only be cancelled before food preparation has begun. Once preparing, cancellations are not permitted.</p>
            <h3 style={{ marginTop: '20px' }}>Refunds</h3>
            <p>If you received an incorrect or defective item, please reach out to our team immediately with your Order ID for resolution or refund.</p>
          </div>
        </div>
      </section>
    </>
  );
}
