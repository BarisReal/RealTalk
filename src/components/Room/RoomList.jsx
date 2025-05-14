import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Link, useNavigate } from 'react-router-dom';
import CreateRoom from './CreateRoom';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomPassword, setRoomPassword] = useState('');
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Tüm odaları çek
    const q = query(collection(db, 'rooms'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomsData);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleRoomClick = (room) => {
    if (room.type === 'private') {
      setSelectedRoom(room);
      setShowModal(true);
      setRoomPassword('');
      setError('');
    } else {
      navigate(`/room/${room.id}`);
    }
  };

  const handleJoinPrivate = () => {
    if (selectedRoom && selectedRoom.password === roomPassword) {
      setShowModal(false);
      navigate(`/room/${selectedRoom.id}`);
    } else {
      setError('Şifre yanlış!');
    }
  };

  const filteredRooms = rooms.filter(room =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (room.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 pt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Üst Panel: Oda Oluştur & Arama */}
        <div className="glass-panel flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10 p-6 rounded-2xl shadow-xl" style={{backdropFilter:'blur(12px)', background:'rgba(255,255,255,0.08)'}}>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-0">Sohbet Odaları</h1>
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center justify-end">
            <button 
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-lg shadow-lg transition-all btn-create-room" 
              style={{background:'linear-gradient(135deg, #4F46E5, #A78BFA)', color:'#fff', boxShadow:'0 4px 16px rgba(99,102,241,0.4)'}}
              onClick={() => setShowCreateRoom(true)}
            >
              <span className="text-2xl">➕</span> Oda Oluştur
            </button>
            <input
              type="text"
              className="input w-full md:w-72 px-4 py-3 rounded-xl border-none focus:ring-2 focus:ring-[#4F46E5]"
              placeholder="Oda ara..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{background:'rgba(255,255,255,0.12)', color:'#F3F4F6'}}
            />
          </div>
        </div>

        {/* Oda Kartları Grid */}
        <div className="rooms-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'2rem'}}>
          {filteredRooms.map(room => (
            <div key={room.id} className="room-card flex flex-col justify-between h-full rounded-xl shadow-xl p-6 fade-in" style={{backdropFilter:'blur(12px)', background:'rgba(255,255,255,0.08)'}}>
              <div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{room.name}</h2>
                <p className="text-gray-200 mb-4 truncate" style={{color:'#F3F4F6', opacity:0.85}}>{room.description}</p>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {room.type === 'private' ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-700/90 text-white">Gizli</span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-700/90 text-white">Açık</span>
                )}
              </div>
              <div className="flex items-center gap-2 mb-6">
                <svg className="w-5 h-5" fill="#E0E7FF" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05C15.64 13.37 17 14.28 17 15.5V19h7v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                <span className="text-sm" style={{color:'#F3F4F6', opacity:0.7}}>
                  {typeof room.activeUsers === 'object' && room.activeUsers !== null
                    ? Object.keys(room.activeUsers).length
                    : (room.activeUsers || 0)
                  } aktif kullanıcı
                </span>
              </div>
              <div className="flex justify-end mt-auto">
                <button 
                  onClick={() => handleRoomClick(room)}
                  className="btn btn-primary px-6 py-2 rounded-xl font-semibold shadow-lg transition-all" 
                  style={{background:'#4F46E5', color:'#fff', fontWeight:600}}
                >
                  Katıl
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Private oda şifre modalı */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative w-full max-w-xs mx-auto">
              <button onClick={() => setShowModal(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl">&times;</button>
              <h3 className="text-lg font-semibold mb-4">Gizli Odaya Katıl</h3>
              <input
                type="password"
                className="input mb-2"
                placeholder="Oda Şifresi"
                value={roomPassword}
                onChange={e => setRoomPassword(e.target.value)}
              />
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <button className="btn-primary w-full" onClick={handleJoinPrivate}>Katıl</button>
            </div>
          </div>
        )}

        {/* Oda Oluştur Modal */}
        {showCreateRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative w-full max-w-md mx-auto">
              <button 
                onClick={() => setShowCreateRoom(false)} 
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
              >
                &times;
              </button>
              <CreateRoom onClose={() => setShowCreateRoom(false)} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomList; 