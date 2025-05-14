import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

const AdminPanel = () => {
  const [user] = useAuthState(auth);
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [banDuration, setBanDuration] = useState(1);
  const [banReason, setBanReason] = useState('');
  const [banType, setBanType] = useState('temporary');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRooms: 0,
    activeRooms: 0
  });

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const usersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);
      setStats(prev => ({ ...prev, totalUsers: usersData.length }));
    };

    fetchUsers();
  }, []);

  // Fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, orderBy('createdAt', 'desc'), limit(50));
      const snapshot = await getDocs(q);
      const roomsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRooms(roomsData);
      setStats(prev => ({ ...prev, totalRooms: roomsData.length }));
    };

    fetchRooms();
  }, []);

  // Filter users and rooms based on search query
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRooms = rooms.filter(room =>
    room.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Ban user
  const handleBanUser = async () => {
    if (!selectedUser) return;

    const banEndTime = banType === 'temporary' 
      ? Timestamp.fromDate(new Date(Date.now() + banDuration * 24 * 60 * 60 * 1000))
      : null;

    const userRef = doc(db, 'users', selectedUser.id);
    await updateDoc(userRef, {
      isBanned: true,
      banEndTime,
      banReason,
      banType,
      bannedBy: user.uid,
      bannedAt: Timestamp.now()
    });

    // Update local state
    setUsers(users.map(u => 
      u.id === selectedUser.id 
        ? { ...u, isBanned: true, banEndTime, banReason, banType }
        : u
    ));
    setSelectedUser(null);
    setBanDuration(1);
    setBanReason('');
  };

  // Unban user
  const handleUnbanUser = async (userId) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      isBanned: false,
      banEndTime: null,
      banReason: '',
      banType: ''
    });

    // Update local state
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, isBanned: false, banEndTime: null, banReason: '', banType: '' }
        : u
    ));
  };

  // Delete room
  const handleDeleteRoom = async (roomId) => {
    if (window.confirm('Bu odayı silmek istediğinizden emin misiniz?')) {
      const roomRef = doc(db, 'rooms', roomId);
      await deleteDoc(roomRef);
      setRooms(rooms.filter(room => room.id !== roomId));
    }
  };

  // Update room
  const handleUpdateRoom = async (roomId, updates) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, updates);
    setRooms(rooms.map(room => 
      room.id === roomId ? { ...room, ...updates } : room
    ));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Toplam Kullanıcı</h3>
            <p className="text-3xl font-bold text-indigo-400">{stats.totalUsers}</p>
          </div>
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Aktif Kullanıcılar</h3>
            <p className="text-3xl font-bold text-green-400">{stats.activeUsers}</p>
          </div>
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Toplam Oda</h3>
            <p className="text-3xl font-bold text-purple-400">{stats.totalRooms}</p>
          </div>
          <div className="glass p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Aktif Odalar</h3>
            <p className="text-3xl font-bold text-blue-400">{stats.activeRooms}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'users' ? 'bg-indigo-600' : 'bg-gray-800'
            }`}
            onClick={() => setActiveTab('users')}
          >
            Kullanıcılar
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'rooms' ? 'bg-indigo-600' : 'bg-gray-800'
            }`}
            onClick={() => setActiveTab('rooms')}
          >
            Odalar
          </button>
          <button
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'reports' ? 'bg-indigo-600' : 'bg-gray-800'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            Raporlar
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input w-full"
          />
        </div>

        {/* Content */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {filteredUsers.map(user => (
              <div key={user.id} className="glass p-4 rounded-lg flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email || 'Kullanıcı')}&background=4F46E5&color=fff&size=40`}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-full"
                  />
                  <div>
                    <h3 className="font-medium">{user.displayName || 'İsimsiz Kullanıcı'}</h3>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {user.isBanned ? (
                    <button
                      onClick={() => handleUnbanUser(user.id)}
                      className="btn-secondary"
                    >
                      Yasak Kaldır
                    </button>
                  ) : (
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="btn-primary"
                    >
                      Yasakla
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="space-y-4">
            {filteredRooms.map(room => (
              <div key={room.id} className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium">{room.name}</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleUpdateRoom(room.id, { isPublic: !room.isPublic })}
                      className="btn-secondary"
                    >
                      {room.isPublic ? 'Gizli Yap' : 'Açık Yap'}
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="btn-primary"
                    >
                      Sil
                    </button>
                  </div>
                </div>
                <p className="text-gray-400 mb-2">{room.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Oluşturan: {room.ownerName}</span>
                  <span>Kullanıcı Sayısı: {room.userCount || 0}</span>
                  <span>Durum: {room.isPublic ? 'Açık' : 'Gizli'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="glass p-6 rounded-xl">
            <h2 className="text-xl font-bold mb-4">Raporlar</h2>
            <p className="text-gray-400">Rapor sistemi yakında eklenecek...</p>
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="glass p-6 rounded-xl max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Kullanıcıyı Yasakla</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Yasak Türü</label>
                <select
                  value={banType}
                  onChange={(e) => setBanType(e.target.value)}
                  className="input w-full"
                >
                  <option value="temporary">Geçici</option>
                  <option value="permanent">Kalıcı</option>
                </select>
              </div>
              {banType === 'temporary' && (
                <div>
                  <label className="block text-sm font-medium mb-1">Süre (Gün)</label>
                  <input
                    type="number"
                    value={banDuration}
                    onChange={(e) => setBanDuration(Number(e.target.value))}
                    min="1"
                    className="input w-full"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Sebep</label>
                <textarea
                  value={banReason}
                  onChange={(e) => setBanReason(e.target.value)}
                  className="input w-full"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn-secondary"
                >
                  İptal
                </button>
                <button
                  onClick={handleBanUser}
                  className="btn-primary"
                >
                  Yasakla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 