
import React from 'react';
import { type UserData } from '../types';
import Logo from '../components/Logo';

interface ConfirmationPageProps {
  userData: UserData | null;
  onRestart: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ userData, onRestart }) => {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center text-center p-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-lg max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <Logo className="h-16 text-emerald-700" />
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-emerald-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h1 className="text-3xl font-bold text-emerald-800 mb-3">
          Tudo certo, {userData?.name.split(' ')[0]}!
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          Seu pedido de agendamento foi recebido. Em breve, nossa equipe entrará em contato com você pelo telefone ou e-mail fornecido para confirmar os detalhes da sua consulta.
        </p>
        <div className="bg-gray-100 p-4 rounded-lg text-left text-sm text-gray-700 mb-8">
            <p><strong>Nome:</strong> {userData?.name}</p>
            <p><strong>E-mail:</strong> {userData?.email}</p>
            <p><strong>Telefone:</strong> {userData?.phone}</p>
        </div>
        <p className="text-gray-600 mb-8">
            Estou ansiosa para começarmos juntos essa jornada de transformação!
        </p>
        <button
            onClick={onRestart}
            className="text-emerald-600 font-semibold hover:text-emerald-800 transition"
        >
            Voltar para o Início
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
