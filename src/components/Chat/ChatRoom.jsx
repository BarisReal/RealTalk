import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { db, auth, handleFirebaseError } from '../../firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import OnlineUsers from './OnlineUsers';

const EMOJIS = ['👍', '😂', '❤️', '🔥', '😮', '😢'];

const FIFTEEN_MINUTES = 15 * 60 * 1000;

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dersva06z/image/upload';
const UPLOAD_PRESET = 'realtalk_unsigned';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [user] = useAuthState(auth);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [roomInfo, setRoomInfo] = useState(null);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [openEmojiMenu, setOpenEmojiMenu] = useState(null);
  const emojiMenuRef = useRef();
  const [lastMessageTime, setLastMessageTime] = useState(0);
  const [messageCount, setMessageCount] = useState(0);
  const [lastMessageReset, setLastMessageReset] = useState(Date.now());
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Spam protection constants
  const MESSAGE_RATE_LIMIT = 5; // Maximum messages per time window
  const RATE_LIMIT_WINDOW = 10000; // 10 seconds
  const MESSAGE_COOLDOWN = 1000; // 1 second between messages
  const MAX_MESSAGE_LENGTH = 500;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Subscribe to room info
    const roomRef = doc(db, 'rooms', roomId);
    const unsubRoom = onSnapshot(roomRef, (doc) => {
      if (doc.exists()) {
        setRoomInfo(doc.data());
        // Online users logic (same as OnlineUsers component)
        const roomData = doc.data();
        const activeUsers = roomData.activeUsers || {};
        const now = new Date();
        const activeUsersArray = Object.entries(activeUsers)
          .filter(([_, userData]) => {
            const lastActive = userData.lastActive?.toDate();
            return lastActive && (now - lastActive) < 2 * 60 * 1000; // 2 minutes
          })
          .map(([uid, userData]) => ({
            uid,
            ...userData
          }));
        setOnlineUsers(activeUsersArray);
      } else {
        setError('Oda bulunamadı');
      }
    });

    // Subscribe to messages
    const messagesRef = collection(db, 'rooms', roomId, 'messages');
    const q = query(messagesRef, orderBy('createdAt', 'desc'), limit(50));
    
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach
      ((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData.reverse());
      setLoading(false);
      scrollToBottom();
    });

    // Update active users
    const updateActiveUsers = async () => {
      try {
        await updateDoc(roomRef, {
          [`activeUsers.${auth.currentUser.uid}`]: {
            displayName: auth.currentUser.displayName,
            photoURL: auth.currentUser.photoURL,
            lastActive: serverTimestamp()
          }
        });
      } catch (err) {
        console.error('Error updating active users:', err);
      }
    };

    updateActiveUsers();
    const interval = setInterval(updateActiveUsers, 30000); // Update every 30 seconds

    return () => {
      unsubRoom();
      unsubMessages();
      clearInterval(interval);
    };
  }, [roomId]);

  useEffect(() => {
    const handleClick = (e) => {
      if (emojiMenuRef.current && !emojiMenuRef.current.contains(e.target)) {
        setOpenEmojiMenu(null);
      }
    };
    if (openEmojiMenu) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openEmojiMenu]);

  // Check if user is banned
  useEffect(() => {
    const checkUserBanStatus = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
        if (userDoc.exists() && userDoc.data().isBanned) {
          setError('Hesabınız yasaklandı. Lütfen yönetici ile iletişime geçin.');
        }
      } catch (err) {
        console.error('Error checking ban status:', err);
      }
    };

    if (auth.currentUser) {
      checkUserBanStatus();
    }
  }, []);

  // Reset message count every RATE_LIMIT_WINDOW
  useEffect(() => {
    const interval = setInterval(() => {
      setMessageCount(0);
      setLastMessageReset(Date.now());
    }, RATE_LIMIT_WINDOW);

    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Check if user is banned
    try {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists() && userDoc.data().isBanned) {
        setError('Hesabınız yasaklandı. Lütfen yönetici ile iletişime geçin.');
        return;
      }
    } catch (err) {
      console.error('Error checking ban status:', err);
      return;
    }

    // Check message length
    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      setError(`Mesaj çok uzun. Maksimum ${MAX_MESSAGE_LENGTH} karakter olabilir.`);
      return;
    }

    // Check message cooldown
    const now = Date.now();
    if (now - lastMessageTime < MESSAGE_COOLDOWN) {
      setError('Lütfen mesajlar arasında biraz bekleyin.');
      return;
    }

    // Check rate limit
    if (messageCount >= MESSAGE_RATE_LIMIT) {
      const timeLeft = Math.ceil((RATE_LIMIT_WINDOW - (now - lastMessageReset)) / 1000);
      setError(`Çok hızlı mesaj gönderiyorsunuz. Lütfen ${timeLeft} saniye bekleyin.`);
      return;
    }

    try {
      const messagesRef = collection(db, 'rooms', roomId, 'messages');
      await addDoc(messagesRef, {
        text: newMessage,
        createdAt: serverTimestamp(),
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
        readBy: [auth.currentUser.uid]
      });

      setNewMessage('');
      setLastMessageTime(now);
      setMessageCount(prev => prev + 1);
      setError('');
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Mesaj gönderilemedi');
    }
  };

  const handleReact = async (messageId, emoji, hasReacted) => {
    if (!auth.currentUser) {
      setError('Tepki eklemek için giriş yapmalısınız');
      return;
    }

    try {
      const messageRef = doc(db, 'rooms', roomId, 'messages', messageId);
      const userId = auth.currentUser.uid;
      const field = `reactions.${emoji}`;

      // Mevcut tepkileri al
      const messageDoc = await getDoc(messageRef);
      if (!messageDoc.exists()) {
        setError('Mesaj bulunamadı');
        return;
      }

      const messageData = messageDoc.data();
      const currentReactions = messageData.reactions?.[emoji] || [];

      // Tepkiyi güncelle
      const updateData = {};
      updateData[field] = hasReacted 
        ? arrayRemove(userId)
        : arrayUnion(userId);

      await updateDoc(messageRef, updateData);
      setError('');
    } catch (err) {
      console.error('Error updating reaction:', err);
      let errorMessage = 'Tepki eklenemedi. Lütfen tekrar deneyin.';
      
      if (err.code) {
        switch (err.code) {
          case 'permission-denied':
            errorMessage = 'Bu işlem için yetkiniz yok';
            break;
          case 'not-found':
            errorMessage = 'Mesaj bulunamadı';
            break;
          case 'unavailable':
            errorMessage = 'Bağlantı hatası. Lütfen internet bağlantınızı kontrol edin.';
            break;
          default:
            errorMessage = 'Bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
        }
      }
      
      setError(errorMessage);
    }
  };

  const handleEdit = (message) => {
    setEditingId(message.id);
    setEditText(message.text);
  };

  const handleEditSave = async (message) => {
    const messageRef = doc(db, 'rooms', roomId, 'messages', message.id);
    try {
      await updateDoc(messageRef, { text: editText });
      setEditingId(null);
      setEditText('');
    } catch (err) {
      setError('Mesaj güncellenemedi');
    }
  };

  const handleDelete = async (message) => {
    const messageRef = doc(db, 'rooms', roomId, 'messages', message.id);
    try {
      await deleteDoc(messageRef);
    } catch (err) {
      setError('Mesaj silinemedi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem)] flex flex-col">
        {/* Room Header */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-t-xl border border-gray-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <h1 className="text-xl font-semibold">Genel Sohbet</h1>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>{onlineUsers.length} aktif kullanıcı</span>
              <button className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-gray-800/30 backdrop-blur-sm p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.uid === auth.currentUser.uid ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[70%] ${
                  message.uid === auth.currentUser.uid ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <img
                  src={message.photoURL || 'https://via.placeholder.com/24'}
                  alt={message.displayName}
                  className="h-10 w-10 rounded-full border-2 border-indigo-500"
                />
                <div
                  className={`mx-3 ${
                    message.uid === auth.currentUser.uid ? 'bg-indigo-600' : 'bg-gray-700'
                  } rounded-xl p-3`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{message.displayName}</span>
                    <span className="text-xs text-gray-400">
                      {message.createdAt?.toDate().toLocaleTimeString()}
                    </span>
                  </div>
                  {editingId === message.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        className="input flex-1"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                        maxLength={500}
                      />
                      <button className="btn-primary" onClick={() => handleEditSave(message)} type="button">Kaydet</button>
                      <button className="btn-secondary" onClick={() => setEditingId(null)} type="button">İptal</button>
                    </div>
                  ) : (
                    <p className="text-gray-100">{message.text}</p>
                  )}
                  <div className="text-xs mt-1 opacity-75 flex items-center gap-2">
                    {/* Emoji Reactions */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {/* Mevcut tepkiler küçük gösterilsin */}
                      {Object.entries(message.reactions || {}).map(([emoji, users]) => (
                        users.length > 0 && (
                          <span key={emoji} className={`flex items-center px-2 py-1 rounded-full text-xs border bg-gray-100 border-gray-300 mr-1`}>
                            {emoji} {users.length}
                          </span>
                        )
                      ))}
                      {/* Emoji menüsü butonu */}
                      <div className="relative">
                        <button
                          className="flex items-center px-2 py-1 rounded-full text-sm border bg-gray-100 border-gray-300 hover:bg-indigo-200 transition"
                          onClick={() => setOpenEmojiMenu(openEmojiMenu === message.id ? null : message.id)}
                          type="button"
                        >
                          <span role="img" aria-label="emoji">🙂</span>
                        </button>
                        {openEmojiMenu === message.id && (
                          <div ref={emojiMenuRef} className="absolute z-10 left-0 mt-2 bg-white dark:bg-gray-800 border rounded shadow-lg p-2 flex flex-wrap gap-2">
                            {EMOJIS.map((emoji) => {
                              const users = message.reactions?.[emoji] || [];
                              const hasReacted = users.includes(auth.currentUser.uid);
                              return (
                                <button
                                  key={emoji}
                                  className={`text-xl p-1 rounded hover:bg-indigo-100 ${hasReacted ? 'ring-2 ring-indigo-400' : ''}`}
                                  onClick={() => { handleReact(message.id, emoji, hasReacted); setOpenEmojiMenu(null); }}
                                  type="button"
                                >
                                  {emoji}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-b-xl border border-gray-700/50 p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-4">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Mesajınızı yazın..."
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
            />
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105"
            >
              Gönder
            </button>
          </form>
        </div>
      </div>

      {/* Online Users Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-l dark:border-gray-700">
        <OnlineUsers roomId={roomId} onlineUsers={onlineUsers} />
      </div>
    </div>
  );
};

export default ChatRoom; 