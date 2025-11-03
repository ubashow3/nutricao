
import React, { useState } from 'react';
import { type UserData } from '../types';
import Logo from '../components/Logo';

interface RegistrationPageProps {
  onRegister: (data: UserData) => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onRegister }) => {
  const [formData, setFormData] = useState<UserData>({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.email.trim()) {
        newErrors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Formato de e-mail inválido';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onRegister(formData);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
         <div className="flex justify-center mb-8">
            <Logo className="h-16 text-emerald-700"/>
         </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Falta pouco!</h1>
          <p className="text-center text-gray-600 mb-6">Preencha seus dados para finalizarmos o pré-agendamento da sua consulta.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>
             <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>
             <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Telefone / WhatsApp</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${errors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500`}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div className="pt-4">
               <button
                type="submit"
                className="w-full bg-emerald-600 text-white font-bold py-3 px-4 rounded-full shadow-md hover:bg-emerald-700 transition-colors duration-300"
               >
                Confirmar Agendamento
              </button>
            </div>
          </form>
           <p className="text-xs text-gray-500 text-center mt-4">
              Entraremos em contato em breve para confirmar a data e horário da sua consulta.
            </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
