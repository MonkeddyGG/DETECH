document.addEventListener('DOMContentLoaded', () => {

    /* --- MENÚ MÓVIL --- */
    const mobileMenuBtn = document.getElementById('mobile-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

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

    /* --- NAVBAR SCROLL --- */
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

    /* --- ANIMACIONES REVEAL --- */
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

    /* --- CARRUSEL PROYECTOS (DUPLICACIÓN DOM) --- */
    const marqueeTrackProyectos = document.getElementById('marquee-track-proyectos');
    if (marqueeTrackProyectos) marqueeTrackProyectos.innerHTML += marqueeTrackProyectos.innerHTML;

    /* --- EFECTO TILT 3D PARA EL LOGO --- */
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

    /* --- FONDO ESPACIAL (ESTRELLAS + COMETA) --- */
    const canvas = document.getElementById('space-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;
        let stars = [];
        let comet = null;

        let targetMouseX = 0, targetMouseY = 0;
        let currentMouseX = 0, currentMouseY = 0;

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.getElementById('inicio').offsetHeight;

            const numStars = window.innerWidth < 768 ? 150 : 350;
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push(new Star());
            }
            comet = new Comet();
        }

        if (!isTouchDevice()) {
            document.getElementById('inicio').addEventListener('mousemove', (e) => {
                targetMouseX = (e.clientX / width) * 2 - 1;
                targetMouseY = (e.clientY / height) * 2 - 1;
            });
            document.getElementById('inicio').addEventListener('mouseleave', () => {
                targetMouseX = 0; targetMouseY = 0;
            });
        }

        window.addEventListener('resize', initCanvas);

        class Star {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.z = Math.random() * width;
                this.size = (1 - this.z / width) * 2.5;
                this.color = Math.random() > 0.8 ? '#00e5ff' : '#ffffff';
                this.opacity = Math.random();
            }
            update() {
                this.opacity += (Math.random() - 0.5) * 0.05;
                if (this.opacity < 0.1) this.opacity = 0.1;
                if (this.opacity > 1) this.opacity = 1;
            }
            draw() {
                const offsetX = currentMouseX * (width - this.z) * 0.02;
                const offsetY = currentMouseY * (width - this.z) * 0.02;
                let drawX = this.x + offsetX;
                let drawY = this.y + offsetY;

                ctx.beginPath();
                ctx.arc(drawX, drawY, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = this.opacity;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        class Comet {
            constructor() {
                this.active = false;
                this.reset();
            }
            reset() {
                this.x = width + Math.random() * 500;
                this.y = Math.random() * height * -1;
                this.length = Math.random() * 150 + 100;
                this.speed = Math.random() * 15 + 10;
                this.angle = 135 * (Math.PI / 180);
                this.active = false;
            }
            spawn() {
                this.active = true;
                this.x = width + 100;
                this.y = Math.random() * (height / 2) - 200;
            }
            update() {
                if (!this.active) {
                    if (Math.random() < 0.003) this.spawn();
                    return;
                }
                this.x += Math.cos(this.angle) * this.speed;
                this.y += Math.sin(this.angle) * this.speed;

                if (this.x < -300 || this.y > height + 300) {
                    this.reset();
                }
            }
            draw() {
                if (!this.active) return;

                const endX = this.x - Math.cos(this.angle) * this.length;
                const endY = this.y - Math.sin(this.angle) * this.length;

                const grad = ctx.createLinearGradient(this.x, this.y, endX, endY);
                grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
                grad.addColorStop(0.1, 'rgba(0, 229, 255, 0.8)');
                grad.addColorStop(1, 'rgba(0, 229, 255, 0)');

                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(endX, endY);
                ctx.strokeStyle = grad;
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#00e5ff';
                ctx.stroke();
                ctx.shadowBlur = 0;

                ctx.beginPath();
                ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
            }
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            currentMouseX += (targetMouseX - currentMouseX) * 0.05;
            currentMouseY += (targetMouseY - currentMouseY) * 0.05;

            stars.forEach(star => {
                star.update();
                star.draw();
            });

            if (comet) {
                comet.update();
                comet.draw();
            }
            requestAnimationFrame(animate);
        }

        initCanvas();
        animate();
    }

    /* --- FONDO TECNOLÓGICO DE CIRCUITOS (NUEVO PARA LA SECCIÓN PERFIL) --- */
    const techCanvas = document.getElementById('tech-canvas');
    if (techCanvas) {
        const ctxTech = techCanvas.getContext('2d');
        let techWidth, techHeight;
        let particles = [];

        function initTechCanvas() {
            const section = document.getElementById('perfil');
            techWidth = techCanvas.width = section.offsetWidth;
            techHeight = techCanvas.height = section.offsetHeight;

            // Cantidad de nodos dependiendo de la pantalla
            const numParticles = window.innerWidth < 768 ? 40 : 90;
            particles = [];
            for (let i = 0; i < numParticles; i++) {
                particles.push(new TechParticle());
            }
        }

        class TechParticle {
            constructor() {
                this.x = Math.random() * techWidth;
                this.y = Math.random() * techHeight;
                // Velocidad aleatoria flotante
                this.vx = (Math.random() - 0.5) * 0.6;
                this.vy = (Math.random() - 0.5) * 0.6;
                this.size = Math.random() * 1.5 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Rebotar en los bordes suavemente
                if (this.x < 0 || this.x > techWidth) this.vx *= -1;
                if (this.y < 0 || this.y > techHeight) this.vy *= -1;
            }
            draw() {
                ctxTech.beginPath();
                ctxTech.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctxTech.fillStyle = '#00e5ff';
                ctxTech.fill();
            }
        }

        function animateTech() {
            ctxTech.clearRect(0, 0, techWidth, techHeight);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                // Conectar nodos si están lo suficientemente cerca (Construyendo "circuitos")
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    const connectionDistance = window.innerWidth < 768 ? 90 : 130;

                    if (dist < connectionDistance) {
                        ctxTech.beginPath();
                        ctxTech.moveTo(particles[i].x, particles[i].y);
                        ctxTech.lineTo(particles[j].x, particles[j].y);
                        // Transparencia dinámica en base a la distancia (se hace más visible al acercarse)
                        const opacity = 1 - (dist / connectionDistance);
                        ctxTech.strokeStyle = `rgba(0, 229, 255, ${opacity * 0.6})`;
                        ctxTech.lineWidth = 0.5;
                        ctxTech.stroke();
                    }
                }
            }
            requestAnimationFrame(animateTech);
        }

        initTechCanvas();
        animateTech();
        window.addEventListener('resize', initTechCanvas);
    }
});