import { GoogleGenAI } from "@google/genai";

// --- Gemini API Logic ---
const API_KEY = 'AIzaSyACYVw9kqe2Q9HNyaOEQdNe_nItM5tfMm4';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const analyzeAnswers = async (answers) => {
    try {
        const prompt = `
            Você é a Camila Sorroche, uma nutricionista gentil, empática e encorajadora. 
            Analise as seguintes respostas de um pré-questionário de um potencial paciente e forneça uma análise preliminar curta e motivadora.

            Sua resposta deve seguir ESTRITAMENTE o seguinte formato:
            1.  Um título "### Pontos Positivos", seguido de um parágrafo curto e encorajador, elogiando a iniciativa da pessoa.
            2.  Um título "### Oportunidades de Melhoria", seguido por dois ou três pontos principais (usando "- " no início de cada um) sobre áreas que podem ser melhoradas, com base nas respostas.
            3.  Uma chamada para ação final, convidando a pessoa a agendar uma consulta para criar um plano personalizado. Seja calorosa e acolhedora.
            4.  Use o formato Markdown para os títulos (com ###) e para os pontos (com -).

            Respostas do Questionário:
            ${JSON.stringify(answers, null, 2)}

            Seja breve, positiva e foque em criar uma conexão, não em dar um diagnóstico completo.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        return response.text;

    } catch (error) {
        console.error("Erro ao analisar as respostas:", error);
        return `
            ### Ocorreu um Erro
            Não foi possível processar sua análise no momento. Isso pode ser devido a um problema com a chave de API ou com a conexão.
            
            Por favor, tente novamente mais tarde. Se o problema persistir, o desenvolvedor do site deve verificar a configuração da API Key.
        `;
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
let userData = {};

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
    if (!text) return '';
    let html = text
        .replace(/###\s(.*?)(?:\n|$)/g, '<h3 class="font-semibold text-lg mt-4 mb-2 text-emerald-700">$1</h3>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    const lines = html.split('\n').filter(line => line.trim() !== '');
    let listOpen = false;
    
    html = lines.map(line => {
        if (line.startsWith('- ')) {
            if (!listOpen) {
                listOpen = true;
                return `<ul class="list-disc pl-5 space-y-2">${line.replace('- ', '<li class="text-gray-700">')}</li>`;
            }
            return line.replace('- ', '<li class="text-gray-700">') + '</li>';
        } else {
            if (listOpen) {
                listOpen = false;
                return `</ul>${line.startsWith('<h3') ? line : `<p class="mb-4">${line}</p>`}`;
            }
            return line.startsWith('<h3') ? line : `<p class="mb-4">${line}</p>`;
        }
    }).join('');

    if (listOpen) {
        html += '</ul>';
    }

    return html;
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
    const target = e.target;
    let value;

    if (target && (target.type === 'radio' || target.type === 'textarea')) {
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
        const result = await analyzeAnswers(answers);
        analysisResultContainer.innerHTML = parseMarkdown(result);
        showPage('results-page');
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
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    let isValid = true;
    document.querySelectorAll('[id$="-error"]').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    document.querySelectorAll('input').forEach(el => el.classList.remove('border-red-500'));

    if (!nameInput || !nameInput.value.trim()) {
        document.getElementById('name-error').textContent = 'Nome é obrigatório';
        document.getElementById('name-error').classList.remove('hidden');
        if (nameInput) nameInput.classList.add('border-red-500');
        isValid = false;
    }
    if (!emailInput || !emailInput.value.trim()) {
        document.getElementById('email-error').textContent = 'E-mail é obrigatório';
        document.getElementById('email-error').classList.remove('hidden');
        if (emailInput) emailInput.classList.add('border-red-500');
        isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(emailInput.value)) {
        document.getElementById('email-error').textContent = 'Formato de e-mail inválido';
        document.getElementById('email-error').classList.remove('hidden');
        if (emailInput) emailInput.classList.add('border-red-500');
        isValid = false;
    }
    if (!phoneInput || !phoneInput.value.trim()) {
        document.getElementById('phone-error').textContent = 'Telefone é obrigatório';
        document.getElementById('phone-error').classList.remove('hidden');
        if (phoneInput) phoneInput.classList.add('border-red-500');
        isValid = false;
    }

    if (isValid) {
        userData = {
            name: nameInput.value,
            email: emailInput.value,
            phone: phoneInput.value,
        };
        const firstName = userData.name ? userData.name.split(' ')[0] : '';
        confirmationHeading.textContent = `Tudo certo, ${firstName}!`;
        confirmName.textContent = userData.name || '';
        confirmEmail.textContent = userData.email || '';
        confirmPhone.textContent = userData.phone || '';
        showPage('confirmation-page');
    }
};

const handleRestart = () => {
    currentStep = 0;
    answers = {};
    userData = {};
    if (registrationForm && typeof registrationForm.reset === 'function') {
        registrationForm.reset();
    }
    document.querySelectorAll('[id$="-error"]').forEach(el => {
        el.classList.add('hidden');
        el.textContent = '';
    });
    document.querySelectorAll('input').forEach(el => el.classList.remove('border-red-500'));
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