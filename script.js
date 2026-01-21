// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const themeToggle = document.getElementById('themeToggle');
const progressBar = document.getElementById('progressBar');
const filterBtns = document.querySelectorAll('.filter-btn');
const bookCards = document.querySelectorAll('.book-card');
const track = document.getElementById('track');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');
const contactForm = document.getElementById('contactForm');
const particleCanvas = document.getElementById('particles');

// ===== Floating Particles =====
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 60;
        this.mouse = { x: null, y: null, radius: 150 };
        this.animationId = null;

        this.init();
        this.bindEvents();
        this.animate();
    }

    init() {
        this.resize();
        this.createParticles();
    }

    resize() {
        const hero = this.canvas.parentElement;
        this.canvas.width = hero.offsetWidth;
        this.canvas.height = hero.offsetHeight;
    }

    createParticles() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push(new Particle(this.canvas));
        }
    }

    bindEvents() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });

        this.canvas.parentElement.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.parentElement.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach(particle => {
            particle.update(this.mouse);
            particle.draw(this.ctx);
        });

        // Draw connections between nearby particles
        this.connectParticles();

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    connectParticles() {
        const maxDistance = 120;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    const opacity = (1 - distance / maxDistance) * 0.15;
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
}

class Particle {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.baseSize = this.size;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.5 + 0.2;
        this.baseOpacity = this.opacity;

        // Color variations - pink, yellow, white
        const colors = [
            { r: 232, g: 160, b: 160 },  // Pink
            { r: 212, g: 208, b: 140 },  // Yellow
            { r: 255, g: 255, b: 255 },  // White
            { r: 200, g: 230, b: 230 },  // Light cyan
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Floating motion parameters
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = (Math.random() - 0.5) * 0.02;
        this.floatRadius = Math.random() * 30 + 10;
        this.baseX = this.x;
        this.baseY = this.y;
    }

    update(mouse) {
        // Gentle floating motion
        this.angle += this.angleSpeed;
        this.x = this.baseX + Math.cos(this.angle) * this.floatRadius * 0.5;
        this.y = this.baseY + Math.sin(this.angle) * this.floatRadius;

        // Slow drift
        this.baseX += this.speedX;
        this.baseY += this.speedY;

        // Wrap around edges
        if (this.baseX < -50) this.baseX = this.canvas.width + 50;
        if (this.baseX > this.canvas.width + 50) this.baseX = -50;
        if (this.baseY < -50) this.baseY = this.canvas.height + 50;
        if (this.baseY > this.canvas.height + 50) this.baseY = -50;

        // Mouse interaction - particles gently move away and glow
        if (mouse.x !== null && mouse.y !== null) {
            const dx = this.x - mouse.x;
            const dy = this.y - mouse.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < mouse.radius) {
                const force = (mouse.radius - distance) / mouse.radius;
                const angle = Math.atan2(dy, dx);
                this.x += Math.cos(angle) * force * 2;
                this.y += Math.sin(angle) * force * 2;
                this.size = this.baseSize + force * 2;
                this.opacity = Math.min(this.baseOpacity + force * 0.3, 0.8);
            } else {
                this.size = this.baseSize;
                this.opacity = this.baseOpacity;
            }
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;

        // Glow effect
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size * 2
        );
        gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`);
        gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0.3)`);
        gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 1)`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Initialize particle system
let particleSystem = null;
if (particleCanvas) {
    particleSystem = new ParticleSystem(particleCanvas);
}

// ===== Theme Toggle =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

themeToggle.addEventListener('click', toggleTheme);
initTheme();

// ===== Navbar Scroll Effect =====
function handleNavbarScroll() {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
}

// ===== Progress Bar =====
function updateProgressBar() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    progressBar.style.width = scrollPercent + '%';
}

// ===== Active Navigation Link =====
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (navLink) {
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                navLink.classList.add('active');
            }
        }
    });
}

// Scroll event listeners
window.addEventListener('scroll', () => {
    handleNavbarScroll();
    updateProgressBar();
    updateActiveNavLink();
});

// ===== Mobile Navigation Toggle =====
navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
});

// Close mobile menu when clicking a link
navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    });
});

// ===== Animated Counter =====
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                const duration = 2000;
                const start = 0;
                const startTime = performance.now();

                function updateCounter(currentTime) {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);

                    // Easing function for smooth animation
                    const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                    const current = Math.floor(easeOutQuart * target);

                    counter.textContent = current;

                    if (progress < 1) {
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                }

                requestAnimationFrame(updateCounter);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

animateCounters();

// ===== Book Filter =====
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        bookCards.forEach(card => {
            const category = card.getAttribute('data-category');

            if (filter === 'all' || category === filter) {
                card.classList.remove('hidden');
                card.style.animation = 'fadeUp 0.5s ease forwards';
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ===== Testimonials Carousel =====
class Carousel {
    constructor() {
        this.track = track;
        this.testimonials = track.querySelectorAll('.testimonial');
        this.currentIndex = 0;
        this.totalSlides = this.testimonials.length;
        this.autoPlayInterval = null;

        this.init();
    }

    init() {
        this.createDots();
        this.bindEvents();
        this.startAutoPlay();
    }

    createDots() {
        for (let i = 0; i < this.totalSlides; i++) {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            dotsContainer.appendChild(dot);
        }
    }

    bindEvents() {
        prevBtn.addEventListener('click', () => this.prev());
        nextBtn.addEventListener('click', () => this.next());

        // Pause on hover
        this.track.parentElement.addEventListener('mouseenter', () => this.stopAutoPlay());
        this.track.parentElement.addEventListener('mouseleave', () => this.startAutoPlay());

        // Touch support
        let touchStartX = 0;
        let touchEndX = 0;

        this.track.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.track.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe(touchStartX, touchEndX);
        }, { passive: true });
    }

    handleSwipe(startX, endX) {
        const threshold = 50;
        const diff = startX - endX;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.next();
            } else {
                this.prev();
            }
        }
    }

    goToSlide(index) {
        this.currentIndex = index;
        this.track.style.transform = `translateX(-${index * 100}%)`;
        this.updateDots();
    }

    prev() {
        this.currentIndex = (this.currentIndex - 1 + this.totalSlides) % this.totalSlides;
        this.goToSlide(this.currentIndex);
    }

    next() {
        this.currentIndex = (this.currentIndex + 1) % this.totalSlides;
        this.goToSlide(this.currentIndex);
    }

    updateDots() {
        const dots = dotsContainer.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }

    startAutoPlay() {
        this.autoPlayInterval = setInterval(() => this.next(), 5000);
    }

    stopAutoPlay() {
        clearInterval(this.autoPlayInterval);
    }
}

const carousel = new Carousel();

// ===== Contact Form =====
// Contact form AJAX submission
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    const formData = new FormData(contactForm);

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'Sending...';

    try {
        const response = await fetch(contactForm.action, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            // Hide form and show success message
            contactForm.style.display = 'none';
            document.getElementById('formSuccess').style.display = 'block';
            contactForm.reset();
        } else {
            throw new Error('Form submission failed');
        }
    } catch (error) {
        alert('Oops! There was a problem sending your message. Please try again.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
    }
});

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
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

// ===== Intersection Observer for Animations =====
const animateOnScroll = () => {
    const elements = document.querySelectorAll('.book-card, .article-card, .about-content, .featured-content');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
};

// Initialize animations after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    animateOnScroll();
});

// ===== Keyboard Navigation =====
document.addEventListener('keydown', (e) => {
    // Escape closes mobile menu
    if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Arrow keys for carousel
    if (e.key === 'ArrowLeft') {
        carousel.prev();
    } else if (e.key === 'ArrowRight') {
        carousel.next();
    }
});

// ===== Article Row Scrolling =====
document.querySelectorAll('.article-row-wrapper').forEach(wrapper => {
    const row = wrapper.querySelector('.article-row');
    const leftBtn = wrapper.querySelector('.article-scroll-left');
    const rightBtn = wrapper.querySelector('.article-scroll-right');

    if (leftBtn && rightBtn && row) {
        // Function to update arrow visibility
        const updateArrows = () => {
            const scrollLeft = Math.round(row.scrollLeft);
            const maxScroll = Math.round(row.scrollWidth - row.clientWidth);

            // Hide left arrow if at the start
            if (scrollLeft <= 5) {
                leftBtn.style.display = 'none';
            } else {
                leftBtn.style.display = 'flex';
            }

            // Hide right arrow if at the end
            if (scrollLeft >= maxScroll - 5) {
                rightBtn.style.display = 'none';
            } else {
                rightBtn.style.display = 'flex';
            }
        };

        // Initial arrow state
        updateArrows();

        // Update arrows on scroll
        row.addEventListener('scroll', updateArrows);

        // Scroll left
        leftBtn.addEventListener('click', () => {
            row.scrollBy({
                left: -370,
                behavior: 'smooth'
            });
            // Update arrows after scroll animation completes
            setTimeout(updateArrows, 500);
        });

        // Scroll right
        rightBtn.addEventListener('click', () => {
            row.scrollBy({
                left: 370,
                behavior: 'smooth'
            });
            // Update arrows after scroll animation completes
            setTimeout(updateArrows, 500);
        });

        // Update arrows on window resize
        window.addEventListener('resize', updateArrows);
    }
});

// ===== Preloader (optional) =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
