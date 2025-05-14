import React, { useState } from 'react';
import { auth, googleProvider } from '../../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (error) {
      setError('E-posta veya şifre hatalı');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (error) {
      setError('Google ile giriş başarısız');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
      <div className="glass-panel p-8 max-w-md w-full shadow-2xl rounded-2xl fade-in bg-white/20 dark:bg-gray-900/50">
        <h2 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-glow">Giriş Yap</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow">{error}</div>}
        <form className="space-y-6" onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="E-posta"
            className="input w-full bg-white/20 dark:bg-gray-900/40 shadow-glow"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            className="input w-full bg-white/20 dark:bg-gray-900/40 shadow-glow"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn w-full py-3 text-lg font-semibold shadow-glow"
          >
            Giriş Yap
          </button>
        </form>
        <button
          onClick={handleGoogleLogin}
          className="btn w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow"
        >
          Google ile Giriş Yap
        </button>
        <div className="mt-8 text-center">
          <span className="text-gray-300">Üye değil misin?</span>
          <Link to="/register" className="ml-2 text-indigo-400 hover:text-indigo-200 font-semibold underline transition-all">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default Login; 