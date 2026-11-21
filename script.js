function initDetechApp() {
    /* --- ASISTENTE IA DEX (SEGURO CON LÍMITE DE PREGUNTAS) --- */
    const aiToggleBtn = document.getElementById('ai-toggle-btn');
    const aiCloseBtn = document.getElementById('ai-close-btn');
    const aiChatWindow = document.getElementById('ai-chat-window');
    const aiChatForm = document.getElementById('ai-chat-form');
    const aiChatInput = document.getElementById('ai-chat-input');
    const aiSendBtn = document.getElementById('ai-send-btn');
    const aiChatMessages = document.getElementById('ai-chat-messages');
    const aiQuotaPill = document.getElementById('ai-quota-pill');
    const aiChips = document.querySelectorAll('.ai-chip');

    const aiGreetingBubble = document.getElementById('ai-greeting-bubble');
    const aiGreetingClose = document.getElementById('ai-greeting-close');

    const MAX_QUESTIONS_PER_DAY = 8;
    const STORAGE_KEY = 'detech_ai_quota_v1';
    let isWaitingResponse = false;
    let greetingDismissed = false;

    function getQuotaState() {
        const now = Date.now();
        const dayMs = 24 * 60 * 60 * 1000;
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (now - parsed.resetAt < dayMs) {
                    return parsed;
                }
            }
        } catch (_) { }
        const fresh = { used: 0, resetAt: now };
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
        } catch (_) { }
        return fresh;
    }

    function updateQuotaUI() {
        const state = getQuotaState();
        const remaining = Math.max(0, MAX_QUESTIONS_PER_DAY - state.used);
        if (aiQuotaPill) {
            aiQuotaPill.textContent = `${remaining}/${MAX_QUESTIONS_PER_DAY}`;
        }
        if (remaining === 0 && aiChatInput && aiSendBtn) {
            aiChatInput.disabled = true;
            aiSendBtn.disabled = true;
            aiChatInput.placeholder = 'Límite diario alcanzado. Escríbenos por WhatsApp.';
        }
        return remaining;
    }

    // Renderizado seguro: usa exclusivamente textContent para evitar XSS
    function appendSafeMessage(text, sender) {
        if (!aiChatMessages) return null;
        const msgDiv = document.createElement('div');
        msgDiv.className = `ai-msg ${sender}`;
        msgDiv.textContent = text;
        aiChatMessages.appendChild(msgDiv);
        aiChatMessages.scrollTop = aiChatMessages.scrollHeight;
        return msgDiv;
    }

    function openDexChat() {
        if (!aiChatWindow) return;
        aiChatWindow.classList.remove('hidden');
        if (aiGreetingBubble) {
            aiGreetingBubble.classList.add('hidden');
            greetingDismissed = true;
        }
        if (aiChatInput && !aiChatInput.disabled) {
            aiChatInput.focus();
        }
    }

    async function sendToDetechAI(rawMessage) {
        const cleanText = rawMessage.trim().slice(0, 300);
        if (!cleanText || isWaitingResponse) return;

        const remaining = updateQuotaUI();
        if (remaining <= 0) {
            appendSafeMessage('Has alcanzado el límite de 8 consultas gratuitas por hoy. Contáctanos directo al WhatsApp 55 7421 1364 para atención personalizada.', 'bot');
            return;
        }

        appendSafeMessage(cleanText, 'user');
        if (aiChatInput) aiChatInput.value = '';

        isWaitingResponse = true;
        if (aiSendBtn) aiSendBtn.disabled = true;
        const typingNode = appendSafeMessage('DEX está escribiendo...', 'bot typing');

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: cleanText })
            });

            const data = await response.json();
            if (typingNode) typingNode.remove();

            if (!response.ok) {
                appendSafeMessage(data.error || 'No se pudo procesar tu consulta en este momento.', 'bot');
            } else {
                const state = getQuotaState();
                state.used += 1;
                try {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                } catch (_) { }
                updateQuotaUI();
                appendSafeMessage(data.reply, 'bot');
            }
        } catch (err) {
            if (typingNode) typingNode.remove();
            appendSafeMessage('Error de conexión. También puedes escribirnos al 55 7421 1364 o contactosdetech@gmail.com.', 'bot');
        } finally {
            isWaitingResponse = false;
            if (updateQuotaUI() > 0 && aiSendBtn) {
                aiSendBtn.disabled = false;
            }
        }
    }

    if (aiToggleBtn && aiChatWindow) {
        updateQuotaUI();

        // Mostrar globo corto de saludo tras 1.8s sin estorbar
        setTimeout(() => {
            if (!greetingDismissed && aiChatWindow.classList.contains('hidden') && aiGreetingBubble) {
                aiGreetingBubble.classList.remove('hidden');
            }
        }, 1800);

        aiToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (aiChatWindow.classList.contains('hidden')) {
                openDexChat();
            } else {
                aiChatWindow.classList.add('hidden');
            }
        });
    }

    if (aiGreetingBubble) {
        aiGreetingBubble.addEventListener('click', (e) => {
            if (e.target === aiGreetingClose) return;
            openDexChat();
        });
    }

    if (aiGreetingClose && aiGreetingBubble) {
        aiGreetingClose.addEventListener('click', (e) => {
            e.stopPropagation();
            aiGreetingBubble.classList.add('hidden');
            greetingDismissed = true;
        });
    }

    if (aiCloseBtn && aiChatWindow) {
        aiCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            aiChatWindow.classList.add('hidden');
        });
    }

    if (aiChatForm && aiChatInput) {
        aiChatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendToDetechAI(aiChatInput.value);
        });
    }

    aiChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt');
            if (prompt) sendToDetechAI(prompt);
        });
    });

    /* --- MENÚ MÓVIL --- */
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    /* --- NAVBAR SCROLL (Efecto Píldora Flotante) --- */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 40) navbar.classList.add('scrolled');
            else navbar.classList.remove('scrolled');
        });
    }

    /* --- MÁQUINA DE ESCRIBIR --- */
    const textToType = "Elevamos tu negocio a otro nivel fortaleciendo su presencia digital.";
    const typingContainer = document.getElementById('typewriter-text');
    let charIndex = 0;

    function typeWriter() {
        if (typingContainer && charIndex < textToType.length) {
            typingContainer.textContent += textToType.charAt(charIndex);
            charIndex++;
            let speed = Math.floor(Math.random() * 30) + 20;
            if (textToType.charAt(charIndex - 1) === ' ') speed += 30;
            setTimeout(typeWriter, speed);
        }
    }
    setTimeout(typeWriter, 500);

    /* --- ANIMACIONES REVEAL AL HACER SCROLL --- */
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach(el => observer.observe(el));

    /* --- CARRUSEL PROYECTOS (DUPLICACIÓN DOM INFINITO) --- */
    const marqueeTrackProyectos = document.getElementById('marquee-track-proyectos');
    if (marqueeTrackProyectos) {
        marqueeTrackProyectos.innerHTML += marqueeTrackProyectos.innerHTML;
    }

    /* --- FAQ ACORDEÓN INTERACTIVO --- */
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');

        if (questionBtn && answer) {
            questionBtn.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');

                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAns = otherItem.querySelector('.faq-answer');
                    if (otherAns) otherAns.style.maxHeight = null;
                });

                if (!isOpen) {
                    item.classList.add('active');
                    answer.style.maxHeight = answer.scrollHeight + "px";
                }
            });
        }
    });

    /* --- EFECTO TILT 3D PARA EL LOGO DETECH --- */
    const interactiveLogo = document.getElementById('interactive-logo');
    const isTouchDevice = () => ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (interactiveLogo && !isTouchDevice()) {
        interactiveLogo.addEventListener('mousemove', (e) => {
            const rect = interactiveLogo.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -15;
            const rotateY = ((x - centerX) / centerX) * 15;

            interactiveLogo.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
        });

        interactiveLogo.addEventListener('mouseleave', () => {
            interactiveLogo.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDetechApp);
} else {
    initDetechApp();
}