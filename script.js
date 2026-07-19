document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. Cursor Glow Tracking
       ========================================================================== */
    const cursorGlow = document.getElementById('cursor-glow');
    document.addEventListener('mousemove', (e) => {
        // Calculate coordinate percentages
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;
        
        // Set CSS custom properties on root
        document.documentElement.style.setProperty('--mouse-x', `${xPercent}%`);
        document.documentElement.style.setProperty('--mouse-y', `${yPercent}%`);
    });

    /* ==========================================================================
       2. Canvas System-Node Particle Network
       ========================================================================== */
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let particlesArray = [];
    const maxParticles = 60;
    const connectionDistance = 150;
    
    // Mouse properties for interactions
    let mouse = {
        x: null,
        y: null,
        radius: 120
    };
    
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    
    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Object
    class Particle {
        constructor() {
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            // Slow, fluid movement
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.size = Math.random() * 2 + 1;
            // Set slight color shifts
            this.color = Math.random() > 0.5 ? 'rgba(6, 182, 212, 0.4)' : 'rgba(99, 102, 241, 0.4)';
        }
        
        update() {
            // Boundary collisions
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            
            this.x += this.vx;
            this.y += this.vy;
            
            // Mouse Repulsion Effect
            if (mouse.x !== null && mouse.y !== null) {
                let dx = this.x - mouse.x;
                let dy = this.y - mouse.y;
                let distance = Math.hypot(dx, dy);
                
                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance;
                    let forceDirectionY = dy / distance;
                    let force = (mouse.radius - distance) / mouse.radius;
                    let directionX = forceDirectionX * force * 0.8;
                    let directionY = forceDirectionY * force * 0.8;
                    
                    this.x += directionX;
                    this.y += directionY;
                }
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    // Initialize Particles
    function initCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        particlesArray = [];
        for (let i = 0; i < maxParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    // Connect particles in a network mesh
    function connectParticles() {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a + 1; b < particlesArray.length; b++) {
                let dist = Math.hypot(
                    particlesArray[a].x - particlesArray[b].x,
                    particlesArray[a].y - particlesArray[b].y
                );
                
                if (dist < connectionDistance) {
                    // Line opacity drops as distance increases
                    let opacity = (1 - (dist / connectionDistance)) * 0.12;
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation Loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();
        }
        
        connectParticles();
        requestAnimationFrame(animate);
    }
    
    // Resize Event
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            initCanvas();
        }, 150);
    });
    
    initCanvas();
    animate();

    /* ==========================================================================
       3. Intersection Observer for Reveal Animations
       ========================================================================== */
    const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -50px 0px'
    });
    
    revealElements.forEach(el => revealObserver.observe(el));

    /* ==========================================================================
       4. Timeline Milestones Tab Switcher
       ========================================================================== */
    const tabs = document.querySelectorAll('.timeline-tab');
    const contents = document.querySelectorAll('.timeline-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active classes
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Show corresponding content block
            const index = tab.getAttribute('data-index');
            const targetContent = document.getElementById(`job-${index}`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       5. Mobile Navigation Menu
       ========================================================================== */
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    
    function toggleMobileNav() {
        mobileNavOverlay.classList.toggle('open');
        document.body.classList.toggle('overflow-hidden');
    }
    
    if (mobileNavToggle) {
        mobileNavToggle.addEventListener('click', toggleMobileNav);
    }
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNavOverlay.classList.contains('open')) {
                toggleMobileNav();
            }
        });
    });

    /* ==========================================================================
       6. Resume Modal Functionality
       ========================================================================== */
    const resumeBtn = document.getElementById('resume-btn');
    const mobileResumeBtn = document.getElementById('mobile-resume-btn');
    const resumeModal = document.getElementById('resume-modal');
    const modalClose = document.querySelector('.modal-close');
    const downloadResumeBtn = document.getElementById('download-resume-btn');
    
    function openModal() {
        resumeModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal() {
        resumeModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (resumeBtn) resumeBtn.addEventListener('click', openModal);
    if (mobileResumeBtn) mobileResumeBtn.addEventListener('click', () => {
        toggleMobileNav();
        openModal();
    });
    
    if (modalClose) modalClose.addEventListener('click', closeModal);
    
    // Close modal on overlay click
    resumeModal.addEventListener('click', (e) => {
        if (e.target === resumeModal) {
            closeModal();
        }
    });
    
    // Close modal on Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && resumeModal.classList.contains('active')) {
            closeModal();
        }
    });
    
    // Print/Download Resume implementation
    if (downloadResumeBtn) {
        downloadResumeBtn.addEventListener('click', () => {
            window.print();
        });
    }

    /* ==========================================================================
       7. Interactive Contact Form Submission Simulation
       ========================================================================== */
    const contactForm = document.getElementById('contact-form');
    const formSuccess = document.getElementById('form-success');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Collect info and animate form fade-out
            contactForm.classList.add('hide');
            
            // Show custom success message
            formSuccess.classList.remove('hide');
            formSuccess.style.animation = 'fadeIn 0.6s ease-in-out forwards';
        });
    }

    /* ==========================================================================
       8. Sticky Navbar Scroll Effect
       ========================================================================== */
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(11, 15, 25, 0.9)';
            navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.2)';
            navbar.style.height = '70px';
        } else {
            navbar.style.background = 'rgba(11, 15, 25, 0.75)';
            navbar.style.boxShadow = 'none';
            navbar.style.height = '80px';
        }
    });
});
