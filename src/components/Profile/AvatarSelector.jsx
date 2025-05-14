import React, { useState, useEffect } from 'react';

const AvatarSelector = ({ onSelect, initialGender = 'male', initialAvatar = '' }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar);
  const [avatarList, setAvatarList] = useState({ male: [], female: [] });
  const [gender, setGender] = useState(initialGender);
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);

  useEffect(() => {
    // Load avatar images
    const loadAvatars = () => {
      const maleAvatars = [
        '/avatars/MALE/avatar1.png',
        '/avatars/MALE/avatar2.png',
        '/avatars/MALE/avatar3.png',
        '/avatars/MALE/avatar4.png',
        '/avatars/MALE/avatar5.png',
        '/avatars/MALE/avatar6.png',
        '/avatars/MALE/gotikerkek1.png',
        '/avatars/MALE/gotikerkek2.png',
        '/avatars/MALE/gotikerkek3.png'
      ];
      
      const femaleAvatars = [
        '/avatars/FEMALE/sarisackiz2.png',
        '/avatars/FEMALE/sarisackiz3.png',
        '/avatars/FEMALE/siyahsackız2.png',
        '/avatars/FEMALE/siyahsackız3.png',
        '/avatars/FEMALE/gotikkiz1.png',
        '/avatars/FEMALE/gotikkiz2.png',
        '/avatars/FEMALE/gotikkiz3.png'
      ];
      
      setAvatarList({ male: maleAvatars, female: femaleAvatars });
      
      // Find initial avatar index
      const initialList = initialGender === 'male' ? maleAvatars : femaleAvatars;
      const initialIndex = initialList.findIndex(avatar => avatar === initialAvatar);
      setCurrentAvatarIndex(initialIndex >= 0 ? initialIndex : 0);
      setSelectedAvatar(initialIndex >= 0 ? initialAvatar : initialList[0]);
    };

    loadAvatars();
  }, [initialGender, initialAvatar]);

  const handleNextAvatar = () => {
    const currentList = avatarList[gender];
    const nextIndex = (currentAvatarIndex + 1) % currentList.length;
    setCurrentAvatarIndex(nextIndex);
    setSelectedAvatar(currentList[nextIndex]);
  };

  const handlePrevAvatar = () => {
    const currentList = avatarList[gender];
    const prevIndex = (currentAvatarIndex - 1 + currentList.length) % currentList.length;
    setCurrentAvatarIndex(prevIndex);
    setSelectedAvatar(currentList[prevIndex]);
  };

  const handleRandomizeAvatar = () => {
    const currentList = avatarList[gender];
    const randomIndex = Math.floor(Math.random() * currentList.length);
    setCurrentAvatarIndex(randomIndex);
    setSelectedAvatar(currentList[randomIndex]);
  };

  const handleGenderChange = (newGender) => {
    setGender(newGender);
    setCurrentAvatarIndex(0);
    setSelectedAvatar(avatarList[newGender][0]);
  };

  const handleSelect = () => {
    onSelect(selectedAvatar, gender);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <button
          type="button"
          onClick={() => handleGenderChange('male')}
          className={`px-4 py-2 rounded-md ${
            gender === 'male'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Erkek
        </button>
        <button
          type="button"
          onClick={() => handleGenderChange('female')}
          className={`px-4 py-2 rounded-md ${
            gender === 'female'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}
        >
          Kadın
        </button>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative w-32 h-32">
          <img
            src={selectedAvatar}
            alt="Selected Avatar"
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            type="button"
            onClick={handlePrevAvatar}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            type="button"
            onClick={handleRandomizeAvatar}
            className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
          >
            Rastgele
          </button>
          
          <button
            type="button"
            onClick={handleNextAvatar}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={handleSelect}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Seç
        </button>
      </div>
    </div>
  );
};

export default AvatarSelector; 