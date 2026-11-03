(function () {
    'use strict';

    var root = document.documentElement;
    root.classList.add('js');

    // Ano no rodapé
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();

    // Tema claro/escuro
    var themeToggle = document.getElementById('theme-toggle');
    function currentTheme() {
        var set = root.getAttribute('data-theme');
        if (set) return set;
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            var next = currentTheme() === 'dark' ? 'light' : 'dark';
            root.setAttribute('data-theme', next);
            try { localStorage.setItem('theme', next); } catch (e) {}
        });
    }

    // Menu mobile
    var navToggle = document.getElementById('nav-toggle');
    var navLinks = document.getElementById('nav-links');
    function closeMenu() {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.setAttribute('aria-label', 'Abrir menu');
    }
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            var open = navLinks.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(open));
            navToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
        });
        navLinks.addEventListener('click', function (e) {
            if (e.target.closest('a')) closeMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeMenu();
        });
    }

    // Borda na navegação ao rolar
    var nav = document.querySelector('.nav');
    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Animação de entrada
    var targets = document.querySelectorAll('.section-title, .project-card, .stack-group, .highlights li');
    if ('IntersectionObserver' in window) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });
        targets.forEach(function (el) {
            el.classList.add('reveal');
            observer.observe(el);
        });
    }
})();
