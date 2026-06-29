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
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);

            if (sparkCanvas) {
                sparkCanvas.width = window.innerWidth * dpr;
                sparkCanvas.height = window.innerHeight * dpr;
                if (sparkCtx) sparkCtx.scale(dpr, dpr);
            }
        };

        const drawGrid = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const dpr = window.devicePixelRatio || 1;
            const logicalWidth = canvas.width / dpr;
            const logicalHeight = canvas.height / dpr;

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
            { id: "24", img: "./images/17.jpg", title: "SIH 2024 — Grand Finale, Team4i at Work", height: 520 }
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

                    if (scaleOnHover) {
                        el.addEventListener('mouseenter', () => {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(el, { scale: hoverScale, duration: 0.3, ease: 'power2.out', force3D: true });
                            } else {
                                el.style.transform = `translate(${item.x}px, ${item.y}px) scale(${hoverScale})`;
                            }
                        });
                        el.addEventListener('mouseleave', () => {
                            if (typeof gsap !== 'undefined') {
                                gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out', force3D: true });
                            } else {
                                el.style.transform = `translate(${item.x}px, ${item.y}px) scale(1)`;
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
                        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
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
                }
            });
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

        // Listen to window resizing to update scale proportions dynamically
        window.addEventListener('resize', updateIframeScale);

        const preloadRemainingTabs = () => {
            setTimeout(() => {
                tabs.forEach(t => {
                    const url = t.dataset.url;
                    if (!iframePool[url]) getOrCreateIframe(url);
                });
            }, 2500); // Wait 2.5s after first load to trigger background loads
        };

        // Lazy initialize first iframe once Vibe Labs section is visible
        const lazyObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !firstLoadTriggered) {
                firstLoadTriggered = true;
                const activeTab = section.querySelector('.vibe-tab.active') || tabs[0];
                if (activeTab) {
                    switchProject(activeTab);
                    setTimeout(updateIframeScale, 100);
                    preloadRemainingTabs();
                }
                lazyObserver.disconnect();
            }
        }, { threshold: 0.1 });
        lazyObserver.observe(section);
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
                    word.style.filter = 'blur(0px)';
                } else {
                    word.classList.remove('active');
                    word.style.filter = 'blur(4px)';
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
       INTRO LOADER SEQUENCE — REAL RESOURCE PRELOADER
       ----------------------------------------------- */
    const initIntroLoader = () => {
        const loaderBar     = document.getElementById('loader-bar');
        const loaderPct     = document.getElementById('loader-percentage');
        const bodyEl        = document.body;

        // Run the hero name glitch + focus animation immediately
        const nameAnim = initNameFocus('hero-name', 'name-focus-frame');

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
        const MIN_MS          = 5000; // 5 seconds minimum
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
            // Snap remaining gap to 100% with a quick GSAP tween
            const snapObj = { v: displayed };
            gsap.to(snapObj, {
                v: 100,
                duration: 0.45,
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
                        setTimeout(() => { if (nameAnim) nameAnim.update(); }, 600);
                    }, 350);
                }
            });
        };

        const tick = () => {
            if (revealed) return;

            const elapsed      = performance.now() - startTime;
            const timePct      = Math.min(elapsed / MIN_MS, 1) * 100;          // 0-100 over 5 s
            const resourcePct  = (loadedCount / TOTAL_RESOURCES) * 100;        // actual load %

            // Blend: resources drive 55%, time drives 45%
            // Never exceed 97% until BOTH time AND resources are complete
            const blended  = resourcePct * 0.55 + timePct * 0.45;
            const target   = (allDone && elapsed >= MIN_MS) ? 100 : Math.min(blended, 97);

            // Smooth the displayed value — lerp toward target, never go backwards
            displayed += (target - displayed) * 0.04;
            if (target === 100 && displayed > 99) displayed = 100;

            loaderBar.style.width  = `${displayed}%`;
            loaderPct.textContent  = `${Math.round(displayed)}%`;

            if (displayed >= 99.9) {
                reveal();
            } else {
                requestAnimationFrame(tick);
            }
        };

        requestAnimationFrame(tick);

        // Hard fallback: force reveal at 7 s even on very slow connections
        setTimeout(() => reveal(), MIN_MS + 2000);
    };

    initIntroLoader();
    initVibeLabs();

} catch (err) {
    console.error('Portfolio script error:', err);
}
