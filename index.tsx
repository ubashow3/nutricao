import { GoogleGenAI } from "@google/genai";

// --- Gemini Service ---
const formatAnswersForPrompt = (answers) => {
  return Object.entries(answers)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join('\n');
};

const analyzeAnswers = async (answers) => {
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

// --- App Logic ---

const questions = [
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

// State
let currentStep = 0;
let answers = {};
// FIX: Define an interface for UserData and type the userData variable to avoid property access errors on an empty object.
interface UserData {
    name: string;
    email: string;
    phone: string;
}
let userData: Partial<UserData> = {};

// DOM Elements - Declared here, assigned in init()
let pages;
let startButton;
let progressBar;
let questionText;
let questionOptionsContainer;
let prevButton;
let nextButton;
let scheduleButton;
let analysisResultContainer;
let registrationForm;
let confirmationHeading;
let confirmName;
let confirmEmail;
let confirmPhone;
let restartButton;
let errorMessageContainer;
let logoContainers;


// --- UI Functions ---

const getLogoHTML = (sizeClass = 'h-16') => {
  const imageUrl = "https://media-gru2-1.cdn.whatsapp.net/v/t61.24694-24/524985633_3240374882786562_4615594474647160550_n.jpg?ccb=11-4&oh=01_Q5Aa2wHbWo4-FkoYNWXxyGHFMFUABZ9VETSFztBTcY5jV6g9Ug&oe=691519F1&_nc_sid=5e03e0&_nc_cat=105";
  return `
    <div class="flex flex-col items-center text-center">
      <img 
        src="${imageUrl}" 
        alt="Logo Camila Sorroche" 
        class="${sizeClass} w-auto aspect-square rounded-full object-cover mb-3 shadow-md"
      />
       <div class="text-emerald-800">
            <p class="text-xl font-bold leading-tight">Camila Sorroche</p>
            <p class="text-sm font-medium text-emerald-600">Nutricionista</p>
       </div>
    </div>
  `;
};

const renderLogos = () => {
    logoContainers['home-page'].innerHTML = getLogoHTML('h-20');
    logoContainers['questionnaire-page'].innerHTML = getLogoHTML('h-16');
    logoContainers['results-page'].innerHTML = getLogoHTML('h-16');
    logoContainers['registration-page'].innerHTML = getLogoHTML('h-16');
    logoContainers['confirmation-page'].innerHTML = getLogoHTML('h-16');
};

const showPage = (pageId) => {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const pageToShow = document.getElementById(pageId);
    if (pageToShow) {
        pageToShow.classList.add('active');
    }
};

const updateProgressBar = () => {
    const percentage = ((currentStep + 1) / questions.length) * 100;
    if (progressBar) {
        progressBar.style.width = `${percentage}%`;
    }
};

const parseMarkdown = (text) => {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            if (line.startsWith('- ')) {
                return `<li class="ml-5 list-disc">${line.substring(2)}</li>`;
            }
            if (/^#{1,6}\s/.test(line)) {
                const level = line.match(/^#+/)?.[0].length || 1;
                const content = line.replace(/^#{1,6}\s/, '');
                const headingLevel = Math.min(level + 2, 6);
                const tag = `h${headingLevel}`;
                return `<${tag} class="font-semibold text-lg mt-4 mb-2 text-emerald-700">${content}</${tag}>`;
            }
            return `<p class="mb-4">${line}</p>`;
        }).join('');
};


const renderCurrentQuestion = () => {
    const question = questions[currentStep];
    questionText.textContent = question.text;
    questionOptionsContainer.innerHTML = '';
    
    if (question.type === 'radio' && question.options) {
        const optionsHtml = question.options.map(option => `
            <label class="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                    type="radio"
                    name="${question.id}"
                    value="${option}"
                    ${answers[question.id] === option ? 'checked' : ''}
                    class="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <span class="ml-4 text-gray-700 text-lg">${option}</span>
            </label>
        `).join('');
        questionOptionsContainer.innerHTML = optionsHtml;
    } else if (question.type === 'textarea') {
        questionOptionsContainer.innerHTML = `
            <textarea
                id="textarea-input"
                rows="5"
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                placeholder="Digite aqui..."
            >${answers[question.id] || ''}</textarea>
        `;
    }

    updateProgressBar();
    prevButton.disabled = currentStep === 0;
    nextButton.disabled = !answers[question.id];
    nextButton.textContent = currentStep === questions.length - 1 ? 'Ver Análise' : 'Próximo';
};

// --- Event Handlers ---

const handleAnswerChange = (e) => {
    const question = questions[currentStep];
    let value;
    const target = e.target;
    if (target.type === 'radio' || target.type === 'textarea') {
       value = target.value;
    }
    
    if (value !== undefined) {
        answers[question.id] = value;
        nextButton.disabled = !value.trim();
    }
};

const handleNextStep = async () => {
    if (currentStep < questions.length - 1) {
        currentStep++;
        renderCurrentQuestion();
    } else {
        showPage('analyzing-page');
        errorMessageContainer.classList.add('hidden');
        try {
            const result = await analyzeAnswers(answers);
            analysisResultContainer.innerHTML = parseMarkdown(result);
            showPage('results-page');
        } catch(e) {
            errorMessageContainer.textContent = 'Falha ao analisar os dados. Por favor, tente novamente.';
            errorMessageContainer.classList.remove('hidden');
            showPage('questionnaire-page');
        }
    }
};

const handlePrevStep = () => {
    if (currentStep > 0) {
        currentStep--;
        renderCurrentQuestion();
    }
};

const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    // FIX: Cast elements to HTMLInputElement to access their 'value' property.
    const nameInput = document.getElementById('name') as HTMLInputElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const phoneInput = document.getElementById('phone') as HTMLInputElement;
    
    let isValid = true;
    document.querySelectorAll('[id$="-error"]').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
     document.querySelectorAll('input').forEach(el => el.classList.remove('border-red-500'));

    if (!nameInput.value.trim()) {
        document.getElementById('name-error').textContent = 'Nome é obrigatório';
        document.getElementById('name-error').classList.remove('hidden');
        nameInput.classList.add('border-red-500');
        isValid = false;
    }
    if (!emailInput.value.trim()) {
        document.getElementById('email-error').textContent = 'E-mail é obrigatório';
        document.getElementById('email-error').classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        document.getElementById('email-error').textContent = 'Formato de e-mail inválido';
        document.getElementById('email-error').classList.remove('hidden');
        emailInput.classList.add('border-red-500');
        isValid = false;
    }
    if (!phoneInput.value.trim()) {
        document.getElementById('phone-error').textContent = 'Telefone é obrigatório';
        document.getElementById('phone-error').classList.remove('hidden');
        phoneInput.classList.add('border-red-500');
        isValid = false;
    }

    if (isValid) {
        userData = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
        };
        confirmationHeading.textContent = `Tudo certo, ${userData.name?.split(' ')[0]}!`;
        confirmName.textContent = userData.name ?? '';
        confirmEmail.textContent = userData.email ?? '';
        confirmPhone.textContent = userData.phone ?? '';
        showPage('confirmation-page');
    }
};

const handleRestart = () => {
    currentStep = 0;
    answers = {};
    userData = {};
    registrationForm.reset();
    showPage('home-page');
};

// --- Initialization ---
const init = () => {
    // Assign DOM elements now that the DOM is loaded
    pages = document.querySelectorAll('.page');
    startButton = document.getElementById('start-button');
    progressBar = document.getElementById('progress-bar');
    questionText = document.getElementById('question-text');
    questionOptionsContainer = document.getElementById('question-options');
    prevButton = document.getElementById('prev-button');
    nextButton = document.getElementById('next-button');
    scheduleButton = document.getElementById('schedule-button');
    analysisResultContainer = document.getElementById('analysis-result');
    registrationForm = document.getElementById('registration-form');
    confirmationHeading = document.getElementById('confirmation-heading');
    confirmName = document.getElementById('confirm-name');
    confirmEmail = document.getElementById('confirm-email');
    confirmPhone = document.getElementById('confirm-phone');
    restartButton = document.getElementById('restart-button');
    errorMessageContainer = document.getElementById('error-message-container');
    logoContainers = {
        'home-page': document.getElementById('logo-home'),
        'questionnaire-page': document.getElementById('logo-questionnaire'),
        'results-page': document.getElementById('logo-results'),
        'registration-page': document.getElementById('logo-registration'),
        'confirmation-page': document.getElementById('logo-confirmation'),
    };

    renderLogos();

    startButton.addEventListener('click', () => {
        showPage('questionnaire-page');
        renderCurrentQuestion();
    });

    nextButton.addEventListener('click', handleNextStep);
    prevButton.addEventListener('click', handlePrevStep);
    
    questionOptionsContainer.addEventListener('change', handleAnswerChange);
    questionOptionsContainer.addEventListener('input', handleAnswerChange);

    scheduleButton.addEventListener('click', () => showPage('registration-page'));
    registrationForm.addEventListener('submit', handleRegistrationSubmit);
    restartButton.addEventListener('click', handleRestart);

    showPage('home-page'); // Start on home page
};

// Run the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);