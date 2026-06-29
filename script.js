try {

    /* -----------------------------------------------
       API PLAYGROUND TAB SWITCHING
    ----------------------------------------------- */
    const apiBtns = document.querySelectorAll('.api-btn');
    const apiTabs = document.querySelectorAll('.api-tab-content');
    const statusPill = document.querySelector('.window-status-pill');

    if (apiBtns.length && apiTabs.length) {
        apiBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetTab = btn.getAttribute('data-tab');
                
                // Toggle active buttons
                apiBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Toggle active content pane
                apiTabs.forEach(tab => {
                    tab.classList.remove('active');
                    if (tab.id === `tab-${targetTab}`) {
                        tab.classList.add('active');
                    }
                });

                // Flash status code on change
                if (statusPill) {
                    statusPill.textContent = 'status: 200 OK';
                    statusPill.style.background = '#d1fae5';
                    statusPill.style.color = '#065f46';
                }
            });
        });
    }

    /* -----------------------------------------------
       HERO BACKGROUND — Interactive Gravity Grid Canvas
    ----------------------------------------------- */
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let mouse = { x: null, y: null, radius: 200 };
        let gridSpacing = 45; // space between grid lines
        let time = 0;
        let sparks = [];

        // ReactBits ClickSpark Configuration Props
        const sparkColor = '#8b5cf6'; // Theme-matching purple
        const sparkSize = 10;
        const sparkRadius = 15;
        const sparkCount = 8;
        const duration = 400;
        const easing = 'ease-out';
        const extraScale = 1.0;

        const easeFunc = (t) => {
            switch (easing) {
                case 'linear':
                    return t;
                case 'ease-in':
                    return t * t;
                case 'ease-in-out':
                    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
                default: // 'ease-out'
                    return t * (2 - t);
            }
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const cols = Math.ceil(canvas.width / gridSpacing) + 1;
            const rows = Math.ceil(canvas.height / gridSpacing) + 1;
            
            let nodes = [];

            // Calculate grid nodes with distortion
            for (let r = 0; r < rows; r++) {
                nodes[r] = [];
                for (let c = 0; c < cols; c++) {
                    const origX = c * gridSpacing;
                    const origY = r * gridSpacing;
                    
                    let x = origX;
                    let y = origY;
                    
                    // Faint breathing wave animation
                    const waveX = Math.sin(time * 0.02 + origY * 0.005) * 4;
                    const waveY = Math.cos(time * 0.02 + origX * 0.005) * 4;
                    x += waveX;
                    y += waveY;

                    // Mouse distortion (fixed coords since canvas is full screen)
                    if (mouse.x !== null && mouse.y !== null) {
                        const dx = x - mouse.x;
                        const dy = y - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        
                        if (dist < mouse.radius) {
                            const force = (mouse.radius - dist) / mouse.radius;
                            const angle = Math.atan2(dy, dx);
                            const intensity = force * force * 35; 
                            x += Math.cos(angle) * intensity;
                            y += Math.sin(angle) * intensity;
                        }
                    }

                    nodes[r][c] = { x, y };
                }
            }

            // Draw Horizontal Lines
            for (let r = 0; r < rows; r++) {
                ctx.beginPath();
                ctx.moveTo(nodes[r][0].x, nodes[r][0].y);
                for (let c = 1; c < cols; c++) {
                    ctx.lineTo(nodes[r][c].x, nodes[r][c].y);
                }
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.16)'; // Defined violet
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            // Draw Vertical Lines
            for (let c = 0; c < cols; c++) {
                ctx.beginPath();
                ctx.moveTo(nodes[0][c].x, nodes[0][c].y);
                for (let r = 1; r < rows; r++) {
                    ctx.lineTo(nodes[r][c].x, nodes[r][c].y);
                }
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.16)'; // Defined indigo
                ctx.lineWidth = 1.2;
                ctx.stroke();
            }

            // Draw faint highlight points close to the mouse
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const node = nodes[r][c];
                    if (mouse.x !== null && mouse.y !== null) {
                        const dx = node.x - mouse.x;
                        const dy = node.y - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mouse.radius) {
                            const alpha = (1 - (dist / mouse.radius)) * 0.65;
                            ctx.beginPath();
                            ctx.arc(node.x, node.y, 2.5, 0, Math.PI * 2);
                            ctx.fillStyle = `rgba(139, 92, 246, ${alpha})`;
                            ctx.fill();
                        }
                    }
                }
            }
        };

        const animate = () => {
            time++;
            drawGrid();

            // Render ReactBits ClickSpark animation frame
            const now = performance.now();
            sparks = sparks.filter(spark => {
                const elapsed = now - spark.startTime;
                if (elapsed >= duration) {
                    return false;
                }

                const progress = elapsed / duration;
                const eased = easeFunc(progress);

                const distance = eased * sparkRadius * extraScale;
                const lineLength = sparkSize * (1 - eased);

                const x1 = spark.x + distance * Math.cos(spark.angle);
                const y1 = spark.y + distance * Math.sin(spark.angle);
                const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
                const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);

                ctx.strokeStyle = sparkColor;
                ctx.lineWidth = 2.5;
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                return true;
            });

            requestAnimationFrame(animate);
        };

        window.addEventListener('resize', () => {
            resizeCanvas();
            drawGrid();
        });
        
        window.addEventListener('mousemove', e => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.addEventListener('click', e => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const now = performance.now();
            const newSparks = Array.from({ length: sparkCount }, (_, i) => ({
                x,
                y,
                angle: (2 * Math.PI * i) / sparkCount,
                startTime: now
            }));

            sparks.push(...newSparks);
        });

        resizeCanvas();
        animate();
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

    /* -----------------------------------------------
       TARGET CURSOR (ReactBits)
    ----------------------------------------------- */
    const initTargetCursor = () => {
        const isMobile = () => {
            const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const isSmallScreen = window.innerWidth <= 768;
            const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
            return (hasTouchScreen && isSmallScreen) || mobileRegex.test(navigator.userAgent.toLowerCase());
        };

        if (isMobile()) {
            const cursorEl = document.querySelector('.target-cursor-wrapper');
            if (cursorEl) cursorEl.style.display = 'none';
            return;
        }

        // Add target class dynamically to links, buttons, cards, and cubes grid
        document.querySelectorAll('a, button, [role="button"], .project-card, .contact-link, .api-btn, .carousel-indicator, #cubes-wrapper').forEach(el => {
            el.classList.add('cursor-target');
        });

        const cursor = document.querySelector('.target-cursor-wrapper');
        if (!cursor) return;

        const dot = cursor.querySelector('.target-cursor-dot');
        const corners = cursor.querySelectorAll('.target-cursor-corner');

        const targetSelector = '.cursor-target';
        const spinDuration = 2;
        const hoverDuration = 0.2;
        const parallaxOn = true;
        const cursorColor = '#ffffff';
        const cursorColorOnTarget = '#B497CF';

        const borderWidth = 3;
        const cornerSize = 12;

        let activeTarget = null;
        let currentLeaveHandler = null;
        let resumeTimeout = null;
        let targetCornerPositions = null;
        let activeStrength = { current: 0 };

        const getContainingBlock = element => {
            let node = element?.parentElement;
            while (node && node !== document.documentElement) {
                const style = getComputedStyle(node);
                if (
                    style.transform !== 'none' ||
                    style.perspective !== 'none' ||
                    style.filter !== 'none' ||
                    style.willChange.includes('transform') ||
                    style.willChange.includes('perspective') ||
                    style.willChange.includes('filter') ||
                    /paint|layout|strict|content/.test(style.contain)
                ) {
                    return node;
                }
                node = node.parentElement;
            }
            return null;
        };

        const getContainingBlockOffset = block => {
            if (!block) return { x: 0, y: 0 };
            const rect = block.getBoundingClientRect();
            return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
        };

        let containingBlock = getContainingBlock(cursor);
        const getOffset = () => getContainingBlockOffset(containingBlock);

        const initialOffset = getOffset();
        gsap.set(cursor, {
            xPercent: -50,
            yPercent: -50,
            x: window.innerWidth / 2 - initialOffset.x,
            y: window.innerHeight / 2 - initialOffset.y
        });

        let spinTl = gsap.timeline({ repeat: -1 })
            .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });

        const moveCursor = (x, y) => {
            const { x: offsetX, y: offsetY } = getOffset();
            gsap.to(cursor, {
                x: x - offsetX,
                y: y - offsetY,
                duration: 0.1,
                ease: 'power3.out'
            });
        };

        window.addEventListener('mousemove', e => moveCursor(e.clientX, e.clientY));

        const tickerFn = () => {
            if (!targetCornerPositions || !cursor || !corners.length) return;
            const strength = activeStrength.current;
            if (strength === 0) return;

            const cursorX = gsap.getProperty(cursor, 'x');
            const cursorY = gsap.getProperty(cursor, 'y');

            const cornersArr = Array.from(corners);
            cornersArr.forEach((corner, i) => {
                const currentX = gsap.getProperty(corner, 'x');
                const currentY = gsap.getProperty(corner, 'y');

                const targetX = targetCornerPositions[i].x - cursorX;
                const targetY = targetCornerPositions[i].y - cursorY;

                const finalX = currentX + (targetX - currentX) * strength;
                const finalY = currentY + (targetY - currentY) * strength;

                const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

                gsap.to(corner, {
                    x: finalX,
                    y: finalY,
                    duration: duration,
                    ease: duration === 0 ? 'none' : 'power1.out',
                    overwrite: 'auto'
                });
            });
        };

        window.addEventListener('scroll', () => {
            if (!activeTarget) return;
            const { x: offsetX, y: offsetY } = getOffset();
            const mouseX = gsap.getProperty(cursor, 'x') + offsetX;
            const mouseY = gsap.getProperty(cursor, 'y') + offsetY;
            const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
            const isStillOverTarget =
                elementUnderMouse &&
                (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
            if (!isStillOverTarget && currentLeaveHandler) {
                currentLeaveHandler();
            }
        }, { passive: true });

        window.addEventListener('mousedown', () => {
            if (dot) gsap.to(dot, { scale: 0.7, duration: 0.3 });
            gsap.to(cursor, { scale: 0.9, duration: 0.2 });
        });

        window.addEventListener('mouseup', () => {
            if (dot) gsap.to(dot, { scale: 1, duration: 0.3 });
            gsap.to(cursor, { scale: 1, duration: 0.2 });
        });

        const enterHandler = e => {
            const directTarget = e.target;
            const allTargets = [];
            let current = directTarget;
            while (current && current !== document.body) {
                if (current.matches(targetSelector)) {
                    allTargets.push(current);
                }
                current = current.parentElement;
            }
            const target = allTargets[0] || null;
            if (!target || !cursor || !corners.length) return;
            if (activeTarget === target) return;

            if (activeTarget && currentLeaveHandler) {
                currentLeaveHandler();
            }
            if (resumeTimeout) {
                clearTimeout(resumeTimeout);
                resumeTimeout = null;
            }

            activeTarget = target;
            const cornersArr = Array.from(corners);
            cornersArr.forEach(corner => gsap.killTweensOf(corner, 'x,y'));

            gsap.killTweensOf(cursor, 'rotation');
            if (spinTl) spinTl.pause();
            gsap.set(cursor, { rotation: 0 });

            const targetDotColor = (target.id === 'cubes-wrapper' || target.closest('#cubes-wrapper')) ? '#ffffff' : '#8b5cf6';
            if (cursorColorOnTarget) {
                gsap.to(cornersArr, {
                    borderColor: cursorColorOnTarget,
                    duration: 0.15,
                    ease: 'power2.out'
                });
                if (dot) {
                    gsap.to(dot, {
                        backgroundColor: targetDotColor,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                }
            }

            const rect = target.getBoundingClientRect();
            const { x: offsetX, y: offsetY } = getOffset();
            const cursorX = gsap.getProperty(cursor, 'x');
            const cursorY = gsap.getProperty(cursor, 'y');

            targetCornerPositions = [
                { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
                { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
                { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
                { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
            ];

            gsap.ticker.add(tickerFn);

            gsap.to(activeStrength, {
                current: 1,
                duration: hoverDuration,
                ease: 'power2.out'
            });

            cornersArr.forEach((corner, i) => {
                gsap.to(corner, {
                    x: targetCornerPositions[i].x - cursorX,
                    y: targetCornerPositions[i].y - cursorY,
                    duration: 0.2,
                    ease: 'power2.out'
                });
            });

            const leaveHandler = () => {
                gsap.ticker.remove(tickerFn);
                targetCornerPositions = null;
                gsap.set(activeStrength, { current: 0, overwrite: true });
                activeTarget = null;

                if (cursorColorOnTarget && corners.length) {
                    gsap.to(cornersArr, {
                        borderColor: cursorColor,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                    if (dot) {
                        gsap.to(dot, {
                            backgroundColor: '#8b5cf6',
                            duration: 0.15,
                            ease: 'power2.out'
                        });
                    }
                }

                if (corners.length) {
                    gsap.killTweensOf(cornersArr, 'x,y');
                    const positions = [
                        { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
                        { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
                        { x: cornerSize * 0.5, y: cornerSize * 0.5 },
                        { x: -cornerSize * 1.5, y: cornerSize * 0.5 }
                    ];
                    const tl = gsap.timeline();
                    cornersArr.forEach((corner, index) => {
                        tl.to(corner, {
                            x: positions[index].x,
                            y: positions[index].y,
                            duration: 0.3,
                            ease: 'power3.out'
                        }, 0);
                    });
                }

                resumeTimeout = setTimeout(() => {
                    if (!activeTarget && cursor && spinTl) {
                        const currentRotation = gsap.getProperty(cursor, 'rotation');
                        const normalizedRotation = currentRotation % 360;
                        spinTl.kill();
                        spinTl = gsap.timeline({ repeat: -1 })
                            .to(cursor, { rotation: '+=360', duration: spinDuration, ease: 'none' });
                        gsap.to(cursor, {
                            rotation: normalizedRotation + 360,
                            duration: spinDuration * (1 - normalizedRotation / 360),
                            ease: 'none',
                            onComplete: () => {
                                spinTl.restart();
                            }
                        });
                    }
                    resumeTimeout = null;
                }, 50);

                target.removeEventListener('mouseleave', leaveHandler);
            };

            currentLeaveHandler = leaveHandler;
            target.addEventListener('mouseleave', leaveHandler);
        };

        window.addEventListener('mouseover', enterHandler, { passive: true });
        window.addEventListener('resize', () => {
            containingBlock = getContainingBlock(cursor);
        });
    };

    initTargetCursor();

    /* -----------------------------------------------
       3D CUBES TECH STACK GRID (ReactBits)
    ----------------------------------------------- */
    const initCubes = () => {
        const scene = document.getElementById('cubes-scene');
        if (!scene) return;

        const TECH_ITEMS = [
            { slug: 'python', name: 'Python', category: 'language' },
            { slug: 'dart', name: 'Dart', category: 'language' },
            { slug: 'c', name: 'C', category: 'language' },
            { slug: 'javascript', name: 'JavaScript', category: 'language' },
            { slug: 'gnubash', name: 'Bash', category: 'language' },
            { slug: 'markdown', name: 'Markdown', category: 'language' },
            { slug: 'django', name: 'Django', category: 'backend' },
            { slug: 'postman', name: 'Django REST (API)', category: 'backend' },
            { slug: 'celery', name: 'Celery', category: 'backend' },
            { slug: 'springboot', name: 'Spring Boot', category: 'backend' },
            { slug: 'jsonwebtokens', name: 'JWT', category: 'backend' },
            { slug: 'json', name: 'JSON', category: 'backend' },
            { slug: 'flutter', name: 'Flutter', category: 'frontend' },
            { slug: 'html5', name: 'HTML5', category: 'frontend' },
            { slug: 'css', name: 'CSS3', category: 'frontend' },
            { slug: 'firebase', name: 'Firebase', category: 'frontend' },
            { slug: 'postgresql', name: 'PostgreSQL', category: 'database' },
            { slug: 'mysql', name: 'MySQL', category: 'database' },
            { slug: 'redis', name: 'Redis', category: 'database' },
            { slug: 'docker', name: 'Docker', category: 'tools' },
            { slug: 'cloudflare', name: 'Cloudflare R2', category: 'tools' },
            { slug: 'opencv', name: 'OpenCV', category: 'tools' },
            { slug: 'numpy', name: 'NumPy', category: 'tools' },
            { slug: 'pandas', name: 'Pandas', category: 'tools' },
            { slug: 'letsencrypt', name: 'Cryptography', category: 'tools' },
            { slug: 'microsoftexcel', name: 'Excel Sheets', category: 'tools' },
            { slug: 'githubcopilot', name: 'GitHub Copilot', category: 'tools' },
            { slug: 'ollama', name: 'Ollama', category: 'tools' },
            { slug: 'git', name: 'Git', category: 'tools' },
            { slug: 'github', name: 'GitHub', category: 'tools' },
            { slug: 'linux', name: 'Linux', category: 'tools' },
            { slug: '', name: '', category: 'filler' },
            { slug: '', name: '', category: 'filler' },
            { slug: '', name: '', category: 'filler' },
            { slug: '', name: '', category: 'filler' },
            { slug: '', name: '', category: 'filler' },
        ];

        const CATEGORY_COLORS = {
            language: { border: '#a78bfa', ripple: '#c4b5fd', face: '#2b2244' },
            backend:  { border: '#c084fc', ripple: '#e879f9', face: '#362146' },
            frontend: { border: '#818cf8', ripple: '#a5b4fc', face: '#212646' },
            database: { border: '#f472b6', ripple: '#fbcfe8', face: '#3c2132' },
            tools:    { border: '#38bdf8', ripple: '#7dd3fc', face: '#1e2c3a' },
            filler:   { border: '#3b334a', ripple: '#a78bfa', face: '#1c1827' },
        };

        const gridSize = 6;
        const maxAngle = 45;
        const radius = 3;
        const enterDur = 0.3;
        const leaveDur = 0.6;
        const easing = 'power3.out';
        const autoAnimate = true;
        const rippleOnClick = true;
        const rippleSpeed = 1.5;

        scene.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
        scene.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
        scene.innerHTML = '';

        for (let i = 0; i < gridSize * gridSize; i++) {
            const tech = TECH_ITEMS[i] || { slug: '', name: '', category: 'filler' };
            const colors = CATEGORY_COLORS[tech.category] || CATEGORY_COLORS.filler;
            const r = Math.floor(i / gridSize);
            const c = i % gridSize;
            const cube = document.createElement('div');
            cube.className = 'cube';
            cube.dataset.row = r;
            cube.dataset.col = c;
            cube.dataset.tech = tech.name;
            cube.dataset.category = tech.category;
            ['top', 'bottom', 'left', 'right', 'front', 'back'].forEach(face => {
                const faceDiv = document.createElement('div');
                faceDiv.className = `cube-face cube-face--${face}`;
                faceDiv.style.background = colors.face;
                faceDiv.dataset.bg = colors.face;
                faceDiv.style.border = `1.5px solid ${colors.border}`;
                const img = document.createElement('img');
                img.className = 'cube-icon';
                const origSrc = tech.slug ? `https://cdn.simpleicons.org/${tech.slug}/fff` : '';
                img.dataset.origSrc = origSrc;
                if (origSrc) { img.src = origSrc; img.style.opacity = '0.85'; } else { img.style.opacity = '0'; }
                faceDiv.appendChild(img);
                cube.appendChild(faceDiv);
            });
            scene.appendChild(cube);
        }

        let raf = null;
        let idleTimer = null;
        let userActive = false;
        let simPos = { x: Math.random() * gridSize, y: Math.random() * gridSize };
        let simTarget = { x: Math.random() * gridSize, y: Math.random() * gridSize };
        let simRAF = null;

        const tiltAt = (rowCenter, colCenter) => {
            scene.querySelectorAll('.cube').forEach(cube => {
                const r = +cube.dataset.row;
                const c = +cube.dataset.col;
                const dist = Math.hypot(r - rowCenter, c - colCenter);
                if (dist <= radius) {
                    const pct = 1 - dist / radius;
                    const angle = pct * maxAngle;
                    gsap.to(cube, { duration: enterDur, ease: easing, overwrite: true, rotateX: -angle, rotateY: angle });
                } else {
                    gsap.to(cube, { duration: leaveDur, ease: 'power3.out', overwrite: true, rotateX: 0, rotateY: 0 });
                }
            });
        };

        const resetAll = () => {
            scene.querySelectorAll('.cube').forEach(cube => {
                gsap.to(cube, { duration: leaveDur, rotateX: 0, rotateY: 0, ease: 'power3.out', overwrite: true });
            });
        };

        const marquee = document.getElementById('skills-marquee');
        let itemPositions = [];
        let oneSetWidth = 0;

        const cacheItemPositions = () => {
            if (!marquee) return;
            itemPositions = [];
            // Only cache items in the middle set (second set of 3)
            const allItems = marquee.querySelectorAll('.marquee-item');
            const setSize = allItems.length / 3;
            const midStart = Math.floor(setSize);
            const midEnd = midStart + setSize;
            allItems.forEach((item, i) => {
                if (i >= midStart && i < midEnd) {
                    itemPositions.push({ el: item, left: item.offsetLeft, width: item.offsetWidth });
                }
            });
        };

        const updateLayout = () => {
            if (!marquee) return;
            const containerWidth = marquee.clientWidth;
            const scrollLeft = marquee.scrollLeft;
            const containerCenterX = scrollLeft + containerWidth / 2;
            let closestEl = null;
            let minDistance = Infinity;

            // check all visible items across all 3 sets
            marquee.querySelectorAll('.marquee-item').forEach(el => {
                const dx = (el.offsetLeft + el.offsetWidth / 2) - containerCenterX;
                const dist = Math.abs(dx);
                el.style.opacity = Math.max(0.35, 1 - dist / (containerWidth * 0.4));
                if (dist < minDistance) {
                    minDistance = dist;
                    closestEl = el;
                }
            });

            marquee.querySelectorAll('.marquee-item').forEach(el => {
                if (el === closestEl) el.classList.add('active-highlight');
                else el.classList.remove('active-highlight');
            });

            // Infinite loop: teleport when near the edges
            if (oneSetWidth > 0) {
                if (scrollLeft < oneSetWidth * 0.5) {
                    marquee.scrollLeft += oneSetWidth;
                } else if (scrollLeft > oneSetWidth * 2.5) {
                    marquee.scrollLeft -= oneSetWidth;
                }
            }
        };

        if (marquee) {
            marquee.innerHTML = '';
            const track = document.createElement('div');
            track.className = 'marquee-track';

            const techsWithSlug = TECH_ITEMS.filter(t => t.slug && t.name);

            // Build 3 copies for infinite illusion
            [0, 1, 2].forEach(copyIdx => {
                techsWithSlug.forEach(tech => {
                    const item = document.createElement('div');
                    item.className = 'marquee-item';
                    item.dataset.tech = tech.name;
                    item.dataset.copy = copyIdx;
                    item.textContent = tech.name;
                    // Only middle copy items trigger ripple to avoid confusion
                    if (copyIdx === 1) {
                        item.addEventListener('click', () => {
                            const idx = TECH_ITEMS.findIndex(t => t.name === tech.name);
                            if (idx !== -1) triggerRippleAt(Math.floor(idx / gridSize), idx % gridSize);
                        });
                    } else {
                        item.addEventListener('click', () => {
                            const idx = TECH_ITEMS.findIndex(t => t.name === tech.name);
                            if (idx !== -1) triggerRippleAt(Math.floor(idx / gridSize), idx % gridSize);
                        });
                    }
                    track.appendChild(item);
                });
            });

            marquee.appendChild(track);

            requestAnimationFrame(() => {
                // Measure one set width (first set of items)
                const allItems = marquee.querySelectorAll('.marquee-item');
                const setSize = allItems.length / 3;
                if (setSize > 0) {
                    const firstItem = allItems[0];
                    const lastFirstSetItem = allItems[setSize - 1];
                    oneSetWidth = (lastFirstSetItem.offsetLeft + lastFirstSetItem.offsetWidth) - firstItem.offsetLeft;
                    // Start scrolled to the middle set
                    marquee.scrollLeft = oneSetWidth;
                }
                cacheItemPositions();
                updateLayout();
            });

            window.addEventListener('resize', () => {
                const allItems = marquee.querySelectorAll('.marquee-item');
                const setSize = allItems.length / 3;
                if (setSize > 0) {
                    const firstItem = allItems[0];
                    const lastFirstSetItem = allItems[setSize - 1];
                    oneSetWidth = (lastFirstSetItem.offsetLeft + lastFirstSetItem.offsetWidth) - firstItem.offsetLeft;
                }
                cacheItemPositions();
                updateLayout();
            });
            marquee.addEventListener('scroll', updateLayout, { passive: true });
        }


        const scrollMarqueeTo = (rowHit, colHit) => {
            if (!marquee) return;
            const idx = Math.floor(rowHit) * gridSize + Math.floor(colHit);
            const tech = TECH_ITEMS[Math.min(idx, TECH_ITEMS.length - 1)];
            if (!tech || !tech.slug || !tech.name) return;
            const allCopies = Array.from(marquee.querySelectorAll(`.marquee-item[data-tech="${tech.name}"]`));
            if (allCopies.length === 0) return;
            const currentCenter = marquee.scrollLeft + marquee.clientWidth / 2;
            let bestItem = allCopies[0];
            let bestDist = Infinity;
            allCopies.forEach(item => {
                const itemCenter = item.offsetLeft + item.offsetWidth / 2;
                const d = Math.abs(itemCenter - currentCenter);
                if (d < bestDist) { bestDist = d; bestItem = item; }
            });
            const targetScroll = bestItem.offsetLeft + bestItem.offsetWidth / 2 - marquee.clientWidth / 2;
            gsap.to(marquee, { scrollLeft: targetScroll, duration: 0.4, ease: 'power2.out', overwrite: true, onUpdate: updateLayout });
        };

        const onPointerMove = e => {
            userActive = true;
            if (idleTimer) clearTimeout(idleTimer);
            const rect = scene.getBoundingClientRect();
            const colCenter = (e.clientX - rect.left) / (rect.width / gridSize);
            const rowCenter = (e.clientY - rect.top) / (rect.height / gridSize);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
            // Smoothly scroll marquee to match the hovered cube
            scrollMarqueeTo(rowCenter, colCenter);
            idleTimer = setTimeout(() => { userActive = false; }, 3000);
        };

        const onTouchMove = e => {
            e.preventDefault();
            userActive = true;
            if (idleTimer) clearTimeout(idleTimer);
            const rect = scene.getBoundingClientRect();
            const colCenter = (e.touches[0].clientX - rect.left) / (rect.width / gridSize);
            const rowCenter = (e.touches[0].clientY - rect.top) / (rect.height / gridSize);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
            idleTimer = setTimeout(() => { userActive = false; }, 3000);
        };

        const triggerRippleAt = (rowHit, colHit) => {
            const idx = rowHit * gridSize + colHit;
            const clickedTech = TECH_ITEMS[idx];
            if (!clickedTech) return;
            // Marquee already follows hover; on click just snap it crisply
            if (marquee && clickedTech.slug) {
                scrollMarqueeTo(rowHit, colHit);
            }
            const rippleColor = CATEGORY_COLORS[clickedTech.category]?.ripple || '#ffffff';
            const clickedIconUrl = clickedTech.slug ? `https://cdn.simpleicons.org/${clickedTech.slug}/fff` : '';
            const rings = {};
            scene.querySelectorAll('.cube').forEach(cube => {
                const ring = Math.round(Math.hypot(+cube.dataset.row - rowHit, +cube.dataset.col - colHit));
                if (!rings[ring]) rings[ring] = [];
                rings[ring].push(cube);
            });
            Object.keys(rings).map(Number).sort((a, b) => a - b).forEach(ring => {
                const delay = ring * (0.15 / rippleSpeed);
                const faces = rings[ring].flatMap(cube => Array.from(cube.querySelectorAll('.cube-face')));
                gsap.to(faces, { backgroundColor: rippleColor, duration: 0.3 / rippleSpeed, delay, ease: 'power3.out', overwrite: true, onStart: () => {
                    if (clickedIconUrl) rings[ring].forEach(c => c.querySelectorAll('.cube-icon').forEach(img => { img.src = clickedIconUrl; img.style.opacity = '0.9'; }));
                }});
                gsap.to(faces, { backgroundColor: (i, el) => el.dataset.bg, duration: 0.3 / rippleSpeed, delay: delay + (0.3 / rippleSpeed) + (0.6 / rippleSpeed), ease: 'power3.out', overwrite: false, onStart: () => {
                    rings[ring].forEach(c => c.querySelectorAll('.cube-icon').forEach(img => { img.src = img.dataset.origSrc || ''; img.style.opacity = img.dataset.origSrc ? '0.85' : '0'; }));
                }});
            });
        };

        const onClick = e => {
            if (!rippleOnClick) return;
            const rect = scene.getBoundingClientRect();
            const colHit = Math.floor((e.clientX - rect.left) / (rect.width / gridSize));
            const rowHit = Math.floor((e.clientY - rect.top) / (rect.height / gridSize));
            if (colHit >= 0 && colHit < gridSize && rowHit >= 0 && rowHit < gridSize) triggerRippleAt(rowHit, colHit);
        };

        scene.addEventListener('pointermove', onPointerMove);
        scene.addEventListener('pointerleave', resetAll);
        scene.addEventListener('click', onClick);
        scene.addEventListener('touchmove', onTouchMove, { passive: false });
        scene.addEventListener('touchstart', () => { userActive = true; }, { passive: true });
        scene.addEventListener('touchend', resetAll, { passive: true });


    };

    initCubes();



} catch (err) {
    console.error('Portfolio script error:', err);
}
