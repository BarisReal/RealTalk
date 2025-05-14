import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import AvatarSelector from './AvatarSelector';

const UserProfile = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };

    fetchUserData();
  }, []);

  const handleAvatarSelect = async (selectedAvatar, gender) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { photoURL: selectedAvatar });
      
      // Update Firestore user document
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        photoURL: selectedAvatar,
        gender: gender
      });

      setUserData(prev => ({ ...prev, photoURL: selectedAvatar, gender }));
      setSuccess('Profil fotoğrafı başarıyla güncellendi');
      setShowAvatarSelector(false);
    } catch (err) {
      setError('Profil fotoğrafı güncellenirken bir hata oluştu');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setSuccess('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (err) {
      console.error('Error sending password reset:', err);
      setError('Şifre sıfırlama bağlantısı gönderilemedi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              Profil Ayarları
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Profil bilgilerinizi ve tercihlerinizi yönetin
            </p>
          </div>

          {/* Content */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-5 sm:p-6">
              {/* Status Messages */}
              {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                  {typeof error === 'string' ? error : error?.message || 'Bilinmeyen hata'}
                </div>
              )}
              {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                  {typeof success === 'string' ? success : success?.message || 'Başarılı'}
                </div>
              )}

              {/* Profile Photo */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Profil Fotoğrafı
                </label>
                <div className="mt-2 flex items-center space-x-4">
                  <img
                    src={userData?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.currentUser?.displayName || auth.currentUser?.email || 'Kullanıcı')}&background=4F46E5&color=fff&size=64`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover bg-white dark:bg-white"
                  />
                  <button
                    onClick={() => setShowAvatarSelector(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Avatar Değiştir
                  </button>
                </div>
                {loading && <p className="text-sm text-gray-500 mt-2">İşleniyor...</p>}
              </div>

              {/* User Info */}
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Hesap Bilgileri
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      E-posta
                    </label>
                    <div className="mt-1">
                      <input
                        type="email"
                        disabled
                        value={auth.currentUser?.email || ''}
                        className="bg-gray-50 dark:bg-gray-700 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-700 dark:text-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Password Reset */}
              <div>
                <button
                  onClick={handlePasswordReset}
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'İşleniyor...' : 'Şifreyi Sıfırla'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Selector Modal */}
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
              initialGender={userData?.gender || 'male'}
              initialAvatar={userData?.photoURL || ''}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 