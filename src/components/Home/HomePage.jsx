import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../firebase';

// --- Reusable UI Components ---
const GlassCard = ({ children, className = '' }) => (
  <div
    className={`
      bg-white bg-opacity-10 backdrop-blur-md rounded-2xl p-6 shadow-lg
      transition-transform duration-300 hover:scale-[1.02]
      ${className}
    `}
  >
    {children}
  </div>
);

const Section = ({ id, children, bgClass = 'bg-gray-900' }) => (
  <section id={id} className={`${bgClass} py-20`}>
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  </section>
);

const GradientHeading = ({ level = 2, children, className = '' }) => {
  const Tag = `h${level}`;
  return (
    <Tag
      className={`
        text-white ${level === 1 ? 'text-5xl sm:text-6xl' : 'text-3xl'} 
        font-bold text-center mb-8
        bg-clip-text text-transparent 
        bg-gradient-to-r from-indigo-400 to-purple-400
        ${className}
      `}
    >
      {children}
    </Tag>
  );
};

const PrimaryButton = ({ to, children, color = 'indigo' }) => (
  <Link
    to={to}
    className={`
      px-8 py-3 rounded-lg font-semibold text-lg
      bg-${color}-600 hover:bg-${color}-700
      transform transition-all duration-300 hover:scale-105
      shadow-lg shadow-${color}-500/50 text-white
    `}
  >
    {children}
  </Link>
);

// --- Data ---
const features = [
  { icon: '💬', title: 'Gerçek Zamanlı Sohbet', description: 'Anlık mesajlaşma ile kesintisiz iletişim' },
  { icon: '🔒', title: 'Gizli Odalar', description: 'Özel şifreli odalar oluşturun' },
  { icon: '👤', title: 'Profil Kişiselleştirme', description: 'Kendinize özel profil oluşturun' },
  { icon: '📱', title: 'Tüm Cihazlarla Uyumlu', description: 'Mobil, tablet ve masaüstünde sorunsuz çalışır' },
];

const steps = [
  { icon: '🎮', title: 'Oda Oluştur', description: 'Herkese açık veya gizli bir oda oluşturun' },
  { icon: '🔑', title: 'Kodu Paylaş', description: 'Arkadaşlarınızı davet etmek için kodu paylaşın' },
  { icon: '💬', title: 'Sohbete Başla', description: 'Anında sohbet etmeye başlayın' },
];

// --- HomePage ---
const HomePage = () => {
  const [user] = useAuthState(auth);

  return (
    <div className="min-h-screen bg-gray-900 text-white">

      {/* Hero */}
      <Section id="hero" bgClass="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-purple-900/50" />
        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
        <div className="relative z-10 text-center px-4">
          <GradientHeading level={1}>Sohbete Katıl</GradientHeading>
          <p className="text-gray-300 text-xl sm:text-2xl mb-10 max-w-2xl mx-auto">
            Gerçek zamanlı sohbet platformunda arkadaşlarınızla bağlantıda kalın
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <PrimaryButton to="/rooms" color="indigo">Oda Oluştur</PrimaryButton>
            <PrimaryButton to="/rooms" color="purple">Koda Göre Katıl</PrimaryButton>
          </div>
        </div>
      </Section>

      {/* How It Works */}
      <Section id="how-it-works" bgClass="bg-gray-800">
        <GradientHeading level={2}>Nasıl Çalışır?</GradientHeading>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <GlassCard key={i} className="text-center">
              <div className="text-5xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-300">{step.description}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Features */}
      <Section id="features" bgClass="bg-gray-900">
        <GradientHeading level={2}>Öne Çıkan Özellikler</GradientHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feat, i) => (
            <GlassCard key={i} className="text-center">
              <div className="text-5xl mb-4">{feat.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feat.title}</h3>
              <p className="text-gray-300">{feat.description}</p>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Active Rooms */}
      <Section id="active-rooms" bgClass="bg-gray-800">
        <GradientHeading level={2}>Aktif Odalar</GradientHeading>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Örnek statik kart; dinamik listeyle değiştir */}
          <GlassCard>
            <h3 className="text-xl font-semibold mb-2">Genel Sohbet</h3>
            <p className="text-gray-300 mb-4">Herkesin katılabileceği genel sohbet odası</p>
            <div className="flex items-center text-sm text-gray-400">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              24 aktif kullanıcı
            </div>
          </GlassCard>
        </div>
      </Section>

    </div>
  );
};

export default HomePage;
