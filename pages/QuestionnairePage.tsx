
import React, { useState } from 'react';
import { type Answers, type Question } from '../types';
import ProgressBar from '../components/ProgressBar';
import Logo from '../components/Logo';

const questions: Question[] = [
  { id: 'Objetivo Principal', text: 'Qual é o seu principal objetivo ao procurar uma nutricionista?', type: 'radio', options: ['Perder peso', 'Ganhar massa muscular', 'Melhorar a saúde geral', 'Aprender a comer melhor', 'Outro'] },
  { id: 'Consumo de Água', text: 'Quantos copos de água (200ml) você bebe por dia, em média?', type: 'radio', options: ['Menos de 4', '4 a 6', '7 a 9', '10 ou mais'] },
  { id: 'Qualidade do Sono', text: 'Como você classificaria a qualidade do seu sono?', type: 'radio', options: ['Ruim', 'Regular', 'Bom', 'Excelente'] },
  { id: 'Horas de Sono', text: 'Em média, quantas horas você dorme por noite?', type: 'radio', options: ['Menos de 5 horas', '5-6 horas', '7-8 horas', 'Mais de 8 hours'] },
  { id: 'Nível de Estresse', text: 'Em uma escala de 1 a 5, qual o seu nível de estresse diário?', type: 'radio', options: ['1 (Muito baixo)', '2', '3', '4', '5 (Muito alto)'] },
  { id: 'Consumo de Vegetais', text: 'Com que frequência você consome vegetais e legumes?', type: 'radio', options: ['Raramente', 'Algumas vezes por semana', 'Em quase todas as refeições', 'Em todas as refeições'] },
  { id: 'Consumo de Doces', text: 'Com que frequência você consome doces, sobremesas ou refrigerantes?', type: 'radio', options: ['Diariamente', 'Algumas vezes por semana', 'Apenas em fins de semana', 'Raramente'] },
  { id: 'Atividade Física', text: 'Você pratica alguma atividade física regularmente?', type: 'radio', options: ['Não', 'Sim, 1-2 vezes/semana', 'Sim, 3-4 vezes/semana', 'Sim, 5+ vezes/semana'] },
  { id: 'Comentários Adicionais', text: 'Há algo mais que você gostaria de compartilhar sobre seus hábitos ou saúde?', type: 'textarea' }
];

interface QuestionnairePageProps {
  onComplete: (answers: Answers) => void;
  initialAnswers: Answers;
  error: string | null;
}

const QuestionnairePage: React.FC<QuestionnairePageProps> = ({ onComplete, initialAnswers, error }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete(answers);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const currentQuestion = questions[currentStep];
  const isLastStep = currentStep === questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
       <div className="w-full max-w-2xl">
         <div className="flex justify-center mb-8">
            <Logo className="h-16 text-emerald-700"/>
         </div>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <ProgressBar current={currentStep + 1} total={questions.length} />
          {error && <div className="mt-4 text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}
          <div className="mt-8 mb-8 min-h-[200px]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">{currentQuestion.text}</h2>
            {currentQuestion.type === 'radio' && currentQuestion.options && (
              <div className="space-y-3">
                {currentQuestion.options.map(option => (
                  <label key={option} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
                    <input
                      type="radio"
                      name={currentQuestion.id}
                      value={option}
                      checked={answers[currentQuestion.id] === option}
                      onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
                      className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                    />
                    <span className="ml-4 text-gray-700 text-lg">{option}</span>
                  </label>
                ))}
              </div>
            )}
            {currentQuestion.type === 'textarea' && (
              <textarea
                value={answers[currentQuestion.id] || ''}
                onChange={e => handleAnswer(currentQuestion.id, e.target.value)}
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Digite aqui..."
              ></textarea>
            )}
          </div>
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="px-6 py-2 text-gray-600 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Voltar
            </button>
            <button
              onClick={nextStep}
              disabled={!answers[currentQuestion.id]}
              className="bg-emerald-600 text-white font-bold py-3 px-8 rounded-full shadow-md hover:bg-emerald-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300"
            >
              {isLastStep ? 'Ver Análise' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionnairePage;
