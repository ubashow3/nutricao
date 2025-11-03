
import React from 'react';
import Logo from '../components/Logo';

interface HomePageProps {
  onStart: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onStart }) => {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      <div className="absolute inset-0">
        <img
          src="https://picsum.photos/seed/nutrition/1920/1080"
          alt="Fundo com alimentos saudáveis"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
      </div>
      <div className="relative z-10 flex flex-col items-center text-center p-8 max-w-3xl">
        <Logo className="h-20 text-emerald-700 mb-6" />

        <h1 className="text-4xl md:text-6xl font-bold text-emerald-800 mb-4 leading-tight">
          Transforme sua relação com a comida.
        </h1>
        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl">
          Descubra como seus hábitos diários impactam sua saúde. Responda a um breve questionário e receba uma análise preliminar gratuita, sem compromisso.
        </p>
        <button
          onClick={onStart}
          className="bg-emerald-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105 duration-300 ease-in-out"
        >
          Vamos Começar
        </button>
      </div>
    </div>
  );
};

export default HomePage;
