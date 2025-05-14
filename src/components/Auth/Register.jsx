import React, { useState } from 'react';
import { auth, googleProvider, db } from '../../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import AvatarSelector from '../Profile/AvatarSelector';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [gender, setGender] = useState('male');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const navigate = useNavigate();

  const handleEmailRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: selectedAvatar || '/user.png',
        gender: gender,
        isBanned: false,
        createdAt: new Date()
      });
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName || '',
        photoURL: user.photoURL || selectedAvatar || '/user.png',
        gender: gender,
        isBanned: false,
        createdAt: new Date()
      });
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAvatarSelect = (avatar, selectedGender) => {
    setSelectedAvatar(avatar);
    setGender(selectedGender);
    setShowAvatarSelector(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-16">
      <div className="glass-panel p-8 max-w-md w-full shadow-2xl rounded-2xl fade-in bg-white/20 dark:bg-gray-900/50">
        <h2 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-glow">Kayıt Ol</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded shadow">{error}</div>}
        <form className="space-y-6" onSubmit={handleEmailRegister}>
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
          <input
            type="password"
            placeholder="Şifre Tekrar"
            className="input w-full bg-white/20 dark:bg-gray-900/40 shadow-glow"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          <div className="flex flex-col items-center gap-4">
            <img
              src={selectedAvatar || '/user.png'}
              alt="Seçili Avatar"
              className="avatar w-24 h-24 mb-2 object-cover bg-white dark:bg-white"
            />
            <button
              type="button"
              className="btn bg-indigo-600 text-white px-6 py-2 rounded-md shadow-glow"
              onClick={() => setShowAvatarSelector(true)}
            >
              Avatar Seç
            </button>
            <span className="text-xs text-gray-400">(İsterseniz avatar seçmeden devam edebilirsiniz)</span>
          </div>
          <button
            type="submit"
            className="btn w-full py-3 text-lg font-semibold shadow-glow"
          >
            Kayıt Ol
          </button>
        </form>
        <button
          onClick={handleGoogleRegister}
          className="btn w-full mt-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-glow flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_17_40)">
              <path d="M23.766 12.276c0-.818-.074-1.604-.213-2.356H12.24v4.451h6.484a5.54 5.54 0 01-2.4 3.632v3.017h3.877c2.27-2.092 3.565-5.176 3.565-8.744z" fill="#4285F4"/>
              <path d="M12.24 24c3.24 0 5.963-1.07 7.95-2.91l-3.877-3.017c-1.08.726-2.462 1.155-4.073 1.155-3.13 0-5.78-2.112-6.734-4.946H1.527v3.09A11.997 11.997 0 0012.24 24z" fill="#34A853"/>
              <path d="M5.506 14.282A7.19 7.19 0 014.8 12c0-.792.136-1.56.38-2.282V6.628H1.527A12.004 12.004 0 000 12c0 1.885.454 3.667 1.527 5.372l3.979-3.09z" fill="#FBBC05"/>
              <path d="M12.24 4.771c1.763 0 3.34.607 4.583 1.797l3.43-3.43C18.197 1.07 15.474 0 12.24 0 7.527 0 3.442 2.94 1.527 6.628l3.979 3.09c.954-2.834 3.604-4.947 6.734-4.947z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_17_40">
                <path fill="#fff" d="M0 0h24v24H0z"/>
              </clipPath>
            </defs>
          </svg>
          Google ile Kayıt Ol
        </button>
        <div className="mt-8 text-center">
          <span className="text-gray-300">Zaten üye misin?</span>
          <Link to="/login" className="ml-2 text-indigo-400 hover:text-indigo-200 font-semibold underline transition-all">Giriş Yap</Link>
        </div>
      </div>
      {showAvatarSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Avatar Seç
              </h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <AvatarSelector
              onSelect={handleAvatarSelect}
              initialGender={gender}
              initialAvatar={selectedAvatar}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Register; 