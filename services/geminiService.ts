
import { GoogleGenAI } from "@google/genai";
import { type Answers } from '../types';

const formatAnswersForPrompt = (answers: Answers): string => {
  return Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
};

export const analyzeAnswers = async (answers: Answers): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const formattedAnswers = formatAnswersForPrompt(answers);

  const prompt = `
    Você é um assistente de nutrição para a nutricionista Camila Sorroche.
    Um cliente em potencial preencheu o seguinte questionário sobre seus hábitos.
    Sua tarefa é fornecer uma análise preliminar, amigável e encorajadora com base nas respostas.

    **Instruções:**
    1. Analise as respostas de forma holística. O tom deve ser positivo e acolhedor.
    2. Destaque 1 ou 2 pontos positivos nos hábitos do cliente para começar de forma encorajadora.
    3. Identifique 2 ou 3 áreas principais que poderiam ser melhoradas (por exemplo, hidratação, qualidade do sono, consumo de vegetais, estresse).
    4. NÃO forneça um plano de dieta ou conselhos médicos específicos. O objetivo é despertar o interesse para uma consulta completa, não resolver o problema aqui.
    5. Formate a resposta usando markdown para melhor legibilidade, com títulos para seções como "Pontos Positivos" e "Oportunidades de Melhoria".
    6. Termine com um parágrafo caloroso e convidativo, incentivando o cliente a agendar uma consulta com Camila Sorroche para criar um plano personalizado e detalhado. Use uma linguagem como "Este é um ótimo ponto de partida!" e "Na nossa consulta, podemos aprofundar nesses pontos e criar um plano alimentar que se encaixe perfeitamente na sua rotina e objetivos.".

    **Respostas do Questionário:**
    ${formattedAnswers}

    Por favor, gere a análise.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Ocorreu um erro ao analisar suas respostas. Por favor, tente novamente mais tarde.";
  }
};
