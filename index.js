


import { GoogleGenAI } from "@google/genai";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// --- Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyBy0jI56V4mibouFl5SE7U8T43L8QWtEsQ",
    authDomain: "estacionamento-76f48.firebaseapp.com",
    projectId: "estacionamento-76f48",
    storageBucket: "estacionamento-76f48.firebasestorage.app",
    messagingSenderId: "801132134529",
    appId: "1:801132134529:web:33884badf61afcab604d80"
};

// --- Gemini API Logic ---
const API_KEY = 'AIzaSyACYVw9kqe2Q9HNyaOEQdNe_nItM5tfMm4';
const ai = new GoogleGenAI({ apiKey: API_KEY });

const analyzeAnswers = async (answers) => {
    try {
        const prompt = `
            Você é a Camila Sorroche, uma nutricionista gentil, empática e encorajadora. 
            Analise as seguintes respostas de um pré-questionário de um potencial paciente e forneça uma análise preliminar curta e motivadora.

            Sua resposta deve seguir ESTRITAMENTE o seguinte formato:
            1.  Um título "### Pontos Positivos", seguido de um paragrafo curto e encorajador, elogiando a iniciativa da pessoa.
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
let businessInfo = {};
let db; // Firebase DB instance

// Default Business Info (fallback)
const defaultInfo = {
    phone: '12997389147',
    address1: 'Av. Prof. Bernadino Querido, 761 - sala 3',
    address2: 'Itaguá, Ubatuba - SP, 11680-000',
    openTime: '09:00',
    closeTime: '18:00',
};


// DOM Elements
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
let phoneInput;
let restartButton;
let sendWhatsappButton;
let errorMessageContainer;
let statusIndicator;
// Settings Elements
let settingsButton;
let settingsModal;
let settingsForm;
let saveSettingsButton;
let cancelSettingsButton;
let settingsPhone, settingsAddress1, settingsAddress2, settingsOpen, settingsClose;
// Password Card Elements
let passwordCard;
let passwordForm;
let passwordInput;
let passwordError;
// Contact Info Elements
let contactHours, contactWhatsapp, contactWhatsappNumber, contactMaps, contactAddress1, contactAddress2;

// --- UI Functions ---

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
            <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                    type="radio"
                    name="${question.id}"
                    value="${option}"
                    ${answers[question.id] === option ? 'checked' : ''}
                    class="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300 bg-transparent"
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
                class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition bg-white text-gray-900"
                placeholder="Digite aqui..."
            >${answers[question.id] || ''}</textarea>
        `;
    }

    updateProgressBar();
    prevButton.disabled = currentStep === 0;
    nextButton.disabled = !answers[question.id];
    nextButton.textContent = currentStep === questions.length - 1 ? 'Ver Análise' : 'Próximo';
};

const updateBusinessStatus = () => {
    if (!statusIndicator || !businessInfo.openTime || !businessInfo.closeTime) return;

    const now = new Date();
    const day = now.getDay(); // Sunday = 0, Monday = 1, etc.

    const [openHour, openMinute] = businessInfo.openTime.split(':').map(Number);
    const [closeHour, closeMinute] = businessInfo.closeTime.split(':').map(Number);

    const nowTotalMinutes = now.getHours() * 60 + now.getMinutes();
    const openTotalMinutes = openHour * 60 + openMinute;
    const closeTotalMinutes = closeHour * 60 + closeMinute;

    const isOpen = day >= 1 && day <= 5 && nowTotalMinutes >= openTotalMinutes && nowTotalMinutes < closeTotalMinutes;

    if (isOpen) {
        statusIndicator.textContent = 'Aberto';
        statusIndicator.classList.add('text-green-500');
        statusIndicator.classList.remove('text-red-500');
    } else {
        statusIndicator.textContent = 'Fechado';
        statusIndicator.classList.add('text-red-500');
        statusIndicator.classList.remove('text-green-500');
    }
};

// --- Settings & Firebase Functions ---

const updateUIWithBusinessInfo = () => {
    contactHours.textContent = `Segunda a Sexta: ${businessInfo.openTime} - ${businessInfo.closeTime}`;
    const formattedPhone = `(${businessInfo.phone.substring(0, 2)}) ${businessInfo.phone.substring(2, 7)}-${businessInfo.phone.substring(7)}`;
    contactWhatsappNumber.textContent = formattedPhone;
    
    const directContactMessage = "Contato feito pelo aplicativo: Camila Sorroche\nNutricionista";
    const encodedDirectMessage = encodeURIComponent(directContactMessage);
    contactWhatsapp.href = `https://wa.me/55${businessInfo.phone}?text=${encodedDirectMessage}`;
    
    contactAddress1.textContent = businessInfo.address1;
    contactAddress2.textContent = businessInfo.address2;
    contactMaps.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessInfo.address1 + ', ' + businessInfo.address2)}`;

    settingsPhone.value = businessInfo.phone;
    settingsAddress1.value = businessInfo.address1;
    settingsAddress2.value = businessInfo.address2;
    settingsOpen.value = businessInfo.openTime;
    settingsClose.value = businessInfo.closeTime;

    updateBusinessStatus();
};


const loadBusinessInfo = async () => {
    try {
        const docRef = doc(db, "siteInfo", "contact");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            businessInfo = docSnap.data();
        } else {
            console.log("No such document! Creating one with defaults.");
            businessInfo = defaultInfo;
            await setDoc(doc(db, "siteInfo", "contact"), defaultInfo);
        }
    } catch (error) {
        console.error("Error loading info from Firebase, using defaults.", error);
        businessInfo = defaultInfo;
    }
    updateUIWithBusinessInfo();
};

const saveBusinessInfo = async (e) => {
    e.preventDefault();
    saveSettingsButton.disabled = true;
    saveSettingsButton.textContent = 'Salvando...';

    const newInfo = {
        phone: settingsPhone.value.replace(/\D/g, ''),
        address1: settingsAddress1.value,
        address2: settingsAddress2.value,
        openTime: settingsOpen.value,
        closeTime: settingsClose.value,
    };

    try {
        const docRef = doc(db, "siteInfo", "contact");
        await setDoc(docRef, newInfo);
        await loadBusinessInfo(); // Re-fetch from DB to ensure UI is in sync
        closeSettingsModal();
    } catch (error) {
        console.error("Error saving info to Firebase:", error);
        alert("Falha ao salvar as configurações. Verifique o console para mais detalhes.");
    } finally {
        saveSettingsButton.disabled = false;
        saveSettingsButton.textContent = 'Salvar';
    }
};

const openSettingsModal = () => settingsModal.classList.remove('hidden');
const closeSettingsModal = () => {
    settingsModal.classList.add('hidden');
    passwordCard.classList.add('hidden');
    passwordError.classList.add('hidden');
    passwordInput.value = '';
};

const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput.value === 'pudim') {
        passwordCard.classList.add('hidden');
        passwordInput.value = '';
        passwordError.classList.add('hidden');
        openSettingsModal();
    } else {
        passwordError.classList.remove('hidden');
        passwordInput.value = '';
    }
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

const handlePhoneInput = (e) => {
    const input = e.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-numeric
    value = value.substring(0, 11); // Limit length

    // Apply mask (##) #####-####
    if (value.length > 7) {
        value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}-${value.substring(7, 11)}`;
    } else if (value.length > 2) {
        value = `(${value.substring(0, 2)}) ${value.substring(2)}`;
    } else if (value.length > 0) {
        value = `(${value}`;
    }
    input.value = value;
};


const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('name');
    
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
    if (!phoneInput || !phoneInput.value.trim() || phoneInput.value.replace(/\D/g, '').length < 10) {
        document.getElementById('phone-error').textContent = 'Telefone inválido';
        document.getElementById('phone-error').classList.remove('hidden');
        if (phoneInput) phoneInput.classList.add('border-red-500');
        isValid = false;
    }

    if (isValid) {
        userData = {
            name: nameInput.value.trim(),
            phone: phoneInput.value,
        };
        showPage('confirmation-page');
    }
};

const handleSendWhatsapp = () => {
    const nutritionistPhone = businessInfo.phone;
    const message = `Olá, Camila! Meu nome é ${userData.name}. Preenchi o questionário no seu site e gostaria de agendar uma consulta. (Meu contato: ${userData.phone})`;
    const encodedMessage = encodeURIComponent(message);
    
    const whatsappUrl = `https://wa.me/55${nutritionistPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
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
const init = async () => {
    // Initialize Firebase
    const firebaseApp = initializeApp(firebaseConfig);
    db = getFirestore(firebaseApp);

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
    phoneInput = document.getElementById('phone');
    restartButton = document.getElementById('restart-button');
    sendWhatsappButton = document.getElementById('send-whatsapp-button');
    errorMessageContainer = document.getElementById('error-message-container');
    statusIndicator = document.getElementById('status-indicator');
    
    // Settings Elements
    settingsButton = document.getElementById('settings-button');
    settingsModal = document.getElementById('settings-modal');
    settingsForm = document.getElementById('settings-form');
    saveSettingsButton = document.getElementById('save-settings-button');
    cancelSettingsButton = document.getElementById('cancel-settings-button');
    settingsPhone = document.getElementById('settings-phone');
    settingsAddress1 = document.getElementById('settings-address1');
    settingsAddress2 = document.getElementById('settings-address2');
    settingsOpen = document.getElementById('settings-open');
    settingsClose = document.getElementById('settings-close');

    // Password Card Elements
    passwordCard = document.getElementById('password-card');
    passwordForm = document.getElementById('password-form');
    passwordInput = document.getElementById('password-input');
    passwordError = document.getElementById('password-error');

    // Contact Info Elements
    contactHours = document.getElementById('contact-hours');
    contactWhatsapp = document.getElementById('contact-whatsapp');
    contactWhatsappNumber = document.getElementById('contact-whatsapp-number');
    contactMaps = document.getElementById('contact-maps');
    contactAddress1 = document.getElementById('contact-address1');
    contactAddress2 = document.getElementById('contact-address2');
    
    // Settings Trigger
    settingsButton.addEventListener('click', () => {
        passwordCard.classList.toggle('hidden');
        if (!passwordCard.classList.contains('hidden')) {
            passwordInput.focus();
        }
    });
    passwordForm.addEventListener('submit', handlePasswordSubmit);

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
    phoneInput.addEventListener('input', handlePhoneInput);
    restartButton.addEventListener('click', handleRestart);
    sendWhatsappButton.addEventListener('click', handleSendWhatsapp);
    
    // Settings listeners
    settingsForm.addEventListener('submit', saveBusinessInfo);
    cancelSettingsButton.addEventListener('click', closeSettingsModal);
    settingsPhone.addEventListener('input', handlePhoneInput);

    // Load dynamic info and set initial business status
    await loadBusinessInfo();
    setInterval(updateBusinessStatus, 60000); // Update status every minute

    showPage('home-page'); // Start on home page
};

// Run the app when the DOM is ready
document.addEventListener('DOMContentLoaded', init);