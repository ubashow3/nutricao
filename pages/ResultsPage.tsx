import React from 'react';
import Logo from '../components/Logo';

// A simple markdown to HTML parser
const Markdown = ({ text }: { text: string }) => {
    const formatText = (inputText: string) => {
        return inputText
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
            .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map((line, index) => {
                if (line.startsWith('- ')) {
                    return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
                }
                if (/^#{1,6}\s/.test(line)) {
                     const level = line.match(/^#+/)?.[0].length || 1;
                     const content = line.replace(/^#{1,6}\s/, '');
                     // FIX: Use React.createElement for dynamic tags to resolve JSX type errors
                     // and cap heading level at h6.
                     const headingLevel = Math.min(level + 2, 6);
                     const tag = `h${headingLevel}`;
                     return React.createElement(tag, {
                       key: index,
                       className: "font-semibold text-lg mt-4 mb-2 text-emerald-700"
                     }, content);
                }
                return <p key={index} className="mb-4">{line}</p>;
            });
    };

    return <>{formatText(text)}</>;
};


interface ResultsPageProps {
  result: string;
  onSchedule: () => void;
}

const ResultsPage: React.FC<ResultsPageProps> = ({ result, onSchedule }) => {
  return (
    <div className="min-h-screen bg-emerald-50 flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-3xl">
            <div className="flex justify-center mb-8">
                <Logo className="h-16 text-emerald-700"/>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-3xl font-bold text-center text-emerald-800 mb-4">Sua Análise Preliminar</h1>
                <p className="text-center text-gray-600 mb-8">
                    Com base nas suas respostas, aqui está uma visão geral dos seus hábitos. Lembre-se, este é apenas o começo da nossa jornada!
                </p>
                <div className="prose max-w-none text-gray-700 bg-gray-50 p-6 rounded-lg">
                    <Markdown text={result} />
                </div>
                 <div className="text-center mt-8">
                    <p className="text-lg text-gray-700 mb-6">Pronto para dar o próximo passo e criar um plano de ação personalizado?</p>
                    <button
                        onClick={onSchedule}
                        className="bg-emerald-600 text-white font-bold py-4 px-10 rounded-full text-lg shadow-lg hover:bg-emerald-700 transition-transform transform hover:scale-105 duration-300 ease-in-out"
                    >
                        Agendar minha Consulta
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default ResultsPage;