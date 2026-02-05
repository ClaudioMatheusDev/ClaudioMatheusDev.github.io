// Smooth scroll para links âncora
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animação ao scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observar elementos para animação
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll(
        '.about-card, .project-card, .skill-tag, .section-header'
    );
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
});

// Efeito parallax suave no hero
let lastScrollTop = 0;
const heroDecoration = document.querySelector('.hero-decoration');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (heroDecoration && scrollTop < window.innerHeight) {
        const scrollPercent = scrollTop / window.innerHeight;
        heroDecoration.style.transform = `translateY(${scrollTop * 0.5}px)`;
        heroDecoration.style.opacity = 1 - scrollPercent;
    }
    
    lastScrollTop = scrollTop;
}, { passive: true });

// Adicionar classe ao rolar para baixo
let ticking = false;

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(() => {
            const scrolled = window.pageYOffset > 100;
            document.body.classList.toggle('scrolled', scrolled);
            ticking = false;
        });
        ticking = true;
    }
});

console.log('🚀 Portfólio carregado com sucesso!');
