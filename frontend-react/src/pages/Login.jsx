import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/orders';

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginMsg, setLoginMsg] = useState({ text: '', isError: false });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMsg, setRegMsg] = useState({ text: '', isError: false });
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginMsg({ text: 'Signing in...', isError: false });
    setIsLoggingIn(true);

    try {
      await login(loginEmail.trim(), loginPassword);
      setLoginMsg({ text: 'Signed in successfully!', isError: false });
      navigate(redirectTarget);
    } catch (err) {
      setLoginMsg({
        text: err.message || 'Invalid email or password.',
        isError: true,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegMsg({ text: 'Creating your account...', isError: false });
    setIsRegistering(true);

    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      });
      setRegMsg({ text: 'Account created successfully!', isError: false });
      navigate(redirectTarget);
    } catch (err) {
      setRegMsg({
        text: err.message || 'Failed to create account.',
        isError: true,
      });
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1>YOUR ACCOUNT</h1>
          <p>Sign in to track your orders</p>
        </div>
      </section>

      <section className="checkout-section">
        <div className="container">
          <div className="checkout-grid">
            {/* Sign In Form */}
            <div className="checkout-form">
              <h2>Sign In</h2>
              <form id="customerLoginForm" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="customerLoginEmail">Email</label>
                  <input
                    type="email"
                    id="customerLoginEmail"
                    name="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customerLoginPassword">Password</label>
                  <input
                    type="password"
                    id="customerLoginPassword"
                    name="password"
                    minLength="6"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                {loginMsg.text && (
                  <p
                    id="customerLoginMessage"
                    aria-live="polite"
                    style={{
                      color: loginMsg.isError ? 'var(--primary-color)' : 'var(--success-color)',
                      marginBottom: '16px',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {loginMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isLoggingIn}
                >
                  {isLoggingIn ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
              </form>
            </div>

            {/* Create Account Form */}
            <div className="checkout-form">
              <h2>Create Account</h2>
              <form id="customerRegisterForm" onSubmit={handleRegisterSubmit}>
                <div className="form-group">
                  <label htmlFor="customerName">Full Name</label>
                  <input
                    type="text"
                    id="customerName"
                    name="name"
                    minLength="2"
                    maxLength="100"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customerEmail">Email</label>
                  <input
                    type="email"
                    id="customerEmail"
                    name="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customerPhone">Phone</label>
                  <input
                    type="tel"
                    id="customerPhone"
                    name="phone"
                    maxLength="20"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="customerPassword">Password</label>
                  <input
                    type="password"
                    id="customerPassword"
                    name="password"
                    minLength="6"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                {regMsg.text && (
                  <p
                    id="customerRegisterMessage"
                    aria-live="polite"
                    style={{
                      color: regMsg.isError ? 'var(--primary-color)' : 'var(--success-color)',
                      marginBottom: '16px',
                      fontSize: '14px',
                      fontWeight: 500,
                    }}
                  >
                    {regMsg.text}
                  </p>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-block"
                  disabled={isRegistering}
                >
                  {isRegistering ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
