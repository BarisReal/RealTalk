import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

const RoomList = () => {
  const [user] = useAuthState(auth);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  // Mock data for rooms - replace with actual data from Firebase
  const rooms = [
    {
      id: '1',
      name: 'Genel Sohbet',
      description: 'Herkesin katılabileceği genel sohbet odası',
      isPublic: true,
      userCount: 24,
      owner: 'admin'
    },
    {
      id: '2',
      name: 'Teknoloji',
      description: 'Teknoloji ve yazılım hakkında sohbetler',
      isPublic: true,
      userCount: 12,
      owner: 'tech_enthusiast'
    },
    {
      id: '3',
      name: 'Oyun',
      description: 'Oyun severler için özel oda',
      isPublic: true,
      userCount: 18,
      owner: 'gamer123'
    }
  ];

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Üst Panel: Oda Oluştur & Arama */}
        <div className="glass-panel flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 p-6 rounded-2xl shadow-xl" style={{backdropFilter:'blur(12px)', background:'rgba(255,255,255,0.08)'}}>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-0">Sohbet Odaları</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center justify-end">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all btn-create-room" style={{background:'linear-gradient(135deg, var(--primary-color), var(--accent-color))', color:'#fff', boxShadow:'0 4px 16px rgba(99,102,241,0.4)'}} onClick={() => setShowCreateRoom(true)}>
              <span className="text-2xl">➕</span> Oda Oluştur
            </button>
            <input
              type="text"
              className="input w-full md:w-72 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[var(--primary-color)]"
              placeholder="Oda ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{background:'rgba(255,255,255,0.12)', color:'var(--text-color)'}}
            />
          </div>
        </div>
        {/* Oda Kartları Grid */}
        <div className="rooms-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'2rem'}}>
          {filteredRooms.map(room => (
            <div key={room.id} className="room-card flex flex-col justify-between h-full rounded-xl shadow-xl p-6 fade-in" style={{backdropFilter:'blur(12px)', background:'rgba(255,255,255,0.08)'}}>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{room.name}</h2>
                <p className="text-gray-200 mb-4 truncate" style={{color:'var(--text-color)', opacity:0.85}}>{room.description}</p>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {room.isPublic ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-700/90 text-white">Açık</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-700/90 text-white">Gizli</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5 text-[var(--icon-color)]" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.37 17 14.28 17 15.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <span className="text-sm" style={{color:'var(--text-color)', opacity:0.7}}>{room.userCount} aktif kullanıcı</span>
              </div>
              <div className="flex justify-end mt-auto">
                <button className="btn btn-primary px-6 py-2 rounded-xl font-semibold shadow-lg transition-all" style={{background:'var(--primary-color)', color:'#fff', fontWeight:600}}>
                  Katıl
                </button>
              </div>
            </div>
          ))}
        </div>
        {/* Oda Oluştur Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="glass-panel card max-w-md w-full mx-4 fade-in" style={{backdropFilter:'blur(12px)', background:'rgba(255,255,255,0.1)'}}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Yeni Oda Oluştur</h2>
                <button
                  onClick={() => setShowCreateRoom(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent" htmlFor="roomName">
                    Oda Adı
                  </label>
                  <input
                    id="roomName"
                    type="text"
                    className="input w-full px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Oda adını girin"
                    style={{background:'rgba(255,255,255,0.12)', color:'var(--text-color)'}}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent" htmlFor="roomDesc">
                    Açıklama
                  </label>
                  <textarea
                    id="roomDesc"
                    className="input w-full min-h-[80px] resize-none px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[var(--primary-color)]"
                    placeholder="Oda açıklamasını girin"
                    rows={3}
                    style={{background:'rgba(255,255,255,0.12)', color:'var(--text-color)'}}
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPublic"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-600 rounded"
                  />
                  <label htmlFor="isPublic" className="ml-2 block text-sm bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    Herkese Açık
                  </label>
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateRoom(false)}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-2 rounded-xl font-semibold"
                  >
                    İptal
                  </button>
                  <button type="submit" className="btn btn-primary px-6 py-2 rounded-xl font-semibold" style={{background:'var(--primary-color)', color:'#fff'}}>
                    Oluştur
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList; 