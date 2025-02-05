
try {
    // Add this at the start of your script
    const heroBackground = document.querySelector('.hero-background');
    let isPhone = false;

    // Mouse movement for desktop
    addEventListener('mousemove', e => {
        heroBackground.style = `--x: ${e.clientX}px; --y: ${e.clientY}px;`;
    });

    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Mobile menu functionality
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.textContent = navLinks.classList.contains('active') ? 'close' : 'menu';
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').textContent = 'menu';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
                navLinks.classList.remove('active');
                mobileMenuBtn.querySelector('i').textContent = 'menu';
            }
        });
    }

    // Carousel functionality
    const track = document.querySelector('.carousel-track');
    const slides = track ? Array.from(track.children) : [];
    const nextButton = document.querySelector('.carousel-button.next');
    const prevButton = document.querySelector('.carousel-button.prev');
    const dotsNav = document.querySelector('.carousel-nav');
    const dots = dotsNav ? Array.from(dotsNav.children) : [];
    let currentSlideIndex = 0;
    let autoSlideInterval;

    if (track && slides.length > 0 && nextButton && prevButton && dotsNav) {
        // Set initial position of slides
        const setSlidePosition = () => {
            slides.forEach((slide, index) => {
                slide.style.left = `${index * 100}%`;
            });
        };
        setSlidePosition();

        const moveToSlide = (targetIndex) => {
            track.style.transform = `translateX(-${targetIndex * 100}%)`;
            currentSlideIndex = targetIndex;
            
            // Update active dot
            dots.forEach(dot => dot.classList.remove('active'));
            dots[targetIndex].classList.add('active');
            
            // Update button states
            prevButton.style.opacity = targetIndex === 0 ? '0.5' : '1';
            nextButton.style.opacity = targetIndex === slides.length - 1 ? '0.5' : '1';
        };

        // Next button click
        nextButton.addEventListener('click', () => {
            const nextIndex = (currentSlideIndex + 1) % slides.length;
            moveToSlide(nextIndex);
            resetAutoSlide();
        });

        // Previous button click
        prevButton.addEventListener('click', () => {
            const prevIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
            moveToSlide(prevIndex);
            resetAutoSlide();
        });

        // Dot navigation
        dotsNav.addEventListener('click', e => {
            const targetDot = e.target.closest('.carousel-indicator');
            if (!targetDot) return;

            const targetIndex = dots.findIndex(dot => dot === targetDot);
            moveToSlide(targetIndex);
            resetAutoSlide();
        });

        // Auto-advance slides
        const startAutoSlide = () => {
            autoSlideInterval = setInterval(() => {
                const nextIndex = (currentSlideIndex + 1) % slides.length;
                moveToSlide(nextIndex);
            }, 5000);
        };

        const resetAutoSlide = () => {
            clearInterval(autoSlideInterval);
            startAutoSlide();
        };

        startAutoSlide();
    }

    // Add loading animation to cards
    function addLoadingAnimation() {
        document.querySelectorAll('.project-card, .stat-card, .timeline-item').forEach(card => {
            card.classList.add('loading-animation');
            setTimeout(() => {
                card.classList.remove('loading-animation');
            }, 1000);
        });
    }

    // Run loading animation on page load
    addLoadingAnimation();

    // Intersection Observer for scroll animations - Mobile only
    const isMobile = window.innerWidth <= 768; // Define mobile breakpoint
    
    if (isMobile) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '50px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.project-card, .stat-card, .timeline-item, .section').forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            observer.observe(element);
        });
    } else {
        // For desktop, show elements without animation
        document.querySelectorAll('.project-card, .stat-card, .timeline-item, .section').forEach(element => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    // Function for mobile scroll animations with background effect
    const addMobileScrollAnimations = () => {
        const elements = document.querySelectorAll('.project-card, .stat-card, .timeline-item, .gallery-item, .resume-container');
        const heroBackground = document.querySelector('.hero-background');
        
        // Update background pattern based on scroll position
        const updateBackgroundPattern = () => {
            const scrollPosition = window.scrollY;
            const viewportHeight = window.innerHeight;
            const scrollPercentage = (scrollPosition / viewportHeight) * 100;
            
            // Update the background position based on scroll
            if (heroBackground) {
                heroBackground.style.setProperty('--x', `${50 + (scrollPercentage / 2)}vw`);
                heroBackground.style.setProperty('--y', `${scrollPosition}px`);
            }
        };

        // Add scroll event listener for background effect
        window.addEventListener('scroll', updateBackgroundPattern, { passive: true });
        
        // Intersection Observer for card animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Add ripple effect to nearby background dots
                    const rect = entry.target.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;
                    if (heroBackground) {
                        heroBackground.style.setProperty('--x', `${centerX}px`);
                        heroBackground.style.setProperty('--y', `${centerY}px`);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px'
        });

        elements.forEach(element => {
            element.classList.add('animate-on-scroll');
            observer.observe(element);
        });
    };

    // Function for desktop hover animations
    const addDesktopHoverAnimations = () => {
        const elements = document.querySelectorAll('.project-card, .stat-card, .timeline-item, .gallery-item, .resume-container');
        
        elements.forEach(element => {
            // Remove mobile-specific classes if they exist
            element.classList.remove('animate-on-scroll', 'visible');
            
            // Reset any inline styles that might have been applied
            element.style.opacity = '1';
            element.style.transform = 'none';
        });
    };

    // Function to handle animations based on device width
    const handleAnimations = () => {
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            addMobileScrollAnimations();
        } else {
            addDesktopHoverAnimations();
        }
    };

    // Initial setup
    handleAnimations();

    // Handle window resize
    window.addEventListener('resize', () => {
        handleAnimations();
    });

    // Add this to your script section
    const initAnimatedBackgrounds = () => {
        // Create background elements for each section
        document.querySelectorAll('.animated-background-section').forEach(section => {
            // Create background element if it doesn't exist
            if (!section.querySelector('.animated-background')) {
                const background = document.createElement('div');
                background.className = 'animated-background';
                section.insertBefore(background, section.firstChild);
            }
        });

        // Handle mouse movement for all animated backgrounds
        document.addEventListener('mousemove', e => {
            document.querySelectorAll('.animated-background').forEach(background => {
                const rect = background.parentElement.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                // Only update if mouse is within or near the section
                const buffer = 100; // pixels
                if (y > -buffer && y < rect.height + buffer) {
                    background.style.setProperty('--x', `${x}px`);
                    background.style.setProperty('--y', `${y}px`);
                }
            });
        });

        // Handle scroll animation
        window.addEventListener('scroll', () => {
            document.querySelectorAll('.animated-background').forEach(background => {
                const rect = background.parentElement.getBoundingClientRect();
                const viewportHeight = window.innerHeight;
                
                // Only animate if section is in viewport
                if (rect.top < viewportHeight && rect.bottom > 0) {
                    const scrollProgress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
                    background.style.setProperty('--y', `${scrollProgress * 100}%`);
                }
            });
        }, { passive: true });
    };

    // Call this after your existing script
    initAnimatedBackgrounds();

} catch (error) {
    console.error('Error in script:', error);
}
