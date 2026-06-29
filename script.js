try {

    /* -----------------------------------------------
       HERO BACKGROUND — mouse tracking
    ----------------------------------------------- */
    const heroBackground = document.querySelector('.hero-background');
    if (heroBackground) {
        window.addEventListener('mousemove', e => {
            heroBackground.style.setProperty('--x', `${e.clientX}px`);
            heroBackground.style.setProperty('--y', `${e.clientY}px`);
        });
    }

    /* -----------------------------------------------
       ANIMATED SECTION BACKGROUNDS — mouse tracking
    ----------------------------------------------- */
    const initAnimatedBackgrounds = () => {
        document.querySelectorAll('.animated-background-section').forEach(section => {
            if (!section.querySelector('.animated-background')) {
                const bg = document.createElement('div');
                bg.className = 'animated-background';
                section.insertBefore(bg, section.firstChild);
            }
        });

        document.addEventListener('mousemove', e => {
            document.querySelectorAll('.animated-background').forEach(bg => {
                const rect = bg.parentElement.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                if (y > -100 && y < rect.height + 100) {
                    bg.style.setProperty('--x', `${x}px`);
                    bg.style.setProperty('--y', `${y}px`);
                }
            });
        });

        window.addEventListener('scroll', () => {
            document.querySelectorAll('.animated-background').forEach(bg => {
                const rect = bg.parentElement.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom > 0) {
                    const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
                    bg.style.setProperty('--y', `${progress * 100}%`);
                }
            });
        }, { passive: true });
    };

    initAnimatedBackgrounds();

    /* -----------------------------------------------
       MOBILE NAVIGATION DRAWER
    ----------------------------------------------- */
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.textContent = isOpen ? 'close' : 'menu';
            mobileMenuBtn.setAttribute('aria-expanded', isOpen);
        });

        // Close on link click
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').textContent = 'menu';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });

        // Close on outside click
        document.addEventListener('click', e => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').textContent = 'menu';
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            }
        });
    }

    /* -----------------------------------------------
       SMOOTH SCROLL
    ----------------------------------------------- */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.querySelector('.navbar')?.offsetHeight || 70;
                const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    /* -----------------------------------------------
       SCROLL REVEAL — all screen sizes
    ----------------------------------------------- */
    const revealElements = () => {
        // Mark elements we want to reveal
        const selectors = [
            '.stat-card',
            '.project-card',
            '.timeline-item',
            '.skill-category',
            '.achievement-card',
            '.about-card',
            '.resume-container',
            '.achievements-summary',
        ];

        document.querySelectorAll(selectors.join(',')).forEach(el => {
            el.classList.add('reveal');
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -40px 0px',
        });

        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    };

    revealElements();

    /* -----------------------------------------------
       CAROUSEL
    ----------------------------------------------- */
    const track      = document.querySelector('.carousel-track');
    const slides     = track ? Array.from(track.children) : [];
    const nextBtn    = document.querySelector('.carousel-button.next');
    const prevBtn    = document.querySelector('.carousel-button.prev');
    const dotsNav    = document.querySelector('.carousel-nav');
    const dots       = dotsNav ? Array.from(dotsNav.children) : [];
    let current      = 0;
    let autoInterval;

    if (track && slides.length && nextBtn && prevBtn && dotsNav) {
        slides.forEach((slide, i) => { slide.style.left = `${i * 100}%`; });

        const goTo = (index) => {
            track.style.transform = `translateX(-${index * 100}%)`;
            current = index;
            dots.forEach(d => d.classList.remove('active'));
            dots[index].classList.add('active');
            prevBtn.style.opacity = index === 0 ? '0.45' : '1';
            nextBtn.style.opacity = index === slides.length - 1 ? '0.45' : '1';
        };

        goTo(0);

        nextBtn.addEventListener('click', () => { goTo((current + 1) % slides.length); resetAuto(); });
        prevBtn.addEventListener('click', () => { goTo((current - 1 + slides.length) % slides.length); resetAuto(); });

        dotsNav.addEventListener('click', e => {
            const dot = e.target.closest('.carousel-indicator');
            if (!dot) return;
            goTo(dots.indexOf(dot));
            resetAuto();
        });

        // Touch swipe support
        let touchStartX = 0;
        track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 40) {
                if (diff > 0) goTo((current + 1) % slides.length);
                else          goTo((current - 1 + slides.length) % slides.length);
                resetAuto();
            }
        });

        const startAuto = () => { autoInterval = setInterval(() => goTo((current + 1) % slides.length), 5000); };
        const resetAuto = () => { clearInterval(autoInterval); startAuto(); };
        startAuto();
    }

} catch (err) {
    console.error('Portfolio script error:', err);
}
