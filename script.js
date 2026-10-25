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
    const sparkCanvas = document.getElementById('spark-canvas');

    if (canvas) {
        const ctx = canvas.getContext('2d');
        const sparkCtx = sparkCanvas ? sparkCanvas.getContext('2d') : null;

        let mouse = { x: null, y: null, radius: 200 };
        let gridSpacing = 45; // space between grid lines
        let time = 0;
        let sparks = [];

        // ReactBits ClickSpark Configuration Props
        const sparkColor = '#8b5cf6'; // Theme-matching purple
        const sparkSize = 12;
        const sparkRadius = 18;
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
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            if (sparkCanvas) {
                sparkCanvas.width = w * dpr;
                sparkCanvas.height = h * dpr;
                sparkCanvas.style.width = `${w}px`;
                sparkCanvas.style.height = `${h}px`;
                if (sparkCtx) sparkCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
            }
        };

        const drawGrid = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const logicalWidth = window.innerWidth;
            const logicalHeight = window.innerHeight;
            ctx.clearRect(0, 0, logicalWidth, logicalHeight);

            const cols = Math.ceil(logicalWidth / gridSpacing) + 1;
            const rows = Math.ceil(logicalHeight / gridSpacing) + 1;

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
                ctx.strokeStyle = 'rgba(139, 92, 246, 0.28)'; // Defined violet (brighter opacity)
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
                ctx.strokeStyle = 'rgba(99, 102, 241, 0.28)'; // Defined indigo (brighter opacity)
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

            // Render ReactBits ClickSpark animation frame on dedicated top-level sparkCanvas
            if (sparkCtx) {
                sparkCtx.clearRect(0, 0, sparkCanvas.width, sparkCanvas.height);
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

                    sparkCtx.strokeStyle = sparkColor;
                    sparkCtx.lineWidth = 2.8;
                    sparkCtx.beginPath();
                    sparkCtx.moveTo(x1, y1);
                    sparkCtx.lineTo(x2, y2);
                    sparkCtx.stroke();

                    return true;
                });
            }

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
            const x = e.clientX;
            const y = e.clientY;

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
            '.edu-item',
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
       GSAP MASONRY GALLERY & LIGHTBOX
    ----------------------------------------------- */
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    const openLightbox = (imgSrc, title) => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = imgSrc;
        lightboxCaption.textContent = title || '';
        lightbox.classList.add('active');
        lightbox.setAttribute('aria-hidden', 'false');
    };

    const closeLightbox = () => {
        if (!lightbox) return;
        lightbox.classList.remove('active');
        lightbox.setAttribute('aria-hidden', 'true');
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
            closeLightbox();
        }
    });

    window.openLightbox = openLightbox;

    document.addEventListener('click', (e) => {
        const item = e.target.closest('.project-thumb-item, .project-photo-item');
        if (item) {
            e.preventDefault();
            e.stopPropagation();
            const img = item.getAttribute('data-img');
            const title = item.getAttribute('data-title');
            openLightbox(img, title);
        }
    });

    const initMasonryGallery = () => {
        const containerRef = document.getElementById('masonry-list');
        if (!containerRef) return;

        const GALLERY_ITEMS = [
            { id: "1", img: "./images/nishant_sih.jpg", title: "team4i — SIH 2025 Winners", height: 550 },
            { id: "2", img: "./images/14.jpg", title: "SIH 2025 — Winner Placard & Trophies", height: 420 },
            { id: "3", img: "./images/3.jpeg", title: "Code Odyssey 3.0 — 2nd Runner Up, ₹8,000", height: 600 },
            { id: "4", img: "./images/20.jpg", title: "Codeutsava 8.0 — NIT Raipur Winners ₹40,000", height: 480 },
            { id: "5", img: "./images/7.jpeg", title: "WEBATHON — Award Ceremony, Saboo Siddik", height: 520 },
            { id: "6", img: "./images/18.jpg", title: "Featured in Dainik Bhaskar, Nov 2024", height: 450 },
            { id: "7", img: "./images/1.jpeg", title: "Hackathon Hall — team4i Ready to Compete", height: 580 },
            { id: "8", img: "./images/24.jpg", title: "Sunhacks 2025 — First Prize ₹50,000", height: 400 },
            { id: "9", img: "./images/11.jpg", title: "Arriving at Ramaiah University for SIH 2025", height: 500 },
            { id: "10", img: "./images/16.jpg", title: "QUASAR 3.0 — 2nd Runner Up, ₹20,000", height: 460 },
            { id: "11", img: "./images/2.jpeg", title: "WEBATHON — Winners, Team4i, ₹15,000", height: 540 },
            { id: "12", img: "./images/22.jpg", title: "Code Odyssey 3.0 — Runner Up Cheque", height: 430 },
            { id: "13", img: "./images/9.jpeg", title: "WEBATHON — Solo Winner, ₹15,000", height: 510 },
            { id: "14", img: "./images/15.jpg", title: "On Stage — Certificate Handover", height: 470 },
            { id: "15", img: "./images/26.jpg", title: "Wadhwani Foundation — Participation Certs", height: 560 },
            { id: "16", img: "./images/10.jpg", title: "SIH 2025 — Team4i with Faculty & Mentors", height: 440 },
            { id: "17", img: "./images/112.jpg", title: "Prakalp-IKS — Trophy Receiving Ceremony", height: 490 },
            { id: "18", img: "./images/19.jpg", title: "Codeutsava 8.0 — Team4i Winners, ₹40,000", height: 530 },
            { id: "19", img: "./images/23.jpg", title: "Code Odyssey 3.0 — On Stage, KJ Somaiya", height: 410 },
            { id: "20", img: "./images/13.jpg", title: "SIH 2025 — Grand Finale Winners, ₹75,000", height: 480 },
            { id: "21", img: "./images/25.jpg", title: "Sunhacks 2025 — Outdoor Victory at Sandip", height: 450 },
            { id: "22", img: "./images/21.jpg", title: "Codeutsava 8.0 — Status 200 Winners", height: 450 },
            { id: "24", img: "./images/17.jpg", title: "SIH 2024 — Grand Finale, Team4i at Work", height: 520 },
            { id: "25", img: "./images/mentorconnect1.jpg", title: "MentorConnect — Live Faculty & Student Demo", height: 460 },
            { id: "26", img: "./images/mentorconnect2.jpg", title: "MentorConnect — Computer Lab Portal Demonstration", height: 460 },
            { id: "27", img: "./images/mentorconnect4.jpg", title: "MentorConnect — Department Mentoring Session at Fr. CRCE", height: 500 },
            { id: "28", img: "./images/100x.vc_pitching_with_shashank_randev.jpg", title: "Pitching to Shashank Randev — 100X.VC", height: 460 }
        ];

        const ease = 'power3.out';
        const duration = 0.6;
        // Reduced stagger so animation completes faster and doesn't block interaction
        const stagger = 0.03;
        const animateFrom = 'bottom';
        const scaleOnHover = true;
        const hoverScale = 0.95;
        // blurToFocus DISABLED — animating blur() on 22+ items simultaneously is
        // extremely GPU-expensive and causes the section-load lag. Fade + translate is smooth.
        const blurToFocus = false;

        const getColumns = () => {
            const queries = ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)'];
            const values = [5, 4, 3];
            const idx = queries.findIndex(q => window.matchMedia(q).matches);
            return idx !== -1 ? values[idx] : 2;
        };

        // Batch preload: fetch BATCH_SIZE images at a time so the browser network
        // queue isn't saturated (some images are 10–13 MB unoptimized).
        const BATCH_SIZE = 4;
        const preloadImages = async items => {
            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const batch = items.slice(i, i + BATCH_SIZE);
                await Promise.all(
                    batch.map(
                        item =>
                            new Promise(resolve => {
                                const img = new Image();
                                img.src = item.img;
                                const onDone = () => {
                                    if (img.naturalWidth && img.naturalHeight) {
                                        item.aspectRatio = img.naturalHeight / img.naturalWidth;
                                    }
                                    resolve();
                                };
                                if (img.decode) {
                                    img.decode().then(onDone).catch(onDone);
                                } else {
                                    img.onload = img.onerror = onDone;
                                }
                            })
                    )
                );
            }
        };

        const calculateGrid = (width, columns) => {
            if (!width) return { grid: [], maxContainerHeight: 0 };
            const colHeights = new Array(columns).fill(0);
            const columnWidth = width / columns;

            const grid = GALLERY_ITEMS.map(child => {
                const col = colHeights.indexOf(Math.min(...colHeights));
                const x = columnWidth * col;
                const height = child.aspectRatio
                    ? columnWidth * child.aspectRatio
                    : (child.height ? child.height / 2 : columnWidth * 0.75);
                const y = colHeights[col];

                colHeights[col] += height;

                return { ...child, x, y, w: columnWidth, h: height };
            });

            return { grid, maxContainerHeight: Math.max(...colHeights) };
        };

        const getInitialPosition = item => {
            let direction = animateFrom;

            switch (direction) {
                case 'top':
                    return { x: item.x, y: -200 };
                case 'bottom':
                    return { x: item.x, y: item.y + 80 };
                case 'left':
                    return { x: -200, y: item.y };
                case 'right':
                    return { x: window.innerWidth + 200, y: item.y };
                default:
                    return { x: item.x, y: item.y + 80 };
            }
        };

        let hasMounted = false;

        const renderGrid = () => {
            const width = containerRef.offsetWidth;
            const columns = getColumns();
            const { grid, maxContainerHeight } = calculateGrid(width, columns);

            containerRef.style.height = `${maxContainerHeight}px`;

            grid.forEach((item, index) => {
                let el = containerRef.querySelector(`[data-key="${item.id}"]`);
                if (!el) {
                    el = document.createElement('div');
                    el.className = 'item-wrapper cursor-target';
                    el.setAttribute('data-key', item.id);

                    const imgDiv = document.createElement('div');
                    imgDiv.className = 'item-img';

                    const imgEl = document.createElement('img');
                    imgEl.src = item.img;
                    imgEl.loading = 'lazy';
                    imgEl.alt = item.title;
                    imgEl.style.width = '100%';
                    imgEl.style.height = '100%';
                    imgEl.style.objectFit = 'cover';
                    imgEl.style.display = 'block';
                    imgDiv.appendChild(imgEl);

                    const overlay = document.createElement('div');
                    overlay.className = 'item-caption-overlay';
                    overlay.innerHTML = `<span class="item-title">${item.title}</span>`;
                    imgDiv.appendChild(overlay);

                    el.appendChild(imgDiv);
                    containerRef.appendChild(el);

                    if (typeof initSingleCardEffect === 'function') {
                        initSingleCardEffect(el);
                    }

                    if (scaleOnHover) {
                        el.addEventListener('mouseenter', () => {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(imgDiv, { scale: hoverScale, duration: 0.3, ease: 'power2.out', force3D: true });
                            } else {
                                imgDiv.style.transform = `scale(${hoverScale})`;
                            }
                        });
                        el.addEventListener('mouseleave', () => {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(imgDiv, { scale: 1, duration: 0.3, ease: 'power2.out', force3D: true });
                            } else {
                                imgDiv.style.transform = `scale(1)`;
                            }
                        });
                    }

                    el.addEventListener('click', () => openLightbox(item.img, item.title));
                }

                const animationProps = {
                    x: item.x,
                    y: item.y,
                    width: item.w,
                    height: item.h,
                    force3D: true
                };

                if (typeof gsap !== 'undefined') {
                    if (!hasMounted) {
                        gsap.set(el, {
                            opacity: 1,
                            ...animationProps
                        });
                    } else {
                        gsap.to(el, {
                            ...animationProps,
                            duration: duration,
                            ease: ease,
                            overwrite: 'auto'
                        });
                    }
                } else {
                    el.style.opacity = '1';
                    el.style.width = `${item.w}px`;
                    el.style.height = `${item.h}px`;
                    el.style.transform = `translate(${item.x}px, ${item.y}px)`;
                }
            });

            hasMounted = true;
        };

        // Render grid immediately so gallery items exist in the DOM right away
        renderGrid();

        // Load image aspect ratios asynchronously in parallel without blocking rendering
        GALLERY_ITEMS.forEach(item => {
            const img = new Image();
            img.src = item.img;
            const onDone = () => {
                if (img.naturalWidth && img.naturalHeight) {
                    item.aspectRatio = img.naturalHeight / img.naturalWidth;
                    renderGrid();
                }
            };
            if (img.decode) {
                img.decode().then(onDone).catch(onDone);
            } else {
                img.onload = img.onerror = onDone;
            }
        });

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (hasMounted) renderGrid();
            }, 100);
        });
    };

    initMasonryGallery();

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

        // Add target class dynamically to links, buttons, cards, gallery items, cubes grid, and website preview container
        document.querySelectorAll('a, button, [role="button"], .project-card, .contact-link, .api-btn, .item-wrapper, .lightbox-close, #cubes-wrapper, .vibe-tab, .vibe-browser-body').forEach(el => {
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

        const xTo = gsap.quickTo(cursor, "x", { duration: 0.15, ease: "power2.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.15, ease: "power2.out" });

        // Cache offset — only update on resize, not on every mousemove
        let cachedOffset = getOffset();

        const moveCursor = (x, y) => {
            xTo(x - cachedOffset.x);
            yTo(y - cachedOffset.y);
        };

        window.addEventListener('mousemove', e => moveCursor(e.clientX, e.clientY), { passive: true });

        // Pre-build quickSetters for each corner so tickerFn is allocation-free
        const cornersArr = Array.from(corners);
        const cornerXSetters = cornersArr.map(c => gsap.quickSetter(c, 'x', 'px'));
        const cornerYSetters = cornersArr.map(c => gsap.quickSetter(c, 'y', 'px'));

        const tickerFn = () => {
            if (!targetCornerPositions || !cursor || !cornersArr.length) return;
            const strength = activeStrength.current;
            if (strength === 0) return;

            const cursorX = gsap.getProperty(cursor, 'x');
            const cursorY = gsap.getProperty(cursor, 'y');

            cornersArr.forEach((corner, i) => {
                const currentX = gsap.getProperty(corner, 'x');
                const currentY = gsap.getProperty(corner, 'y');

                const targetX = targetCornerPositions[i].x - cursorX;
                const targetY = targetCornerPositions[i].y - cursorY;

                const finalX = currentX + (targetX - currentX) * strength;
                const finalY = currentY + (targetY - currentY) * strength;

                // Use quickSetters — zero allocations, no new tweens spawned per frame
                cornerXSetters[i](finalX);
                cornerYSetters[i](finalY);
            });
        };

        let scrollTicking = false;
        window.addEventListener('scroll', () => {
            if (!activeTarget || scrollTicking) return;
            scrollTicking = true;
            requestAnimationFrame(() => {
                if (activeTarget) {
                    const { x: offsetX, y: offsetY } = getOffset();
                    const mouseX = gsap.getProperty(cursor, 'x') + offsetX;
                    const mouseY = gsap.getProperty(cursor, 'y') + offsetY;
                    const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
                    const isStillOverTarget =
                        elementUnderMouse &&
                        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget || elementUnderMouse.closest('a, button') === activeTarget);
                    if (!isStillOverTarget && currentLeaveHandler) {
                        currentLeaveHandler();
                    }
                }
                scrollTicking = false;
            });
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
                if (current.matches(targetSelector) || current.matches('a, button, [role="button"]')) {
                    if (!current.classList.contains('folder-stage') && !current.classList.contains('folder-item')) {
                        allTargets.push(current);
                    }
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

            if (dot) dot.classList.add('cursor-dot--expanded');
            const targetDotColor = '#ffffff';
            if (cursorColorOnTarget) {
                gsap.to(cornersArr, {
                    borderColor: '#ffffff',
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
                if (dot) dot.classList.remove('cursor-dot--expanded');

                if (cursorColorOnTarget && corners.length) {
                    gsap.to(cornersArr, {
                        borderColor: cursorColor,
                        duration: 0.15,
                        ease: 'power2.out'
                    });
                    if (dot) {
                        gsap.to(dot, {
                            backgroundColor: '#ffffff',
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
            cachedOffset = getOffset();
        });
    };

    initTargetCursor();

    /* -----------------------------------------------
       3D CUBES TECH STACK GRID (ReactBits)
    ----------------------------------------------- */
    const initCubes = () => {
        const scene = document.getElementById('cubes-scene');
        if (!scene) return;
        const wrapper = document.getElementById('cubes-wrapper') || scene;

        const TECH_ITEMS = [
            { slug: 'python', name: 'Python', category: 'language' },
            { slug: 'dart', name: 'Dart', category: 'language' },
            { slug: 'c', name: 'C', category: 'language' },
            { slug: 'javascript', name: 'JavaScript', category: 'language' },
            { slug: 'gnubash', name: 'Bash', category: 'language' },
            { slug: 'django', name: 'Django', category: 'backend' },
            { slug: 'postman', name: 'Django REST (API)', category: 'backend' },
            { slug: 'celery', name: 'Celery', category: 'backend' },
            { slug: 'springboot', name: 'Spring Boot', category: 'backend' },
            { slug: 'jsonwebtokens', name: 'JWT', category: 'backend' },
            { slug: 'json', name: 'JSON', category: 'backend' },
            { slug: 'flutter', name: 'Flutter', category: 'frontend' },
            { slug: 'html5', name: 'HTML5', category: 'frontend' },
            { slug: 'css3', name: 'CSS3', category: 'frontend' },
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
            { slug: 'microsoftexcel', name: 'Excel Sheets', category: 'tools', iconUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23ffffff"><path d="M21.17 3.25A.83.83 0 0 1 22 4.08v15.84a.83.83 0 0 1-.83.83H7.83a.83.83 0 0 1-.83-.83V17H2.83A.83.83 0 0 1 2 16.17V7.83A.83.83 0 0 1 2.83 7H7V4.08a.83.83 0 0 1 .83-.83h13.34zm-8.67 5.5l-1.9 3.25 1.9 3.25h-1.8l-1.1-2.05-1.1 2.05H6.7l1.9-3.25L6.7 8.75h1.8l1.1 2.05 1.1-2.05h1.8zM20.5 4.75H8.5v14.5h12v-14.5z"/></svg>' },
            { slug: 'githubcopilot', name: 'GitHub Copilot', category: 'tools' },
            { slug: 'ollama', name: 'Ollama', category: 'tools' },
            { slug: 'git', name: 'Git', category: 'tools' },
            { slug: 'github', name: 'GitHub', category: 'tools' },
            { slug: 'linux', name: 'Linux', category: 'tools' },
        ];

        const CATEGORY_COLORS = {
            language: { border: '#a78bfa', ripple: '#c4b5fd', face: '#2b2244' },
            backend: { border: '#c084fc', ripple: '#e879f9', face: '#362146' },
            frontend: { border: '#818cf8', ripple: '#a5b4fc', face: '#212646' },
            database: { border: '#f472b6', ripple: '#fbcfe8', face: '#3c2132' },
            tools: { border: '#38bdf8', ripple: '#7dd3fc', face: '#1e2c3a' },
            filler: { border: '#3b334a', ripple: '#a78bfa', face: '#1c1827' },
        };

        const gridCols = 6;
        const gridRows = 5;
        const maxAngle = 45;
        const radius = 3;
        const enterDur = 0.3;
        const leaveDur = 0.6;
        const easing = 'power3.out';
        const autoAnimate = true;
        const rippleOnClick = true;
        const rippleSpeed = 1.5;

        scene.style.gridTemplateColumns = `repeat(${gridCols}, 1fr)`;
        scene.style.gridTemplateRows = `repeat(${gridRows}, 1fr)`;
        scene.innerHTML = '';

        for (let i = 0; i < gridCols * gridRows; i++) {
            const tech = TECH_ITEMS[i] || { slug: '', name: '', category: 'filler' };
            const colors = CATEGORY_COLORS[tech.category] || CATEGORY_COLORS.filler;
            const r = Math.floor(i / gridCols);
            const c = i % gridCols;
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

                // Create and append the GPU ripple overlay
                const rippleOverlay = document.createElement('div');
                rippleOverlay.className = 'cube-ripple-overlay';
                faceDiv.appendChild(rippleOverlay);

                const img = document.createElement('img');
                img.className = 'cube-icon';
                const origSrc = tech.iconUrl ? tech.iconUrl : (tech.slug ? `./icons/${tech.slug}.svg` : '');
                img.dataset.origSrc = origSrc;
                img.onerror = () => {
                    img.style.display = 'none';
                    if (!faceDiv.querySelector('.cube-label-fallback')) {
                        const fallbackText = document.createElement('span');
                        fallbackText.className = 'cube-label-fallback';
                        fallbackText.textContent = tech.name || tech.slug;
                        faceDiv.appendChild(fallbackText);
                    }
                };
                if (origSrc) { img.src = origSrc; img.style.opacity = '0.85'; } else { img.style.opacity = '0'; }
                faceDiv.appendChild(img);

                const rippleImg = document.createElement('div');
                rippleImg.className = 'ripple-icon';
                faceDiv.appendChild(rippleImg);

                cube.appendChild(faceDiv);
            });
            scene.appendChild(cube);
        }

        let raf = null;
        let idleTimer = null;
        let userActive = false;
        let pointerOverGrid = false;
        const pauseAutoMoving = () => {
            userActive = true;
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => { userActive = false; }, 3000);
        };
        let cubes = [];
        const initCubeReferences = () => {
            cubes = Array.from(scene.querySelectorAll('.cube')).map(cube => ({
                el: cube,
                row: +cube.dataset.row,
                col: +cube.dataset.col,
                targetX: 0,
                targetY: 0,
                currX: 0,
                currY: 0,
                faces: Array.from(cube.querySelectorAll('.cube-face')),
                icons: Array.from(cube.querySelectorAll('.cube-icon')),
                rippleIcons: Array.from(cube.querySelectorAll('.ripple-icon')),
                overlays: Array.from(cube.querySelectorAll('.cube-ripple-overlay'))
            }));
        };
        initCubeReferences();

        let simPos = { x: 0.5, y: 0.5 };
        let simTarget = { x: 0.5, y: 0.5 };
        let simRAF = null;

        const tiltAt = (rowCenter, colCenter) => {
            cubes.forEach(c => {
                const dist = Math.hypot(c.row - rowCenter, c.col - colCenter);
                if (dist <= radius) {
                    // Cosine smoothstep curve for silky organic falloff
                    const pct = (1 + Math.cos((dist / radius) * Math.PI)) / 2;
                    const angle = pct * maxAngle;
                    c.targetX = -angle;
                    c.targetY = angle;
                } else {
                    c.targetX = 0;
                    c.targetY = 0;
                }
            });
        };

        const resetAll = () => {
            cubes.forEach(c => {
                c.targetX = 0;
                c.targetY = 0;
            });
        };

        const marquee = document.getElementById('skills-marquee');
        let allMarqueeItems = [];
        let techToMarqueeItems = {};
        let oneSetWidth = 0;

        let cachedContainerWidth = 0;
        const cacheItemPositions = () => {
            if (!marquee) return;
            cachedContainerWidth = marquee.clientWidth;
            const items = Array.from(marquee.querySelectorAll('.marquee-item'));
            if (items.length === 0) return;

            allMarqueeItems = items.map(el => ({
                el,
                tech: el.dataset.tech,
                left: el.offsetLeft,
                width: el.offsetWidth
            }));

            const setSize = items.length / 3;
            if (setSize > 0 && items[setSize]) {
                oneSetWidth = items[setSize].offsetLeft - items[0].offsetLeft;
            }
        };

        const updateLayout = () => {
            if (!marquee || !allMarqueeItems.length) return;
            const containerWidth = cachedContainerWidth || marquee.clientWidth;
            const scrollLeft = marquee.scrollLeft;
            const containerCenterX = scrollLeft + containerWidth / 2;
            let closestEl = null;
            let minDistance = Infinity;

            allMarqueeItems.forEach(item => {
                const dx = (item.left + item.width / 2) - containerCenterX;
                const dist = Math.abs(dx);
                item.el.style.opacity = Math.max(0.35, 1 - dist / (containerWidth * 0.4));
                if (dist < minDistance) {
                    minDistance = dist;
                    closestEl = item.el;
                }
            });

            allMarqueeItems.forEach(item => {
                if (item.el === closestEl) {
                    item.el.classList.add('active-highlight');
                } else {
                    item.el.classList.remove('active-highlight');
                }
            });

            // Two-way binding: Tilt cubes toward the manually active marquee technology
            if (userActive && closestEl) {
                const techName = closestEl.dataset.tech;
                const idx = TECH_ITEMS.findIndex(t => t.name === techName);
                if (idx !== -1) {
                    const r = Math.floor(idx / gridCols) + 0.5;
                    const c = (idx % gridCols) + 0.5;
                    
                    // Only tilt toward the marquee if the pointer is NOT hovering directly over the grid
                    if (!pointerOverGrid) {
                        tiltAt(r, c);
                    }

                    // Sync simulation state so it resumes from this manually selected tech item
                    simIndex = idx;
                    simTarget = { x: c, y: r };
                    simPos = { x: c, y: r };
                }
            }
        };

        if (marquee) {
            marquee.innerHTML = '';
            const track = document.createElement('div');
            track.className = 'marquee-track';

            const techsWithSlug = TECH_ITEMS.filter(t => t.slug && t.name);

            [0, 1, 2].forEach(copyIdx => {
                techsWithSlug.forEach(tech => {
                    const item = document.createElement('div');
                    item.className = 'marquee-item';
                    item.dataset.tech = tech.name;
                    item.dataset.copy = copyIdx;
                    item.textContent = tech.name;

                    const tl = document.createElement('div'); tl.className = 'target-corner corner-tl'; item.appendChild(tl);
                    const tr = document.createElement('div'); tr.className = 'target-corner corner-tr'; item.appendChild(tr);
                    const br = document.createElement('div'); br.className = 'target-corner corner-br'; item.appendChild(br);
                    const bl = document.createElement('div'); bl.className = 'target-corner corner-bl'; item.appendChild(bl);

                    item.addEventListener('click', () => {
                        pauseAutoMoving();
                        const idx = TECH_ITEMS.findIndex(t => t.name === tech.name);
                        if (idx !== -1) triggerRippleAt(Math.floor(idx / gridCols), idx % gridCols);
                    });
                    track.appendChild(item);
                });
            });

            marquee.appendChild(track);

            requestAnimationFrame(() => {
                cacheItemPositions();
                if (oneSetWidth > 0) {
                    marquee.scrollLeft = oneSetWidth;
                }

                techToMarqueeItems = {};
                allMarqueeItems.forEach(item => {
                    if (!techToMarqueeItems[item.tech]) techToMarqueeItems[item.tech] = [];
                    techToMarqueeItems[item.tech].push(item);
                });
                updateLayout();

                // Recalculate once web fonts are fully loaded to prevent layout metric errors
                if (document.fonts) {
                    document.fonts.ready.then(() => {
                        cacheItemPositions();
                        if (oneSetWidth > 0) {
                            marquee.scrollLeft = oneSetWidth;
                        }
                        updateLayout();
                    });
                }
            });

            window.addEventListener('resize', () => {
                cacheItemPositions();
                updateLayout();
            });
            marquee.addEventListener('scroll', () => {
                pauseAutoMoving();
                updateLayout();
            }, { passive: true });
            marquee.addEventListener('touchstart', pauseAutoMoving, { passive: true });
            marquee.addEventListener('pointerdown', pauseAutoMoving, { passive: true });
        }

        let lastTargetTech = null;
        let scrollTween = null;
        let scrollObj = { value: 0 };
        const scrollMarqueeTo = (rowHit, colHit) => {
            if (!marquee) return;
            const idx = Math.floor(rowHit) * gridCols + Math.floor(colHit);
            const tech = TECH_ITEMS[Math.min(idx, TECH_ITEMS.length - 1)];
            if (!tech || !tech.slug || !tech.name || lastTargetTech === tech.name) return;
            lastTargetTech = tech.name;

            const allCopies = techToMarqueeItems[tech.name] || [];
            if (allCopies.length === 0) return;
            const containerWidth = cachedContainerWidth || marquee.clientWidth;
            const currentCenter = marquee.scrollLeft + containerWidth / 2;
            let bestItem = allCopies[0];
            let bestDist = Infinity;
            allCopies.forEach(item => {
                const itemCenter = item.left + item.width / 2;
                const d = Math.abs(itemCenter - currentCenter);
                if (d < bestDist) { bestDist = d; bestItem = item; }
            });
            const targetScroll = bestItem.left + bestItem.width / 2 - containerWidth / 2;

            scrollObj.value = marquee.scrollLeft;
            if (scrollTween) scrollTween.kill();
            scrollTween = gsap.to(scrollObj, {
                value: targetScroll,
                duration: 0.4,
                ease: 'power2.out',
                onUpdate: () => {
                    let val = scrollObj.value;
                    if (oneSetWidth > 0) {
                        if (val < oneSetWidth * 0.5) {
                            val += oneSetWidth;
                            scrollObj.value += oneSetWidth;
                        } else if (val > oneSetWidth * 2.5) {
                            val -= oneSetWidth;
                            scrollObj.value -= oneSetWidth;
                        }
                    }
                    marquee.scrollLeft = val;
                    updateLayout();
                }
            });
        };

        const onPointerMove = e => {
            pauseAutoMoving();
            
            // 1. Smooth Tilt Math (Stable bounding rect)
            const rect = wrapper.getBoundingClientRect();
            const colCenter = (e.clientX - rect.left) / (rect.width / gridCols);
            const rowCenter = (e.clientY - rect.top) / (rect.height / gridRows);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

            // 2. Accurate Tech Highlight (Exact DOM target)
            const cubeEl = e.target.closest('.cube');
            if (cubeEl) {
                const r = +cubeEl.dataset.row;
                const c = +cubeEl.dataset.col;
                scrollMarqueeTo(r, c);
            }
        };

        const onTouchMove = e => {
            e.preventDefault();
            pauseAutoMoving();
            const rect = wrapper.getBoundingClientRect();
            const colCenter = (e.touches[0].clientX - rect.left) / (rect.width / gridCols);
            const rowCenter = (e.touches[0].clientY - rect.top) / (rect.height / gridRows);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
        };

        let activeRippleTimeline = null;

        const triggerRippleAt = (rowHit, colHit) => {
            const idx = rowHit * gridCols + colHit;
            const clickedTech = TECH_ITEMS[idx];
            if (!clickedTech) return;
            if (marquee && clickedTech.slug) {
                scrollMarqueeTo(rowHit, colHit);
            }

            // Tactile scale pop on the clicked cube
            if (cubes[idx]) {
                gsap.to(cubes[idx].el, { scale: 1.12, duration: 0.15, yoyo: true, repeat: 1, ease: 'power2.out', overwrite: 'auto' });
            }

            const rippleColor = CATEGORY_COLORS[clickedTech.category]?.ripple || '#ffffff';
            const clickedIconUrl = clickedTech.slug ? `./icons/${clickedTech.slug}.svg` : (clickedTech.iconUrl || '');

            scene.style.setProperty('--ripple-color', rippleColor);
            if (clickedIconUrl) {
                scene.style.setProperty('--ripple-icon-url', `url("${clickedIconUrl}")`);
            }

            // Cleanly kill previous ripple animations and reset all cubes immediately
            if (activeRippleTimeline) {
                activeRippleTimeline.kill();
            }
            cubes.forEach(c => {
                gsap.killTweensOf(c.overlays);
                gsap.killTweensOf(c.icons);
                gsap.killTweensOf(c.rippleIcons);
                gsap.set(c.overlays, { opacity: 0 });
                c.icons.forEach(icon => {
                    gsap.set(icon, { opacity: icon.dataset.origSrc ? 0.85 : 0 });
                });
                gsap.set(c.rippleIcons, { opacity: 0 });
            });

            const rings = {};
            cubes.forEach(c => {
                const ring = Math.round(Math.hypot(c.row - rowHit, c.col - colHit));
                if (!rings[ring]) rings[ring] = [];
                rings[ring].push(c);
            });

            const isMobile = window.innerWidth <= 768;
            const speed = isMobile ? 1.6 : 1.0;

            activeRippleTimeline = gsap.timeline();

            Object.keys(rings).map(Number).sort((a, b) => a - b).forEach(ring => {
                const delay = ring * (0.08 / speed);
                const overlays = rings[ring].flatMap(c => c.overlays);
                const origIcons = rings[ring].flatMap(c => c.icons);
                const rippleIcons = rings[ring].flatMap(c => c.rippleIcons);

                const fadeInDur = 0.35 / speed;
                const holdDur = 0.25 / speed;
                const fadeOutDur = 0.45 / speed;

                // Wave start: animate overlay opacity + cross-fade icon
                activeRippleTimeline.to(overlays, {
                    opacity: 1,
                    duration: fadeInDur,
                    ease: 'power2.out'
                }, delay);

                if (clickedIconUrl) {
                    activeRippleTimeline.to(origIcons, { opacity: 0, duration: fadeInDur, ease: 'power2.out' }, delay);
                    activeRippleTimeline.to(rippleIcons, { opacity: 0.9, duration: fadeInDur, ease: 'power2.out' }, delay);
                }

                // Wave end: restore overlay opacity to 0 + cross-fade back to original tech icons
                const fadeOutTime = delay + fadeInDur + holdDur;
                activeRippleTimeline.to(overlays, {
                    opacity: 0,
                    duration: fadeOutDur,
                    ease: 'power2.out'
                }, fadeOutTime);

                if (clickedIconUrl) {
                    origIcons.forEach(icon => {
                        const targetOpacity = icon.dataset.origSrc ? 0.85 : 0;
                        activeRippleTimeline.to(icon, { opacity: targetOpacity, duration: fadeOutDur, ease: 'power2.out' }, fadeOutTime);
                    });
                    activeRippleTimeline.to(rippleIcons, { opacity: 0, duration: fadeOutDur, ease: 'power2.out' }, fadeOutTime);
                }
            });
        };

        const onClick = e => {
            pauseAutoMoving();
            if (!rippleOnClick) return;
            const cubeEl = e.target.closest('.cube');
            if (cubeEl) {
                const idx = cubes.findIndex(c => c.el === cubeEl);
                if (idx !== -1) {
                    const rowHit = Math.floor(idx / gridCols);
                    const colHit = idx % gridCols;
                    triggerRippleAt(rowHit, colHit);
                }
            }
        };

        const cursorDot = document.querySelector('.target-cursor-dot');

        wrapper.addEventListener('pointermove', e => {
            pointerOverGrid = true;
            onPointerMove(e);
        });
        wrapper.addEventListener('pointerenter', () => {
            pointerOverGrid = true;
            if (cursorDot) cursorDot.classList.add('cursor-dot--expanded');
        });
        wrapper.addEventListener('pointerleave', () => {
            pointerOverGrid = false;
            resetAll();
            if (cursorDot) cursorDot.classList.remove('cursor-dot--expanded');
        });
        wrapper.addEventListener('click', onClick);
        wrapper.addEventListener('touchmove', e => {
            pointerOverGrid = true;
            onTouchMove(e);
        }, { passive: false });
        wrapper.addEventListener('touchstart', () => {
            pointerOverGrid = true;
            pauseAutoMoving();
        }, { passive: true });
        wrapper.addEventListener('touchend', () => {
            pointerOverGrid = false;
            resetAll();
        }, { passive: true });

        const simSpeed = 0.025;
        const totalCubes = gridCols * gridRows;
        let simIndex = 0;
        const getSimTarget = (idx) => ({
            x: (idx % gridCols) + 0.5,
            y: (Math.floor(idx / gridCols)) + 0.5
        });
        simTarget = getSimTarget(0);

        const lerpFactor = 0.14;
        const loop = () => {
            if (!userActive) {
                simPos.x += (simTarget.x - simPos.x) * simSpeed;
                simPos.y += (simTarget.y - simPos.y) * simSpeed;
                tiltAt(simPos.y, simPos.x);
                if (Math.hypot(simPos.x - simTarget.x, simPos.y - simTarget.y) < 0.12) {
                    simIndex = (simIndex + 1) % totalCubes;
                    simTarget = getSimTarget(simIndex);
                    scrollMarqueeTo(simTarget.y, simTarget.x);
                }
            }

            // Continuous silky smooth per-frame lerp dampening for all cubes
            cubes.forEach(c => {
                c.currX += (c.targetX - c.currX) * lerpFactor;
                c.currY += (c.targetY - c.currY) * lerpFactor;
                c.el.style.transform = `rotateX(${c.currX}deg) rotateY(${c.currY}deg)`;
            });

            simRAF = requestAnimationFrame(loop);
        };

        const skillsSection = document.getElementById('skills') || scene;
        const observer = new IntersectionObserver(entries => {
            const isVisible = entries[0].isIntersecting;
            if (isVisible && !simRAF) {
                simRAF = requestAnimationFrame(loop);
            } else if (!isVisible && simRAF) {
                cancelAnimationFrame(simRAF);
                simRAF = null;
            }
        }, { threshold: 0.05 });
        observer.observe(skillsSection);

    };

    initCubes();

    // Vibe Coding Labs Controller
    const initVibeLabs = () => {
        const section = document.getElementById('vibe-labs');
        if (!section) return;

        const tabs = section.querySelectorAll('.vibe-tab');
        const loader = section.querySelector('.vibe-loader');
        const browser = section.querySelector('.vibe-browser');
        const urlText = section.querySelector('#vibe-browser-url');
        const linkBtn = section.querySelector('#vibe-browser-link');
        const descTitle = section.querySelector('#vibe-desc-title');
        const descText = section.querySelector('#vibe-desc-text');
        const browserBody = section.querySelector('.vibe-browser-body');
        const iframeOverlay = section.querySelector('.vibe-iframe-overlay');
        const originalIframe = section.querySelector('#vibe-iframe');

        const tabsColumn = section.querySelector('.vibe-tabs-column');
        const browserColumn = section.querySelector('.vibe-browser-column');

        let firstLoadTriggered = false;
        const iframePool = {};
        let currentIframe = null;

        // Extract template and remove original to avoid duplicate IDs
        const iframeTemplate = originalIframe.cloneNode(true);
        iframeTemplate.removeAttribute('id');
        originalIframe.remove();

        const preloadNextIframe = () => {
            const activeTab = section.querySelector('.vibe-tab.active');
            if (!activeTab) return;
            const tabsArray = Array.from(tabs);
            const activeIdx = tabsArray.indexOf(activeTab);
            if (activeIdx !== -1 && activeIdx < tabsArray.length - 1) {
                const nextTab = tabsArray[activeIdx + 1];
                const nextUrl = nextTab.dataset.url;
                if (!iframePool[nextUrl]) {
                    getOrCreateIframe(nextUrl);
                }
            }
        };

        const getOrCreateIframe = (url) => {
            if (iframePool[url]) return iframePool[url];
            const newIframe = iframeTemplate.cloneNode(true);
            newIframe.src = url;
            newIframe.classList.add('vibe-iframe-instance');
            newIframe.addEventListener('load', () => {
                newIframe.classList.add('loaded');
                if (currentIframe === newIframe) {
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                    preloadNextIframe();
                }
            });
            setTimeout(() => {
                if (currentIframe === newIframe) {
                    loader.style.opacity = '0';
                    loader.style.pointerEvents = 'none';
                }
            }, 2500);
            browserBody.insertBefore(newIframe, iframeOverlay);
            iframePool[url] = newIframe;
            return newIframe;
        };

        const updateIframeScale = () => {
            const H = browserBody.clientHeight;
            const W = browserBody.clientWidth;
            if (!H || !W) return;

            const isMobileScreen = window.innerWidth <= 900;
            const wrapperWidth = W;
            const virtualWidth = 1280; // Standard desktop virtual resolution
            const virtualHeight = 800; // 16:10 aspect ratio height
            const scale = wrapperWidth / virtualWidth;

            Object.values(iframePool).forEach(iframe => {
                iframe.style.width = `${virtualWidth}px`;
                iframe.style.height = `${virtualHeight}px`;
                iframe.style.transform = `translate3d(0,0,0) scale(${scale})`;
                iframe.style.transformOrigin = 'top left';
            });

            // Dynamically scale the left-sidebar maxHeight to match the right column's height
            if (isMobileScreen) {
                tabsColumn.style.maxHeight = 'none';
            } else {
                const rightHeight = browserColumn.clientHeight;
                if (rightHeight > 0) {
                    tabsColumn.style.maxHeight = `${rightHeight}px`;
                }
            }
        };

        const switchProject = (tab) => {
            const url = tab.dataset.url;
            const title = tab.dataset.title;
            const desc = tab.dataset.desc;

            // Remove active class from all tabs, add to clicked
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            // Highlight browser mockup border temporarily
            browser.classList.add('active-highlight-browser');
            setTimeout(() => browser.classList.remove('active-highlight-browser'), 1000);

            if (currentIframe) currentIframe.classList.remove('active-iframe');
            currentIframe = getOrCreateIframe(url);
            currentIframe.classList.add('active-iframe');

            if (!currentIframe.classList.contains('loaded')) {
                loader.style.opacity = '1';
                loader.style.pointerEvents = 'auto';
            } else {
                loader.style.opacity = '0';
                loader.style.pointerEvents = 'none';
                preloadNextIframe();
            }

            urlText.textContent = url;
            linkBtn.href = url;
            descTitle.textContent = title;
            descText.textContent = desc;

            requestAnimationFrame(updateIframeScale);
        };

        // Tab click listeners
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                if (tab.classList.contains('active')) return;
                switchProject(tab);
                // Reset interaction state when switching projects
                browser.classList.remove('interacting');
            });
        });

        // Click to interact overlays, mouseleave to reset target cursor
        if (iframeOverlay) {
            iframeOverlay.addEventListener('click', () => {
                browser.classList.add('interacting');
            });
        }
        browser.addEventListener('mouseleave', () => {
            browser.classList.remove('interacting');
        });

        // Add document-wide click/touch listener to exit interacting mode when clicking/tapping outside
        document.addEventListener('pointerdown', e => {
            if (!browser.contains(e.target) && !tabsColumn.contains(e.target)) {
                browser.classList.remove('interacting');
            }
        });

        // Listen to window resizing to update scale proportions dynamically
        window.addEventListener('resize', updateIframeScale);

        // ALWAYS PRELOAD: Immediately initialize & preload the active/first project iframe in the background
        const activeTab = section.querySelector('.vibe-tab.active') || tabs[0];
        if (activeTab) {
            firstLoadTriggered = true;
            switchProject(activeTab);
            setTimeout(updateIframeScale, 150);
            setTimeout(updateIframeScale, 800);
        }

        // Recalculate iframe scale once the intro preloader unlocks
        if (document.body.classList.contains('intro-loading')) {
            const checkPreload = setInterval(() => {
                if (!document.body.classList.contains('intro-loading')) {
                    clearInterval(checkPreload);
                    setTimeout(updateIframeScale, 100);
                }
            }, 80);
        }
    };

    // Reusable Name Glitch & Focus Combo Controller
    const initNameFocus = (containerId, frameId) => {
        const container = document.getElementById(containerId);
        if (!container) return null;

        const words = container.querySelectorAll('.focus-word');
        const focusFrame = document.getElementById(frameId) || container.querySelector('#' + frameId);
        if (words.length === 0 || !focusFrame) return null;

        let currentIndex = 0;
        let loopInterval = null;
        let isHovered = false;

        const STATES_COUNT = words.length + 1; // individual words + combined state

        const updateFocus = (index) => {
            currentIndex = index;
            const isCombined = index === words.length;

            words.forEach((word, idx) => {
                if (isCombined || idx === index) {
                    word.classList.add('active');
                    word.style.opacity = '1';
                } else {
                    word.classList.remove('active');
                    word.style.opacity = '0.75';
                }
            });

            // Calculate active rect coordinates relative to container
            const parentRect = container.getBoundingClientRect();
            let x = 0, y = 0, width = 0, height = 0;

            if (isCombined) {
                // Combined state: stretch from the first word to the last word
                const firstRect = words[0].getBoundingClientRect();
                const lastRect = words[words.length - 1].getBoundingClientRect();
                
                const top = Math.min(firstRect.top, lastRect.top);
                const bottom = Math.max(firstRect.bottom, lastRect.bottom);
                
                x = firstRect.left - parentRect.left;
                y = top - parentRect.top;
                width = lastRect.right - firstRect.left;
                height = bottom - top;
            } else {
                const activeRect = words[index].getBoundingClientRect();
                x = activeRect.left - parentRect.left;
                y = activeRect.top - parentRect.top;
                width = activeRect.width;
                height = activeRect.height;
            }

            gsap.to(focusFrame, {
                x: x,
                y: y,
                width: width,
                height: height,
                opacity: 1,
                duration: 0.45,
                ease: 'power2.out'
            });
        };

        const startLoop = () => {
            if (loopInterval) clearInterval(loopInterval);
            loopInterval = setInterval(() => {
                if (!isHovered) {
                    const nextIndex = (currentIndex + 1) % STATES_COUNT;
                    updateFocus(nextIndex);
                }
            }, 2000);
        };

        const stopLoop = () => {
            if (loopInterval) {
                clearInterval(loopInterval);
                loopInterval = null;
            }
        };

        // Add hover listeners to words
        words.forEach((word, idx) => {
            word.addEventListener('mouseenter', () => {
                isHovered = true;
                stopLoop();
                updateFocus(idx);
            });

            word.addEventListener('mouseleave', () => {
                isHovered = false;
                // Add a slight delay before restarting the loop
                setTimeout(() => {
                    if (!isHovered && !loopInterval) {
                        startLoop();
                    }
                }, 1000);
            });
        });

        // Initialize focus positioning after web fonts paint
        setTimeout(() => {
            updateFocus(0);
            startLoop();
        }, 500);

        const resizeHandler = () => {
            updateFocus(currentIndex);
        };
        window.addEventListener('resize', resizeHandler);

        return {
            stop: () => {
                stopLoop();
                window.removeEventListener('resize', resizeHandler);
            },
            update: () => {
                updateFocus(currentIndex);
            }
        };
    };

    /* -----------------------------------------------
       DOT FIELD — Loading Screen Background Animation
       Ported from ReactBits DotField to vanilla JS/Canvas
       ----------------------------------------------- */
    const initDotField = () => {
        const canvas = document.getElementById('dot-field-canvas');
        if (!canvas) return null;

        const ctx = canvas.getContext('2d', { alpha: true });
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        // ── Config (matching ReactBits usage params) ──────────────────
        const DOT_RADIUS    = 1.5;
        const DOT_SPACING   = 14;
        const BULGE_STR     = 67;
        const CURSOR_RADIUS = 500;
        const GRAD_FROM     = 'rgba(168, 85, 247, 0.35)';
        const GRAD_TO       = 'rgba(180, 151, 207, 0.25)';
        const TWO_PI        = Math.PI * 2;
        const STEP          = DOT_RADIUS + DOT_SPACING;

        let dots = [];
        let w = 0, h = 0;
        let frameCount = 0;
        let raf = null;
        let resizeTimer = null;

        const mouse = { x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 };
        let engagement = 0;

        // ── Build dot grid ────────────────────────────────────────────
        const buildDots = () => {
            const cols = Math.floor(w / STEP);
            const rows = Math.floor(h / STEP);
            const padX = (w % STEP) / 2;
            const padY = (h % STEP) / 2;
            dots = [];
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const ax = padX + c * STEP + STEP / 2;
                    const ay = padY + r * STEP + STEP / 2;
                    dots.push({ ax, ay, sx: ax, sy: ay });
                }
            }
        };

        // ── Resize ────────────────────────────────────────────────────
        const doResize = () => {
            const rect = canvas.parentElement.getBoundingClientRect();
            w = rect.width;
            h = rect.height;
            canvas.width  = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width  = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            buildDots();
        };

        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(doResize, 100);
        };

        // ── Mouse ─────────────────────────────────────────────────────
        const onMouseMove = e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        // Speed interval for engagement dampening
        const speedInterval = setInterval(() => {
            const dx = mouse.prevX - mouse.x;
            const dy = mouse.prevY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            mouse.speed += (dist - mouse.speed) * 0.5;
            if (mouse.speed < 0.001) mouse.speed = 0;
            mouse.prevX = mouse.x;
            mouse.prevY = mouse.y;
        }, 20);

        // ── Render loop ───────────────────────────────────────────────
        const tick = () => {
            frameCount++;
            const len = dots.length;
            const crSq = CURSOR_RADIUS * CURSOR_RADIUS;
            const rad  = DOT_RADIUS / 2;

            const targetEng = Math.min(mouse.speed / 5, 1);
            engagement += (targetEng - engagement) * 0.06;
            if (engagement < 0.001) engagement = 0;

            ctx.clearRect(0, 0, w, h);

            const grad = ctx.createLinearGradient(0, 0, w, h);
            grad.addColorStop(0, GRAD_FROM);
            grad.addColorStop(1, GRAD_TO);
            ctx.fillStyle = grad;

            ctx.beginPath();

            for (let i = 0; i < len; i++) {
                const d = dots[i];
                const dx = mouse.x - d.ax;
                const dy = mouse.y - d.ay;
                const distSq = dx * dx + dy * dy;

                if (distSq < crSq && engagement > 0.01) {
                    const dist = Math.sqrt(distSq);
                    const t    = 1 - dist / CURSOR_RADIUS;
                    const push = t * t * BULGE_STR * engagement;
                    const ang  = Math.atan2(dy, dx);
                    d.sx += (d.ax - Math.cos(ang) * push - d.sx) * 0.15;
                    d.sy += (d.ay - Math.sin(ang) * push - d.sy) * 0.15;
                } else {
                    d.sx += (d.ax - d.sx) * 0.1;
                    d.sy += (d.ay - d.sy) * 0.1;
                }

                ctx.moveTo(d.sx + rad, d.sy);
                ctx.arc(d.sx, d.sy, rad, 0, TWO_PI);
            }

            ctx.fill();
            raf = requestAnimationFrame(tick);
        };

        // ── Init ──────────────────────────────────────────────────────
        doResize();
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove, { passive: true });
        raf = requestAnimationFrame(tick);

        // ── Cleanup — call once loader finishes ───────────────────────
        return () => {
            cancelAnimationFrame(raf);
            clearInterval(speedInterval);
            clearTimeout(resizeTimer);
            window.removeEventListener('resize', onResize);
            window.removeEventListener('mousemove', onMouseMove);
        };
    };

    /* -----------------------------------------------
       INTRO LOADER SEQUENCE — REAL RESOURCE PRELOADER
       ----------------------------------------------- */
    const initIntroLoader = () => {
        const loaderBar     = document.getElementById('loader-bar');
        const loaderPct     = document.getElementById('loader-percentage');
        const terminalLines = document.getElementById('terminal-lines');
        const bodyEl        = document.body;

        const INSTALL_LOGS = [
            { status: "loading",    pkg: "hackathons (8x championship wins)" },
            { status: "verifying",  pkg: "sih-2025-winners (gold cup)" },
            { status: "mounting",   pkg: "client consultancy @ 4istudios" },
            { status: "linking",    pkg: "nit raipur (b.tech comp science)" },
            { status: "deploying",  pkg: "mentorconnect @ yukti-aicte" },
            { status: "indexing",   pkg: "atttc.cloud + mitrai.online" },
            { status: "ready",      pkg: "production-grade-systems initialized" }
        ];

        let currentStageIdx = -1;
        const updateTerminalStream = (stageIdx) => {
            if (!terminalLines) return;
            const clamped = Math.max(0, Math.min(stageIdx, INSTALL_LOGS.length - 1));
            if (clamped === currentStageIdx) return;
            currentStageIdx = clamped;

            // Command line is ALWAYS line index 0
            let html = `
                <div class="t-line t-line-cmd">
                    <span class="t-prompt">$</span><span class="t-cmd">./nishant.sh --install</span>
                </div>
            `;

            for (let i = 0; i <= clamped; i++) {
                const item = INSTALL_LOGS[i];
                const isFinal = (i === INSTALL_LOGS.length - 1);
                const isDone = (i < clamped);

                if (isFinal) {
                    html += `
                        <div class="t-line ready">
                            <span class="t-icon icon-ready">✨</span>
                            <span>${item.pkg}</span>
                        </div>
                    `;
                } else if (isDone) {
                    html += `
                        <div class="t-line done">
                            <span class="t-icon icon-ok">✔</span>
                            <span>${item.pkg}</span>
                        </div>
                    `;
                } else {
                    html += `
                        <div class="t-line active">
                            <span class="t-icon icon-spin">›</span>
                            <span>${item.status} ${item.pkg}...</span>
                        </div>
                    `;
                }
            }

            terminalLines.innerHTML = html;

            // Total lines = 1 (cmd) + (clamped + 1)
            const totalLines = 1 + (clamped + 1);
            const maxVisible = 4;
            if (totalLines > maxVisible) {
                const offsetLines = totalLines - maxVisible;
                const isMobile = window.innerWidth <= 480;
                const lineH = isMobile ? 24 : 28;
                terminalLines.style.transform = `translateY(-${offsetLines * lineH}px)`;
            } else {
                terminalLines.style.transform = 'translateY(0px)';
            }
        };

        // Run the hero name glitch + focus animation immediately
        const nameAnim    = initNameFocus('hero-name', 'name-focus-frame');
        const destroyDots = initDotField();

        if (!loaderBar || !loaderPct) {
            bodyEl.classList.remove('intro-loading');
            window.dispatchEvent(new Event('resize'));
            return;
        }

        /* ── Resources to preload ─────────────────────────── */
        const RESOURCES = [
            // Gallery photos
            './images/nishant_sih.jpg', './images/14.jpg',  './images/3.jpeg',
            './images/20.jpg',          './images/7.jpeg',   './images/18.jpg',
            './images/1.jpeg',          './images/24.jpg',   './images/11.jpg',
            './images/16.jpg',          './images/2.jpeg',   './images/22.jpg',
            './images/9.jpeg',          './images/15.jpg',   './images/26.jpg',
            './images/10.jpg',          './images/112.jpg',  './images/19.jpg',
            './images/23.jpg',          './images/13.jpg',   './images/25.jpg',
            './images/21.jpg',          './images/17.jpg',
            // Resume preview
            './images/res.jpeg',
            // Experience illustration
            './images/nishant_pixar.png',
            // Hero / key tech icons
            './icons/python.svg',       './icons/django.svg',      './icons/postgresql.svg',
            './icons/flutter.svg',      './icons/docker.svg',      './icons/redis.svg',
            './icons/javascript.svg',   './icons/html5.svg',       './icons/css3.svg',
            './icons/git.svg',          './icons/github.svg',      './icons/linux.svg',
            './icons/firebase.svg',     './icons/mysql.svg',       './icons/celery.svg',
            './icons/springboot.svg',   './icons/dart.svg',        './icons/gnubash.svg',
            './icons/postman.svg',      './icons/jsonwebtokens.svg','./icons/cloudflare.svg',
            './icons/opencv.svg',       './icons/numpy.svg',       './icons/pandas.svg',
            './icons/letsencrypt.svg',  './icons/githubcopilot.svg','./icons/ollama.svg',
        ];

        const TOTAL_RESOURCES = RESOURCES.length;
        let   loadedCount     = 0;
        let   allDone         = false;
        const MIN_MS          = 2500; // Paced to cycle through all 7 achievement lines (~350ms each)
        const startTime       = performance.now();

        // Kick off actual image preloading in parallel
        RESOURCES.forEach(src => {
            const img = new Image();
            img.onload = img.onerror = () => {
                loadedCount++;
                if (loadedCount >= TOTAL_RESOURCES) allDone = true;
            };
            img.src = src;
        });

        // Also wait for web fonts
        if (document.fonts) {
            document.fonts.ready.then(() => {
                // fonts are one implicit "resource"; count them done
                if (nameAnim) nameAnim.update();
            });
        }

        /* ── rAF tick — drives the bar each frame ─────────── */
        let displayed  = 0; // current displayed %
        let revealed   = false;

        const reveal = () => {
            if (revealed) return;
            revealed = true;
            // Always lock the final ready package state
            updateTerminalStream(INSTALL_LOGS.length - 1);

            // Snap remaining gap to 100% with a quick GSAP tween
            const snapObj = { v: displayed };
            gsap.to(snapObj, {
                v: 100,
                duration: 0.25,
                ease: 'power2.out',
                onUpdate: () => {
                    loaderBar.style.width  = `${snapObj.v}%`;
                    loaderPct.textContent  = `${Math.round(snapObj.v)}%`;
                },
                onComplete: () => {
                    setTimeout(() => {
                        bodyEl.classList.remove('intro-loading');
                        // Dispatch resize event to trigger layout calculations (like Masonry)
                        window.dispatchEvent(new Event('resize'));
                        if (window.ScrollTrigger) ScrollTrigger.refresh();
                        setTimeout(() => { if (nameAnim) nameAnim.update(); }, 400);
                        // Let CSS fade-out finish (0.6s), then kill the DotField loop
                        setTimeout(() => { if (destroyDots) destroyDots(); }, 600);
                    }, 200);
                }
            });
        };

        const tick = () => {
            if (revealed) return;

            const elapsed      = performance.now() - startTime;
            const timeProgress = Math.min(elapsed / MIN_MS, 1); // 0.0 -> 1.0

            // Step through all 9 stages sequentially based on elapsed time so NONE are skipped
            const stageIndex = Math.min(
                Math.floor(timeProgress * INSTALL_LOGS.length),
                INSTALL_LOGS.length - 1
            );
            updateTerminalStream(stageIndex);

            const resourceRatio = (loadedCount / TOTAL_RESOURCES);
            // Smooth target percentage: climbs steadily with time even on cached assets
            const target = (allDone && elapsed >= MIN_MS)
                ? 100
                : Math.min(timeProgress * 98, (resourceRatio * 0.25 + timeProgress * 0.75) * 98);

            // Smooth the displayed value — lerp toward target
            displayed += (target - displayed) * 0.14;
            if (target === 100 && displayed > 99) displayed = 100;

            loaderBar.style.width  = `${displayed}%`;
            loaderPct.textContent  = `${Math.round(displayed)}%`;

            if (displayed >= 99.5 && elapsed >= MIN_MS) {
                reveal();
            } else {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);

        // Hard fallback: force reveal if connection is slow
        setTimeout(() => reveal(), MIN_MS + 1000);
    };

    /* -----------------------------------------------
       CARD INTERACTION EFFECTS (MagicBento)
    ----------------------------------------------- */
    function isMobileDevice() {
        const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen = window.innerWidth <= 768;
        const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
        return (hasTouchScreen && isSmallScreen) || mobileRegex.test(navigator.userAgent.toLowerCase());
    }

    function initSingleCardEffect(card) {
        if (!card) return;

        // If it is a gallery item (.item-wrapper), target the inner image container (.item-img)
        // for spotlight and transforms to avoid breaking masonry layout positioning!
        const interactiveTarget = card.classList.contains('item-wrapper') 
            ? card.querySelector('.item-img') 
            : card;

        if (!interactiveTarget) return;

        // Programmatically inject spotlight element if not exists (prepended behind content)
        let spotlight = interactiveTarget.querySelector('.card-spotlight');
        if (!spotlight) {
            spotlight = document.createElement('div');
            spotlight.className = 'card-spotlight';
            if (card.classList.contains('vibe-tab')) {
                const clip = document.createElement('div');
                clip.className = 'card-spotlight-clip';
                clip.appendChild(spotlight);
                interactiveTarget.insertBefore(clip, interactiveTarget.firstChild);
            } else {
                interactiveTarget.insertBefore(spotlight, interactiveTarget.firstChild);
            }
        }

        const handleMouseLeave = () => {
            if (isMobileDevice()) return;

            // Reset tilt & magnetism on the interactiveTarget
            gsap.to(interactiveTarget, {
                x: 0,
                y: 0,
                rotateX: 0,
                rotateY: 0,
                duration: 0.5,
                ease: 'power3.out',
                overwrite: 'auto'
            });
        };

        const handleMouseMove = (e) => {
            if (isMobileDevice()) return;

            const rect = interactiveTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Update spotlight coordinates inside interactiveTarget (using CSS variables)
            interactiveTarget.style.setProperty('--glow-x', `${(x / rect.width) * 100}%`);
            interactiveTarget.style.setProperty('--glow-y', `${(y / rect.height) * 100}%`);

            // 3D Tilt calculation
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6; // max 6 deg tilt
            const rotateY = ((x - centerX) / centerX) * 6;  // max 6 deg tilt

            gsap.to(interactiveTarget, {
                rotateX,
                rotateY,
                duration: 0.2,
                ease: 'power2.out',
                transformPerspective: 1000,
                overwrite: 'auto'
            });

            // Magnetism calculation
            const magnetX = (x - centerX) * 0.04; // max 4% pull
            const magnetY = (y - centerY) * 0.04;

            gsap.to(interactiveTarget, {
                x: magnetX,
                y: magnetY,
                duration: 0.3,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        };

        card.addEventListener('mouseleave', handleMouseLeave);
        card.addEventListener('mousemove', handleMouseMove);
    }

    function initCardEffects() {
        const cards = document.querySelectorAll('.project-card, .edu-card, .achievement-card, .vibe-tab, .stat-card, .about-card, .timeline-item, .api-playground');
        if (!cards.length) return;

        cards.forEach(card => initSingleCardEffect(card));
    }

    /* -----------------------------------------------
       VIDEO LIGHTBOX
    ----------------------------------------------- */
    function initVideoLightbox() {
        const videoLightbox = document.getElementById('video-lightbox');
        const lightboxVideo = document.getElementById('lightbox-video');
        const videoCloseBtn = document.querySelector('.video-close-btn');
        const videoTriggers = document.querySelectorAll('.video-trigger');

        if (videoLightbox && lightboxVideo) {
            window.openVideoLightbox = (videoSrc, videoTitle) => {
                if (!videoLightbox || !lightboxVideo) return;
                lightboxVideo.src = videoSrc;
                const captionEl = document.getElementById('video-lightbox-caption');
                if (captionEl) captionEl.textContent = videoTitle || 'Video Demo';
                videoLightbox.classList.add('active');
                videoLightbox.setAttribute('aria-hidden', 'false');
                lightboxVideo.load();
                lightboxVideo.play().catch(err => {
                    console.log("Auto-play prevented or failed:", err);
                });
            };

            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('.video-trigger');
                if (trigger) {
                    e.preventDefault();
                    const videoSrc = trigger.getAttribute('data-video');
                    const videoTitle = trigger.getAttribute('data-title') || 'Video Demo';
                    window.openVideoLightbox(videoSrc, videoTitle);
                }
            });

            const closeVideoLightbox = () => {
                videoLightbox.classList.remove('active');
                videoLightbox.setAttribute('aria-hidden', 'true');
                // Pause and reset video
                lightboxVideo.pause();
                lightboxVideo.src = "";
            };

            if (videoCloseBtn) {
                videoCloseBtn.addEventListener('click', closeVideoLightbox);
            }

            videoLightbox.addEventListener('click', (e) => {
                if (e.target === videoLightbox) {
                    closeVideoLightbox();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && videoLightbox.classList.contains('active')) {
                    closeVideoLightbox();
                }
            });
        }
    }

    /* -----------------------------------------------
       FOOTER SUBSCRIBE FORM
    ----------------------------------------------- */
    function initFooterSubscribe() {
        const form = document.getElementById('subscribe-form');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('.memail');
            const messageEl = form.querySelector('.mchimp-message');
            if (!input || !messageEl) return;

            const email = input.value.trim();
            if (!email) {
                messageEl.textContent = 'Please enter an email address.';
                messageEl.className = 'mchimp-message error';
                messageEl.style.display = 'block';
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                messageEl.textContent = 'Please enter a valid email address.';
                messageEl.className = 'mchimp-message error';
                messageEl.style.display = 'block';
                return;
            }

            // Simulate form submission success
            messageEl.textContent = 'Thank you for subscribing!';
            messageEl.className = 'mchimp-message success';
            messageEl.style.display = 'block';
            input.value = '';

            // Auto-hide success message after 5 seconds
            setTimeout(() => {
                messageEl.style.transition = 'opacity 0.4s ease';
                messageEl.style.opacity = '0';
                setTimeout(() => {
                    messageEl.style.display = 'none';
                    messageEl.style.opacity = '1';
                }, 400);
            }, 5000);
        });
    }

    /* -----------------------------------------------
       DYNAMIC CYCLIST TEXT REVEAL BINDING
    ----------------------------------------------- */
    function initCyclistTextReveal() {
        const bike = document.querySelector('.footer_bg_two');
        const text = document.querySelector('.footer_center_reveal_text');
        if (!bike || !text) return;

        function updateReveal() {
            const bikeRect = bike.getBoundingClientRect();
            const textRect = text.getBoundingClientRect();

            if (textRect.width > 0) {
                // Measure bike's rear trailing wheel position with reduced delay offset
                const bikeRearX = bikeRect.left - 6;
                const textLeft = textRect.left;
                const textWidth = textRect.width;

                let progress = ((bikeRearX - textLeft) / textWidth) * 100;
                progress = Math.max(0, Math.min(100, progress));

                text.style.clipPath = `inset(0 ${100 - progress}% 0 0)`;
            }

            requestAnimationFrame(updateReveal);
        }

        requestAnimationFrame(updateReveal);
    }

    /* -----------------------------------------------
       REACT BITS COUNTUP COMPONENT INTEGRATION
       mode: "count", easing: easeOut (cubicBezier), trigger: "view",
       replayOnHover: true, format: "standard"
    ----------------------------------------------- */
    function initCountUp() {
        const cards = document.querySelectorAll('.stats-grid .stat-card');
        if (!cards.length) return;

        function cubicBezier(x1, y1, x2, y2) {
            return function(t) {
                if (t <= 0) return 0;
                if (t >= 1) return 1;
                let currentT = t;
                for (let i = 0; i < 6; i++) {
                    const currentX = 3 * (1 - currentT) * (1 - currentT) * currentT * x1 + 3 * (1 - currentT) * currentT * currentT * x2 + currentT * currentT * currentT;
                    const derivativeX = 3 * (1 - currentT) * (1 - currentT) * x1 + 6 * (1 - currentT) * currentT * (x2 - x1) + 3 * currentT * currentT * (1 - x2);
                    if (Math.abs(derivativeX) < 1e-6) break;
                    currentT -= (currentX - t) / derivativeX;
                }
                currentT = Math.min(1, Math.max(0, currentT));
                return 3 * (1 - currentT) * (1 - currentT) * currentT * y1 + 3 * (1 - currentT) * currentT * currentT * y2 + currentT * currentT * currentT;
            };
        }
        const easeOut = cubicBezier(0.33, 1, 0.68, 1);

        const runCountUp = (card, isReplay = false) => {
            const valEl = card.querySelector('.count-up-value');
            if (!valEl) return;

            const targetStr = card.getAttribute('data-count-target') || '0';
            const target = parseFloat(targetStr) || 0;
            const decimals = parseInt(card.getAttribute('data-decimals') ?? (targetStr.includes('.') ? targetStr.split('.')[1].length : 0), 10);
            const duration = 1600; // 1.6s
            const startTime = performance.now();
            const startVal = 0;

            if (card._isCountAnimating && !isReplay) return;
            if (card._countRafId) cancelAnimationFrame(card._countRafId);
            card._isCountAnimating = true;

            const step = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(1, Math.max(0, elapsed / duration));
                const easedProgress = easeOut(progress);
                const currentVal = startVal + (target - startVal) * easedProgress;

                valEl.textContent = currentVal.toFixed(decimals);

                if (progress < 1) {
                    card._countRafId = requestAnimationFrame(step);
                } else {
                    valEl.textContent = target.toFixed(decimals);
                    card._isCountAnimating = false;
                    card._countRafId = null;
                }
            };

            card._countRafId = requestAnimationFrame(step);
        };

        const triggerInitial = (card) => {
            if (document.body.classList.contains('intro-loading')) {
                const checkLoader = setInterval(() => {
                    if (!document.body.classList.contains('intro-loading')) {
                        clearInterval(checkLoader);
                        setTimeout(() => runCountUp(card, false), 200);
                    }
                }, 100);
            } else {
                runCountUp(card, false);
            }
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    triggerInitial(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        cards.forEach((card) => {
            observer.observe(card);

            card.addEventListener('mouseenter', () => {
                if (!card._isCountAnimating && !document.body.classList.contains('intro-loading')) {
                    runCountUp(card, true);
                }
            });
        });
    }

    /* ── Journey Timeline Curves (Unified Vertical Timeline with Sequential Reveal) ─── */
    function initJourneyTimeline() {
        const timeline = document.querySelector('.journey-timeline');
        if (!timeline) return;

        const path = timeline.querySelector('.journey-line-path');
        const items = Array.from(timeline.querySelectorAll('.journey-item'));
        const endMarker = timeline.querySelector('.journey-end-marker');
        const endDot = timeline.querySelector('.journey-end-dot');

        let isAnimated = false;
        let animTL = null;

        function getLengthAtY(targetY) {
            if (!path) return 0;
            const total = path.getTotalLength();
            let low = 0;
            let high = total;
            for (let i = 0; i < 20; i++) {
                const mid = (low + high) / 2;
                const pt = path.getPointAtLength(mid);
                if (pt.y < targetY) {
                    low = mid;
                } else {
                    high = mid;
                }
            }
            return (low + high) / 2;
        }

        function updatePath() {
            const dots = timeline.querySelectorAll('.journey-dot');
            if (!path || dots.length === 0) return;

            const containerRect = timeline.getBoundingClientRect();
            if (containerRect.width === 0 || containerRect.height === 0) return;

            const points = Array.from(dots).map(dot => {
                const r = dot.getBoundingClientRect();
                return {
                    x: r.left - containerRect.left + r.width / 2,
                    y: r.top - containerRect.top + r.height / 2
                };
            });

            if (points.length === 0) return;

            let endPoint = null;
            if (endDot) {
                const er = endDot.getBoundingClientRect();
                endPoint = {
                    x: er.left - containerRect.left + er.width / 2,
                    y: er.top - containerRect.top + er.height / 2
                };
            }

            const x = points[0].x;
            const topY = Math.max(0, points[0].y - 35);
            const waveW = 8.5;
            const curveH = 70;
            const leadTop = 18; // curve positioned near the start of each experience

            const createChicane = (yA, yB) => {
                const h = yB - yA;
                const cp1y = yA + h * 0.22;
                const cp2y = yA + h * 0.32;
                const midX = x + waveW;
                const midY = yA + h * 0.50;
                const cp3y = yA + h * 0.68;
                const cp4y = yA + h * 0.78;

                return ` C ${x.toFixed(1)} ${cp1y.toFixed(1)}, ${midX.toFixed(1)} ${cp2y.toFixed(1)}, ${midX.toFixed(1)} ${midY.toFixed(1)}` +
                       ` C ${midX.toFixed(1)} ${cp3y.toFixed(1)}, ${x.toFixed(1)} ${cp4y.toFixed(1)}, ${x.toFixed(1)} ${yB.toFixed(1)}`;
            };

            let d = `M ${x.toFixed(1)} ${topY.toFixed(1)} L ${x.toFixed(1)} ${points[0].y.toFixed(1)}`;

            // Experience 1: curve positioned near the start, then straight descent to dot 2
            for (let i = 0; i < points.length - 1; i++) {
                const p1 = points[i];
                const p2 = points[i + 1];
                const yA = p1.y + leadTop;
                const yB = Math.min(p2.y - 15, yA + curveH);

                d += ` L ${x.toFixed(1)} ${yA.toFixed(1)}`;
                d += createChicane(yA, yB);
                d += ` L ${x.toFixed(1)} ${p2.y.toFixed(1)}`;
            }

            // Experience 2: curve positioned near the start, then straight descent to hollow end dot
            const lastPoint = points[points.length - 1];
            if (endPoint && endPoint.y > lastPoint.y + leadTop + 20) {
                const yA = lastPoint.y + leadTop;
                const yB = Math.min(endPoint.y - 15, yA + curveH);

                d += ` L ${x.toFixed(1)} ${yA.toFixed(1)}`;
                d += createChicane(yA, yB);
                d += ` L ${x.toFixed(1)} ${endPoint.y.toFixed(1)}`;
            } else if (endPoint) {
                d += ` L ${endPoint.x.toFixed(1)} ${endPoint.y.toFixed(1)}`;
            }

            path.setAttribute('d', d);

            // If animation hasn't started yet, keep path hidden ready for animation
            if (!isAnimated && !animTL) {
                const len = path.getTotalLength();
                if (len > 0) {
                    path.style.strokeDasharray = `${len} ${len}`;
                    path.style.strokeDashoffset = `${len}`;
                }
            }
        }

        // Setup checkpoint-by-checkpoint scroll-triggered animation
        function setupAnimation() {
            if (!window.gsap) return;

            // Check reduced motion preference
            const visualCol = document.querySelector('.journey-visual-column');
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                isAnimated = true;
                if (visualCol) gsap.set(visualCol, { opacity: 1, y: 0 });
                return;
            }

            if (window.ScrollTrigger) {
                gsap.registerPlugin(ScrollTrigger);
            }

            if (visualCol) gsap.set(visualCol, { opacity: 0, y: 24 });

            // Set initial hidden states before animation triggers
            items.forEach((item) => {
                const dotWrap = item.querySelector('.journey-dot-wrap');
                const year = item.querySelector('.journey-year');
                const content = item.querySelector('.journey-content');
                if (dotWrap) gsap.set(dotWrap, { opacity: 0, scale: 0 });
                if (year) gsap.set(year, { opacity: 0, x: -14 });
                if (content) gsap.set(content, { opacity: 0, y: 24 });
            });

            if (endMarker) {
                const endDotWrap = endMarker.querySelector('.journey-dot-wrap');
                if (endDotWrap) gsap.set(endDotWrap, { opacity: 0, scale: 0 });
            }

            const state = {
                m1Done: false,
                m2Done: false,
                endDone: false
            };

            const runWithLoaderCheck = (fn) => {
                if (document.body.classList.contains('intro-loading')) {
                    const check = setInterval(() => {
                        if (!document.body.classList.contains('intro-loading')) {
                            clearInterval(check);
                            setTimeout(fn, 150);
                        }
                    }, 60);
                } else {
                    fn();
                }
            };

            const playJourneyAnimation = () => {
                if (isAnimated) return;
                isAnimated = true;

                updatePath();
                const totalLen = path.getTotalLength();
                if (totalLen <= 0) {
                    if (visualCol) gsap.set(visualCol, { opacity: 1, y: 0 });
                    items.forEach(item => {
                        const dotWrap = item.querySelector('.journey-dot-wrap');
                        const year = item.querySelector('.journey-year');
                        const content = item.querySelector('.journey-content');
                        if (dotWrap) gsap.set(dotWrap, { opacity: 1, scale: 1 });
                        if (year) gsap.set(year, { opacity: 1, x: 0 });
                        if (content) gsap.set(content, { opacity: 1, y: 0 });
                    });
                    if (endMarker) {
                        const endDotWrap = endMarker.querySelector('.journey-dot-wrap');
                        if (endDotWrap) gsap.set(endDotWrap, { opacity: 1, scale: 1 });
                    }
                    return;
                }

                const dots = timeline.querySelectorAll('.journey-dot');
                const containerRect = timeline.getBoundingClientRect();
                
                // Dot 1 offset along path
                const cp1Y = dots[0] ? (dots[0].getBoundingClientRect().top - containerRect.top + dots[0].getBoundingClientRect().height / 2) : 0;
                const cp1Len = cp1Y > 0 ? getLengthAtY(cp1Y) : 35;
                const offset1 = Math.max(0, totalLen - cp1Len);

                // Dot 2 offset along path
                const cp2Y = dots[1] ? (dots[1].getBoundingClientRect().top - containerRect.top + dots[1].getBoundingClientRect().height / 2) : 0;
                const cp2Len = cp2Y > 0 ? getLengthAtY(cp2Y) : totalLen * 0.72;
                const offset2 = Math.max(0, totalLen - cp2Len);

                const item0 = items[0];
                const dotWrap0 = item0 ? item0.querySelector('.journey-dot-wrap') : null;
                const year0 = item0 ? item0.querySelector('.journey-year') : null;
                const content0 = item0 ? item0.querySelector('.journey-content') : null;

                const item1 = items[1];
                const dotWrap1 = item1 ? item1.querySelector('.journey-dot-wrap') : null;
                const year1 = item1 ? item1.querySelector('.journey-year') : null;
                const content1 = item1 ? item1.querySelector('.journey-content') : null;

                const endDotWrap = endMarker ? endMarker.querySelector('.journey-dot-wrap') : null;

                const tl = gsap.timeline({
                    onComplete: () => {
                        path.style.strokeDasharray = '';
                        path.style.strokeDashoffset = '';
                        if (visualCol) gsap.set(visualCol, { clearProps: 'all' });
                        items.forEach(item => {
                            const content = item.querySelector('.journey-content');
                            if (content) gsap.set(content, { clearProps: 'all' });
                        });
                    }
                });

                // 1. Left visual column enters smoothly
                if (visualCol) {
                    tl.to(visualCol, {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    }, 0);
                }

                // 2. Stroke begins drawing immediately from top to first checkpoint dot
                tl.to(path, {
                    strokeDashoffset: offset1,
                    duration: 0.35,
                    ease: 'power2.out'
                }, 0.05);

                // 3. Dot 1 pops open & First experience card slides into place
                if (dotWrap0) {
                    tl.to(dotWrap0, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(2)' }, '-=0.12');
                }
                if (year0) {
                    tl.to(year0, { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' }, '<0.05');
                }
                if (content0) {
                    tl.to(content0, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }, '-=0.15');
                }

                // 4. Line continues seamlessly without pausing through S-chicane to Dot 2
                tl.to(path, {
                    strokeDashoffset: offset2,
                    duration: 0.48,
                    ease: 'power1.inOut'
                }, '-=0.15');

                // 5. Dot 2 pops open & Second experience card slides into place
                if (dotWrap1) {
                    tl.to(dotWrap1, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(2)' }, '-=0.12');
                }
                if (year1) {
                    tl.to(year1, { opacity: 1, x: 0, duration: 0.28, ease: 'power2.out' }, '<0.05');
                }
                if (content1) {
                    tl.to(content1, { opacity: 1, y: 0, duration: 0.42, ease: 'power2.out' }, '-=0.15');
                }

                // 6. Line finishes down to End marker
                tl.to(path, {
                    strokeDashoffset: 0,
                    duration: 0.32,
                    ease: 'power1.out'
                }, '-=0.1');

                if (endDotWrap) {
                    tl.to(endDotWrap, { opacity: 1, scale: 1, duration: 0.28, ease: 'back.out(2)' }, '-=0.12');
                }
            };

            const triggerTarget = document.querySelector('.journey-layout-wrapper') || timeline;

            // Register scroll trigger for experience journey
            if (window.ScrollTrigger) {
                ScrollTrigger.create({
                    trigger: triggerTarget,
                    start: 'top 88%',
                    once: true,
                    onEnter: () => runWithLoaderCheck(playJourneyAnimation)
                });
            } else if (window.IntersectionObserver) {
                const obs = new IntersectionObserver((entries) => {
                    entries.forEach((e) => {
                        if (e.isIntersecting) {
                            runWithLoaderCheck(playJourneyAnimation);
                            obs.disconnect();
                        }
                    });
                }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });
                obs.observe(triggerTarget);
            } else {
                runWithLoaderCheck(playJourneyAnimation);
            }
        }

        updatePath();
        setupAnimation();

        window.addEventListener('resize', () => {
            if (animTL && animTL.isActive()) {
                animTL.progress(1);
            }
            updatePath();
        });

        if (window.ResizeObserver) {
            const ro = new ResizeObserver(() => updatePath());
            ro.observe(timeline);
        }

        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(updatePath);
        }

        setTimeout(updatePath, 200);
        setTimeout(updatePath, 800);
    }

    /* ── Designed Section Title Separator ─── */
    function initSectionTitleSeparators() {
        const SVG_TEMPLATE = `
            <path class="section-title-branch branch-left" d="" fill="none" />
            <path class="section-title-branch branch-right" d="" fill="none" />
            <circle class="section-title-node node-ring-left" cx="0" cy="0" r="5" />
            <circle class="section-title-node node-ring-right" cx="0" cy="0" r="5" />
            <circle class="section-title-node node-dot-left" cx="0" cy="0" r="4.5" />
            <circle class="section-title-node node-dot-right" cx="0" cy="0" r="4.5" />
            <g class="section-title-sparkle-anchor" transform="translate(0, 0)">
                <g class="section-title-sparkle-inner">
                    <line class="sparkle-ray" x1="-9" y1="-9" x2="-16" y2="-16" stroke="#816cf8" stroke-width="2" stroke-linecap="round" />
                    <line class="sparkle-ray" x1="9" y1="-9" x2="16" y2="-16" stroke="#816cf8" stroke-width="2" stroke-linecap="round" />
                    <line class="sparkle-ray" x1="-9" y1="9" x2="-16" y2="16" stroke="#816cf8" stroke-width="2" stroke-linecap="round" />
                    <line class="sparkle-ray" x1="9" y1="9" x2="16" y2="16" stroke="#816cf8" stroke-width="2" stroke-linecap="round" />
                    <path class="sparkle-star" d="M 0 -15 C 2.5 -5.5, 5.5 -2.5, 15 0 C 5.5 2.5, 2.5 5.5, 0 15 C -2.5 5.5, -5.5 2.5, -15 0 C -5.5 -2.5, -2.5 -5.5, 0 -15 Z" fill="#705cf6" />
                </g>
            </g>
        `;

        // Auto-wrap any unwrapped section-title in section-title-graphic-wrap if needed
        document.querySelectorAll('.section-title').forEach((titleEl) => {
            if (!titleEl.closest('.section-title-graphic-wrap')) {
                const wrap = document.createElement('div');
                wrap.className = 'section-title-graphic-wrap';
                titleEl.parentNode.insertBefore(wrap, titleEl);
                wrap.appendChild(titleEl);
            }
        });

        const wraps = Array.from(document.querySelectorAll('.section-title-graphic-wrap'));
        if (wraps.length === 0) return;

        wraps.forEach((wrap) => {
            let svg = wrap.querySelector('.section-title-svg');
            if (!svg) {
                svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('class', 'section-title-svg');
                svg.setAttribute('aria-hidden', 'true');
                svg.innerHTML = SVG_TEMPLATE;
                wrap.insertBefore(svg, wrap.firstChild);
            }

            const title = wrap.querySelector('.section-title');
            const branchLeft = wrap.querySelector('.branch-left');
            const branchRight = wrap.querySelector('.branch-right');
            const ringLeft = wrap.querySelector('.node-ring-left');
            const ringRight = wrap.querySelector('.node-ring-right');
            const dotLeft = wrap.querySelector('.node-dot-left');
            const dotRight = wrap.querySelector('.node-dot-right');
            const sparkleAnchor = wrap.querySelector('.section-title-sparkle-anchor');
            const sparkleInner = wrap.querySelector('.section-title-sparkle-inner');
            const star = wrap.querySelector('.sparkle-star');
            const rays = Array.from(wrap.querySelectorAll('.sparkle-ray'));
            const section = wrap.closest('.section') || wrap.parentElement || wrap;

            // Elements below the section title wrap that should animate sequentially after the divider
            const belowElements = Array.from(section.children).filter(el =>
                el !== wrap &&
                !el.classList.contains('journey-timeline') &&
                !el.classList.contains('journey-layout-wrapper') &&
                !el.classList.contains('section-title-svg') &&
                !el.classList.contains('section-title')
            );

            if (!title || !svg || !branchLeft || !branchRight) return;

            let isAnimated = false;
            let animTL = null;

            function updateGeometry() {
                const wrapRect = wrap.getBoundingClientRect();
                const titleRect = title.getBoundingClientRect();
                if (wrapRect.width === 0 || titleRect.width === 0) return;

                const centerX = wrapRect.width / 2;
                const isMobile = wrapRect.width < 640;

                // Remove any active GSAP translateY transform so geometry is always computed on the true resting position
                const currentTitleY = (window.gsap && gsap.getProperty(title, "y")) || 0;
                const unshiftedTitleBottom = titleRect.bottom - currentTitleY;
                const titleBottomRel = unshiftedTitleBottom - wrapRect.top;

                // Even vertical spacing between Title, Line Divider (sparkle/dip), and Subtitle:
                // Total space between Title bottom and Subtitle top is ~62px desktop / ~50px mobile.
                // Center dip & sparkle are positioned at exactly half of this distance:
                // 34px desktop / 26px mobile below Title bottom.
                const dipY = titleBottomRel + (isMobile ? 26 : 34);
                const cradleDepth = isMobile ? 18 : 20;
                const baseLineY = dipY - cradleDepth;

                const halfTitle = titleRect.width / 2;

                // Center sparkle geometry: 30px wide star with 8.5px clean gap before lines start
                const starTip = 14.5;
                const starGap = 8.5;
                const lineStartLeftX = centerX - starTip - starGap; // ~ centerX - 23
                const lineStartRightX = centerX + starTip + starGap; // ~ centerX + 23

                // Outer terminal solid dots: capped max-width so separator stays compact and never over-stretches
                const maxLineWidth = isMobile ? wrapRect.width - 32 : Math.min(wrapRect.width - 48, 960);
                const dotLeftX = centerX - maxLineWidth / 2;
                const dotRightX = centerX + maxLineWidth / 2;

                // Bounded cradle dip span: keeps the S-curve tight, steep, and elegant like the short titles
                // Never allow the cradle dip to over-stretch into a flat saggy line on wide titles
                const cradleDipSpan = isMobile ? Math.min(Math.max(halfTitle * 0.7, 85), 115) : Math.min(Math.max(halfTitle * 0.55, 105), 140);
                const sCurveTopLeftX = centerX - cradleDipSpan;
                const sCurveTopRightX = centerX + cradleDipSpan;

                // Hollow rings placed outside the cradle curve with balanced wing clearance
                const ringDistFromCurve = isMobile ? 18 : Math.min(38, (dotRightX - sCurveTopRightX) * 0.22);
                const ringLeftX = Math.max(dotLeftX + 36, sCurveTopLeftX - ringDistFromCurve);
                const ringRightX = Math.min(dotRightX - 36, sCurveTopRightX + ringDistFromCurve);

                // Bottom of S-curve reaches dip level smoothly
                const sCurveBotLeftX = Math.min(lineStartLeftX - 25, sCurveTopLeftX + (lineStartLeftX - sCurveTopLeftX) * 0.55);
                const sCurveBotRightX = Math.max(lineStartRightX + 25, sCurveTopRightX - (sCurveTopRightX - lineStartRightX) * 0.55);

                const flatLeftX = Math.min(lineStartLeftX, sCurveBotLeftX);
                const flatRightX = Math.max(lineStartRightX, sCurveBotRightX);

                // Position the circular nodes with fixed cx, cy and radial sizing
                if (ringLeft) {
                    ringLeft.setAttribute('cx', ringLeftX.toFixed(1));
                    ringLeft.setAttribute('cy', baseLineY.toFixed(1));
                    if (isAnimated) ringLeft.setAttribute('r', '5');
                }
                if (ringRight) {
                    ringRight.setAttribute('cx', ringRightX.toFixed(1));
                    ringRight.setAttribute('cy', baseLineY.toFixed(1));
                    if (isAnimated) ringRight.setAttribute('r', '5');
                }
                if (dotLeft) {
                    dotLeft.setAttribute('cx', dotLeftX.toFixed(1));
                    dotLeft.setAttribute('cy', baseLineY.toFixed(1));
                    if (isAnimated) dotLeft.setAttribute('r', '4.5');
                }
                if (dotRight) {
                    dotRight.setAttribute('cx', dotRightX.toFixed(1));
                    dotRight.setAttribute('cy', baseLineY.toFixed(1));
                    if (isAnimated) dotRight.setAttribute('r', '4.5');
                }

                // Position the center sparkle anchor permanently at (centerX, dipY)
                if (sparkleAnchor) {
                    sparkleAnchor.setAttribute('transform', `translate(${centerX.toFixed(1)}, ${dipY.toFixed(1)})`);
                }

                // S-curve descent control points (smooth horizontal tangents at both ends)
                const sCurveSpanL = flatLeftX - sCurveTopLeftX;
                const cp1x = (flatLeftX - sCurveSpanL * 0.45).toFixed(1);
                const cp1y = dipY.toFixed(1);
                const cp2x = (sCurveTopLeftX + sCurveSpanL * 0.45).toFixed(1);
                const cp2y = baseLineY.toFixed(1);

                // Left branch: starts at (lineStartLeftX, dipY), runs horizontally through flat trough,
                // S-curves up to (sCurveTopLeftX, baseLineY), then runs horizontally through hollow ring to dotLeftX
                const dLeft = `M ${lineStartLeftX.toFixed(1)} ${dipY.toFixed(1)} ` +
                              `L ${flatLeftX.toFixed(1)} ${dipY.toFixed(1)} ` +
                              `C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${sCurveTopLeftX.toFixed(1)} ${baseLineY.toFixed(1)} ` +
                              `L ${dotLeftX.toFixed(1)} ${baseLineY.toFixed(1)}`;
                branchLeft.setAttribute('d', dLeft);

                // Right branch: symmetrical
                const sCurveSpanR = sCurveTopRightX - flatRightX;
                const cp3x = (flatRightX + sCurveSpanR * 0.45).toFixed(1);
                const cp3y = dipY.toFixed(1);
                const cp4x = (sCurveTopRightX - sCurveSpanR * 0.45).toFixed(1);
                const cp4y = baseLineY.toFixed(1);

                const dRight = `M ${lineStartRightX.toFixed(1)} ${dipY.toFixed(1)} ` +
                               `L ${flatRightX.toFixed(1)} ${dipY.toFixed(1)} ` +
                               `C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${sCurveTopRightX.toFixed(1)} ${baseLineY.toFixed(1)} ` +
                               `L ${dotRightX.toFixed(1)} ${baseLineY.toFixed(1)}`;
                branchRight.setAttribute('d', dRight);

                // If not yet animated, keep paths hidden ready for animation
                if (!isAnimated && !animTL) {
                    const lenL = branchLeft.getTotalLength();
                    const lenR = branchRight.getTotalLength();
                    if (lenL > 0) {
                        branchLeft.style.strokeDasharray = `${lenL} ${lenL}`;
                        branchLeft.style.strokeDashoffset = `${lenL}`;
                    }
                    if (lenR > 0) {
                        branchRight.style.strokeDasharray = `${lenR} ${lenR}`;
                        branchRight.style.strokeDashoffset = `${lenR}`;
                    }
                }
            }

            function setupAnimation() {
                if (!window.gsap) return;

                if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                    isAnimated = true;
                    return;
                }

                // Initial hidden states: title + separator elements
                gsap.set(title, { opacity: 0, y: 16 });
                if (star) gsap.set(star, { opacity: 0, scale: 0, transformOrigin: '0px 0px' });
                if (rays.length > 0) gsap.set(rays, { opacity: 0, scale: 0, transformOrigin: '0px 0px' });
                if (ringLeft) { gsap.set(ringLeft, { opacity: 0 }); ringLeft.setAttribute('r', '0'); }
                if (ringRight) { gsap.set(ringRight, { opacity: 0 }); ringRight.setAttribute('r', '0'); }
                if (dotLeft) { gsap.set(dotLeft, { opacity: 0 }); dotLeft.setAttribute('r', '0'); }
                if (dotRight) { gsap.set(dotRight, { opacity: 0 }); dotRight.setAttribute('r', '0'); }

                // Initial hidden states: below elements (subtitle and section content)
                if (belowElements.length > 0) {
                    gsap.set(belowElements, { opacity: 0, y: 22 });
                }

                const playAnimation = () => {
                    if (isAnimated) return;
                    isAnimated = true;

                    updateGeometry();

                    const lenL = branchLeft.getTotalLength();
                    const lenR = branchRight.getTotalLength();
                    if (lenL <= 0 || lenR <= 0) {
                        gsap.set([title, star], { opacity: 1, scale: 1, y: 0 });
                        if (rays.length > 0) gsap.set(rays, { opacity: 1, scale: 1 });
                        if (dotLeft) { dotLeft.setAttribute('r', '4.5'); gsap.set(dotLeft, { opacity: 1 }); }
                        if (dotRight) { dotRight.setAttribute('r', '4.5'); gsap.set(dotRight, { opacity: 1 }); }
                        if (ringLeft) { ringLeft.setAttribute('r', '5'); gsap.set(ringLeft, { opacity: 1 }); }
                        if (ringRight) { ringRight.setAttribute('r', '5'); gsap.set(ringRight, { opacity: 1 }); }
                        if (belowElements.length > 0) {
                            gsap.to(belowElements, { opacity: 1, y: 0, duration: 0.5, clearProps: 'all' });
                        }
                        return;
                    }

                    animTL = gsap.timeline({
                        onComplete: () => {
                            branchLeft.style.strokeDasharray = '';
                            branchLeft.style.strokeDashoffset = '';
                            branchRight.style.strokeDasharray = '';
                            branchRight.style.strokeDashoffset = '';
                            if (dotLeft) dotLeft.setAttribute('r', '4.5');
                            if (dotRight) dotRight.setAttribute('r', '4.5');
                            if (ringLeft) ringLeft.setAttribute('r', '5');
                            if (ringRight) ringRight.setAttribute('r', '5');
                            if (belowElements.length > 0) {
                                gsap.set(belowElements, { clearProps: 'all' });
                            }
                            animTL = null;

                            // Dispatch resize event if gallery inside
                            if (section.id === 'gallery' || section.querySelector('.masonry-container')) {
                                window.dispatchEvent(new Event('resize'));
                            }
                        }
                    });

                    // 1. Title fades and slides up into place (snappy)
                    animTL.to(title, {
                        opacity: 1,
                        y: 0,
                        duration: 0.3,
                        ease: 'power2.out'
                    }, 0);

                    // 2. "the star appears" - Center diamond star pops in first
                    if (star) {
                        animTL.to(star, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.24,
                            ease: 'back.out(2)'
                        }, 0.1);
                    }

                    // 3. "then those 4 lines" - The 4 radiating diagonal rays burst out from behind the star
                    if (rays.length > 0) {
                        animTL.to(rays, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.18,
                            stagger: 0.02,
                            ease: 'back.out(2)'
                        }, 0.22);
                    }

                    // 4. "then line draws in a smooth way." - Symmetrical line branches smoothly draw outward from center dip
                    animTL.to([branchLeft, branchRight], {
                        strokeDashoffset: 0,
                        duration: 0.48,
                        ease: 'power1.out'
                    }, 0.3);

                    // 5. Hollow rings pop open cleanly without lateral jitter as lines reach them
                    if (ringLeft && ringRight) {
                        animTL.to([ringLeft, ringRight], {
                            opacity: 1,
                            attr: { r: 5 },
                            duration: 0.2,
                            ease: 'power2.out'
                        }, 0.44);
                    }

                    // 6. Outer solid terminal dots pop in at ends without jitter (pure radial expansion from fixed cx, cy)
                    if (dotLeft && dotRight) {
                        animTL.to([dotLeft, dotRight], {
                            opacity: 1,
                            attr: { r: 4.5 },
                            duration: 0.2,
                            ease: 'power2.out'
                        }, 0.58);
                    }

                    // 7. ANIMATION AND LOADING HAPPEN TOGETHER:
                    // Subtitle and section content animate IN PARALLEL with the line draw!
                    if (belowElements.length > 0) {
                        animTL.to(belowElements, {
                            opacity: 1,
                            y: 0,
                            duration: 0.42,
                            stagger: 0.08,
                            ease: 'power2.out',
                            clearProps: 'all'
                        }, 0.32);
                    }
                };

                const triggerWhenReady = () => {
                    if (document.body.classList.contains('intro-loading')) {
                        const checkLoader = setInterval(() => {
                            if (!document.body.classList.contains('intro-loading')) {
                                clearInterval(checkLoader);
                                setTimeout(playAnimation, 150);
                            }
                        }, 60);
                    } else {
                        playAnimation();
                    }
                };

                // Check if already in viewport (e.g. above the fold or on hash load)
                const checkInView = () => {
                    const r = wrap.getBoundingClientRect();
                    return r.top < window.innerHeight * 0.85 && r.bottom > 0;
                };

                if (window.ScrollTrigger) {
                    ScrollTrigger.create({
                        trigger: wrap,
                        start: 'top 82%',
                        once: true,
                        onEnter: () => triggerWhenReady()
                    });
                } else if (window.IntersectionObserver) {
                    const obs = new IntersectionObserver((entries) => {
                        entries.forEach((entry) => {
                            if (entry.isIntersecting) {
                                triggerWhenReady();
                                obs.disconnect();
                            }
                        });
                    }, { threshold: 0.1, rootMargin: '0px 0px -15% 0px' });
                    obs.observe(wrap);
                } else {
                    if (checkInView()) {
                        triggerWhenReady();
                    } else {
                        const onScroll = () => {
                            if (checkInView()) {
                                triggerWhenReady();
                                window.removeEventListener('scroll', onScroll);
                            }
                        };
                        window.addEventListener('scroll', onScroll, { passive: true });
                    }
                }
            }

            updateGeometry();
            setupAnimation();

            window.addEventListener('resize', () => {
                if (animTL && animTL.isActive()) {
                    animTL.progress(1);
                }
                updateGeometry();
            });

            if (window.ResizeObserver) {
                const ro = new ResizeObserver(() => updateGeometry());
                ro.observe(wrap);
            }

            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(updateGeometry);
            }

            setTimeout(updateGeometry, 200);
            setTimeout(updateGeometry, 800);
        });
    }

    initIntroLoader();
    initVibeLabs();
    initCardEffects();
    initVideoLightbox();
    initFooterSubscribe();
    initCyclistTextReveal();
    initCountUp();
    initJourneyTimeline();
    initSectionTitleSeparators();

} catch (err) {
    console.error('Portfolio script error:', err);
}
