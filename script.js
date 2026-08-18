document.addEventListener('DOMContentLoaded', () => {

    /* --- MENÚ MÓVIL --- */
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Cerrar el menú al hacer clic en un enlace (ideal para móviles)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    /* --- NAVBAR SCROLL (Efecto Píldora Flotante) --- */
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) navbar.classList.add('scrolled');
        else navbar.classList.remove('scrolled');
    });

    /* --- MÁQUINA DE ESCRIBIR --- */
    const textToType = "Elevamos tu negocio a otro nivel fortaleciendo su presencia digital.";
    const typingContainer = document.getElementById('typewriter-text');
    let charIndex = 0;

    function typeWriter() {
        if (charIndex < textToType.length) {
            typingContainer.textContent += textToType.charAt(charIndex);
            charIndex++;
            let speed = Math.floor(Math.random() * 30) + 20;
            if (textToType.charAt(charIndex - 1) === ' ') speed += 30;
            setTimeout(typeWriter, speed);
        }
    }
    setTimeout(typeWriter, 600);

    /* --- ANIMACIONES REVEAL AL HACER SCROLL --- */
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    reveals.forEach(el => observer.observe(el));

    /* --- CARRUSEL PROYECTOS (DUPLICACIÓN DOM INFINITO) --- */
    const marqueeTrackProyectos = document.getElementById('marquee-track-proyectos');
    if (marqueeTrackProyectos) {
        marqueeTrackProyectos.innerHTML += marqueeTrackProyectos.innerHTML;
    }

    /* --- EFECTO TILT 3D PARA EL LOGO DEL MOTOR DETECH --- */
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
});