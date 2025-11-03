
import React, { useState, useCallback } from 'react';
import { AppState, type Answers, type UserData } from './types';
import HomePage from './pages/HomePage';
import QuestionnairePage from './pages/QuestionnairePage';
import ResultsPage from './pages/ResultsPage';
import RegistrationPage from './pages/RegistrationPage';
import ConfirmationPage from './pages/ConfirmationPage';
import LoadingSpinner from './components/LoadingSpinner';
import { analyzeAnswers } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.Home);
  const [answers, setAnswers] = useState<Answers>({});
  const [analysisResult, setAnalysisResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);


  const handleStart = useCallback(() => {
    setAppState(AppState.Questionnaire);
  }, []);

  const handleQuestionnaireComplete = useCallback(async (completedAnswers: Answers) => {
    setAnswers(completedAnswers);
    setAppState(AppState.Analyzing);
    setError(null);
    try {
      const result = await analyzeAnswers(completedAnswers);
      setAnalysisResult(result);
      setAppState(AppState.Results);
    } catch (e) {
      setError('Falha ao analisar os dados. Por favor, tente novamente.');
      setAppState(AppState.Questionnaire); // Go back to questionnaire
    }
  }, []);

  const handleSchedule = useCallback(() => {
    setAppState(AppState.Registration);
  }, []);

  const handleRegistrationComplete = useCallback((data: UserData) => {
    setUserData(data);
    setAppState(AppState.Confirmation);
  }, []);
  
  const handleRestart = useCallback(() => {
    setAnswers({});
    setAnalysisResult('');
    setUserData(null);
    setError(null);
    setAppState(AppState.Home);
  }, []);

  const renderContent = () => {
    switch (appState) {
      case AppState.Home:
        return <HomePage onStart={handleStart} />;
      case AppState.Questionnaire:
        return <QuestionnairePage onComplete={handleQuestionnaireComplete} initialAnswers={answers} error={error} />;
      case AppState.Analyzing:
        return (
            <div className="flex items-center justify-center h-screen">
                <LoadingSpinner message="Analisando suas respostas..." />
            </div>
        );
      case AppState.Results:
        return <ResultsPage result={analysisResult} onSchedule={handleSchedule} />;
      case AppState.Registration:
        return <RegistrationPage onRegister={handleRegistrationComplete} />;
      case AppState.Confirmation:
        return <ConfirmationPage userData={userData} onRestart={handleRestart} />;
      default:
        return <HomePage onStart={handleStart} />;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen text-gray-800">
        {renderContent()}
    </div>
  );
};

export default App;
