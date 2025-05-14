import React from 'react';

const OnlineUsers = ({ onlineUsers = [] }) => {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4 text-white">Çevrimiçi Kullanıcılar <span className="text-indigo-400">({onlineUsers.length})</span></h3>
      <div className="space-y-3">
        {onlineUsers.length === 0 && (
          <div className="glass-dark p-4 rounded-xl text-center text-gray-400">
            Henüz çevrimiçi kullanıcı yok
          </div>
        )}
        {onlineUsers.map((user) => (
          <div
            key={user.uid}
            className="glass flex items-center space-x-4 p-3 rounded-xl shadow-md hover:shadow-indigo-500/30 transition-all"
          >
            <div className="relative">
              <img
                src={user.photoURL || 'https://via.placeholder.com/32'}
                alt={user.displayName}
                className="w-10 h-10 rounded-full border-2 border-indigo-500 shadow"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-gray-900 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-white">{user.displayName || 'Kullanıcı'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnlineUsers; 