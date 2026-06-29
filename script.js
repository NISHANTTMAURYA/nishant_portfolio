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
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            if (sparkCanvas) {
                sparkCanvas.width = window.innerWidth;
                sparkCanvas.height = window.innerHeight;
            }
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
            { id: "1", img: "./images/nishant_sih.jpg", title: "Smart India Hackathon Spotlight", height: 550 },
            { id: "2", img: "./images/14.jpg", title: "Hackathon Event", height: 420 },
            { id: "3", img: "./images/3.jpeg", title: "Project Presentation", height: 600 },
            { id: "4", img: "./images/20.jpg", title: "Team Moment", height: 480 },
            { id: "5", img: "./images/7.jpeg", title: "Development Hackathon", height: 520 },
            { id: "6", img: "./images/18.jpg", title: "Competition Showcase", height: 450 },
            { id: "7", img: "./images/1.jpeg", title: "Team Photo", height: 580 },
            { id: "8", img: "./images/24.jpg", title: "Award Presentation", height: 400 },
            { id: "9", img: "./images/11.jpg", title: "Technical Demo", height: 500 },
            { id: "10", img: "./images/16.jpg", title: "Engineering Team", height: 460 },
            { id: "11", img: "./images/2.jpeg", title: "Award Ceremony", height: 540 },
            { id: "12", img: "./images/22.jpg", title: "Project Pitch", height: 430 },
            { id: "13", img: "./images/9.jpeg", title: "Team Achievement", height: 510 },
            { id: "14", img: "./images/15.jpg", title: "Coding Session", height: 470 },
            { id: "15", img: "./images/26.jpg", title: "Hackathon Celebration", height: 560 },
            { id: "16", img: "./images/10.jpg", title: "Team Collaboration", height: 440 },
            { id: "17", img: "./images/112.jpg", title: "Event Highlights", height: 490 },
            { id: "18", img: "./images/19.jpg", title: "Project Demo", height: 530 },
            { id: "19", img: "./images/23.jpg", title: "Tech Showcase", height: 410 },
            { id: "20", img: "./images/13.jpg", title: "Team Snapshot", height: 480 },
            { id: "22", img: "./images/21.jpg", title: "Team Discussion", height: 450 },
            { id: "24", img: "./images/17.jpg", title: "Competition Finale", height: 520 }
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
            const queries = ['(min-width:1500px)', '(min-width:1000px)', '(min-width:600px)', '(min-width:400px)'];
            const values = [5, 4, 3, 2];
            const idx = queries.findIndex(q => window.matchMedia(q).matches);
            return idx !== -1 ? values[idx] : 1;
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
                    imgDiv.style.backgroundImage = `url(${item.img})`;

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

        // Add target class dynamically to links, buttons, cards, gallery items, and cubes grid
        document.querySelectorAll('a, button, [role="button"], .project-card, .contact-link, .api-btn, .item-wrapper, .lightbox-close, #cubes-wrapper').forEach(el => {
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

        const xTo = gsap.quickTo(cursor, "x", { duration: 0.08, ease: "power3.out" });
        const yTo = gsap.quickTo(cursor, "y", { duration: 0.08, ease: "power3.out" });

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
                cube.appendChild(faceDiv);
            });
            scene.appendChild(cube);
        }

        let raf = null;
        let idleTimer = null;
        let userActive = false;
        let cubes = [];
        const initCubeReferences = () => {
            cubes = Array.from(scene.querySelectorAll('.cube')).map(cube => ({
                el: cube,
                row: +cube.dataset.row,
                col: +cube.dataset.col,
                setX: gsap.quickSetter(cube, 'rotateX', 'deg'),
                setY: gsap.quickSetter(cube, 'rotateY', 'deg'),
                faces: Array.from(cube.querySelectorAll('.cube-face'))
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
                    const pct = 1 - dist / radius;
                    const angle = pct * maxAngle;
                    c.setX(-angle);
                    c.setY(angle);
                } else {
                    c.setX(0);
                    c.setY(0);
                }
            });
        };

        const resetAll = () => {
            cubes.forEach(c => {
                gsap.to(c.el, { duration: leaveDur, rotateX: 0, rotateY: 0, ease: 'power3.out', overwrite: true });
            });
        };

        const marquee = document.getElementById('skills-marquee');
        let allMarqueeItems = [];
        let techToMarqueeItems = {};
        let oneSetWidth = 0;

        const cacheItemPositions = () => {
            if (!marquee) return;
            allMarqueeItems = Array.from(marquee.querySelectorAll('.marquee-item')).map(el => ({
                el,
                tech: el.dataset.tech,
                left: el.offsetLeft,
                width: el.offsetWidth
            }));
        };

        const updateLayout = () => {
            if (!marquee || !allMarqueeItems.length) return;
            const containerWidth = marquee.clientWidth;
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
                if (item.el === closestEl) item.el.classList.add('active-highlight');
                else item.el.classList.remove('active-highlight');
            });

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

            [0, 1, 2].forEach(copyIdx => {
                techsWithSlug.forEach(tech => {
                    const item = document.createElement('div');
                    item.className = 'marquee-item';
                    item.dataset.tech = tech.name;
                    item.dataset.copy = copyIdx;
                    item.textContent = tech.name;
                    item.addEventListener('click', () => {
                        const idx = TECH_ITEMS.findIndex(t => t.name === tech.name);
                        if (idx !== -1) triggerRippleAt(Math.floor(idx / gridCols), idx % gridCols);
                    });
                    track.appendChild(item);
                });
            });

            marquee.appendChild(track);

            requestAnimationFrame(() => {
                const items = marquee.querySelectorAll('.marquee-item');
                const setSize = items.length / 3;
                if (setSize > 0) {
                    const firstItem = items[0];
                    const lastFirstSetItem = items[setSize - 1];
                    oneSetWidth = (lastFirstSetItem.offsetLeft + lastFirstSetItem.offsetWidth) - firstItem.offsetLeft;
                    marquee.scrollLeft = oneSetWidth;
                }
                cacheItemPositions();
                
                techToMarqueeItems = {};
                allMarqueeItems.forEach(item => {
                    if (!techToMarqueeItems[item.tech]) techToMarqueeItems[item.tech] = [];
                    techToMarqueeItems[item.tech].push(item);
                });
                updateLayout();
            });

            window.addEventListener('resize', () => {
                const items = marquee.querySelectorAll('.marquee-item');
                const setSize = items.length / 3;
                if (setSize > 0) {
                    const firstItem = items[0];
                    const lastFirstSetItem = items[setSize - 1];
                    oneSetWidth = (lastFirstSetItem.offsetLeft + lastFirstSetItem.offsetWidth) - firstItem.offsetLeft;
                }
                cacheItemPositions();
                updateLayout();
            });
            marquee.addEventListener('scroll', updateLayout, { passive: true });
        }

        let lastTargetTech = null;
        const scrollMarqueeTo = (rowHit, colHit) => {
            if (!marquee) return;
            const idx = Math.floor(rowHit) * gridCols + Math.floor(colHit);
            const tech = TECH_ITEMS[Math.min(idx, TECH_ITEMS.length - 1)];
            if (!tech || !tech.slug || !tech.name || lastTargetTech === tech.name) return;
            lastTargetTech = tech.name;

            const allCopies = techToMarqueeItems[tech.name] || [];
            if (allCopies.length === 0) return;
            const currentCenter = marquee.scrollLeft + marquee.clientWidth / 2;
            let bestItem = allCopies[0];
            let bestDist = Infinity;
            allCopies.forEach(item => {
                const itemCenter = item.left + item.width / 2;
                const d = Math.abs(itemCenter - currentCenter);
                if (d < bestDist) { bestDist = d; bestItem = item; }
            });
            const targetScroll = bestItem.left + bestItem.width / 2 - marquee.clientWidth / 2;
            gsap.to(marquee, { scrollLeft: targetScroll, duration: 0.4, ease: 'power2.out', overwrite: true, onUpdate: updateLayout });
        };

        const onPointerMove = e => {
            userActive = true;
            if (idleTimer) clearTimeout(idleTimer);
            const rect = scene.getBoundingClientRect();
            const colCenter = (e.clientX - rect.left) / (rect.width / gridCols);
            const rowCenter = (e.clientY - rect.top) / (rect.height / gridRows);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                tiltAt(rowCenter, colCenter);
                scrollMarqueeTo(rowCenter, colCenter);
            });
            idleTimer = setTimeout(() => { userActive = false; }, 3000);
        };

        const onTouchMove = e => {
            e.preventDefault();
            userActive = true;
            if (idleTimer) clearTimeout(idleTimer);
            const rect = scene.getBoundingClientRect();
            const colCenter = (e.touches[0].clientX - rect.left) / (rect.width / gridCols);
            const rowCenter = (e.touches[0].clientY - rect.top) / (rect.height / gridRows);
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));
            idleTimer = setTimeout(() => { userActive = false; }, 3000);
        };

        const triggerRippleAt = (rowHit, colHit) => {
            const idx = rowHit * gridCols + colHit;
            const clickedTech = TECH_ITEMS[idx];
            if (!clickedTech) return;
            if (marquee && clickedTech.slug) {
                scrollMarqueeTo(rowHit, colHit);
            }
            const rippleColor = CATEGORY_COLORS[clickedTech.category]?.ripple || '#ffffff';
            const clickedIconUrl = clickedTech.slug ? `./icons/${clickedTech.slug}.svg` : '';
            const rings = {};
            cubes.forEach(c => {
                const ring = Math.round(Math.hypot(c.row - rowHit, c.col - colHit));
                if (!rings[ring]) rings[ring] = [];
                rings[ring].push(c);
            });
            Object.keys(rings).map(Number).sort((a, b) => a - b).forEach(ring => {
                const delay = ring * (0.15 / rippleSpeed);
                const faces = rings[ring].flatMap(c => c.faces);
                gsap.to(faces, {
                    backgroundColor: rippleColor, duration: 0.3 / rippleSpeed, delay, ease: 'power3.out', overwrite: true, onStart: () => {
                        if (clickedIconUrl) rings[ring].forEach(c => c.el.querySelectorAll('.cube-icon').forEach(img => { img.src = clickedIconUrl; img.style.opacity = '0.9'; }));
                    }
                });
                gsap.to(faces, {
                    backgroundColor: (i, el) => el.dataset.bg, duration: 0.3 / rippleSpeed, delay: delay + (0.3 / rippleSpeed) + (0.6 / rippleSpeed), ease: 'power3.out', overwrite: false, onStart: () => {
                        rings[ring].forEach(c => c.el.querySelectorAll('.cube-icon').forEach(img => { img.src = img.dataset.origSrc || ''; img.style.opacity = img.dataset.origSrc ? '0.85' : '0'; }));
                    }
                });
            });
        };

        const onClick = e => {
            if (!rippleOnClick) return;
            const rect = scene.getBoundingClientRect();
            const colHit = Math.floor((e.clientX - rect.left) / (rect.width / gridCols));
            const rowHit = Math.floor((e.clientY - rect.top) / (rect.height / gridRows));
            if (colHit >= 0 && colHit < gridCols && rowHit >= 0 && rowHit < gridRows) triggerRippleAt(rowHit, colHit);
        };

        const cursorDot = document.querySelector('.target-cursor-dot');

        scene.addEventListener('pointermove', onPointerMove);
        scene.addEventListener('pointerenter', () => { if (cursorDot) cursorDot.classList.add('cursor-dot--expanded'); });
        scene.addEventListener('pointerleave', () => {
            resetAll();
            if (cursorDot) cursorDot.classList.remove('cursor-dot--expanded');
        });
        scene.addEventListener('click', onClick);
        scene.addEventListener('touchmove', onTouchMove, { passive: false });
        scene.addEventListener('touchstart', () => { userActive = true; }, { passive: true });
        scene.addEventListener('touchend', resetAll, { passive: true });

        const simSpeed = 0.025;
        const totalCubes = gridCols * gridRows;
        let simIndex = 0;
        const getSimTarget = (idx) => ({
            x: (idx % gridCols) + 0.5,
            y: (Math.floor(idx / gridCols)) + 0.5
        });
        simTarget = getSimTarget(0);

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



} catch (err) {
    console.error('Portfolio script error:', err);
}
