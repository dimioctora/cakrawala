/* ============================================
   PT CAKRAWALA - Interactive JavaScript
   Three.js 3D Scene, Animations, Interactions
   ============================================ */

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // PRELOADER
    // ============================================
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            preloader.classList.add('loaded');
            document.body.style.overflow = '';
            initScrollAnimations();
            animateStats();
        }, 1500);
    });

    // ============================================
    // THREE.JS HERO 3D SCENE
    // ============================================
    function initHero3D() {
        const canvas = document.getElementById('heroCanvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        camera.position.z = 30;

        // Create floating medical-themed objects
        const objects = [];
        const geometries = [
            new THREE.TorusGeometry(1.5, 0.4, 16, 100),
            new THREE.OctahedronGeometry(1.2, 0),
            new THREE.IcosahedronGeometry(1, 0),
            new THREE.TorusKnotGeometry(1, 0.3, 100, 16),
            new THREE.DodecahedronGeometry(1, 0),
            new THREE.ConeGeometry(0.8, 2, 6),
            new THREE.TetrahedronGeometry(1.2, 0),
            new THREE.BoxGeometry(1.5, 1.5, 1.5),
        ];

        // Materials with medical blue/cyan theme
        const materials = [
            new THREE.MeshPhongMaterial({
                color: 0x00B8D9,
                transparent: true,
                opacity: 0.25,
                wireframe: true,
                side: THREE.DoubleSide
            }),
            new THREE.MeshPhongMaterial({
                color: 0x0B3B8F,
                transparent: true,
                opacity: 0.2,
                wireframe: true,
                side: THREE.DoubleSide
            }),
            new THREE.MeshPhongMaterial({
                color: 0x33D6F0,
                transparent: true,
                opacity: 0.15,
                wireframe: true,
                side: THREE.DoubleSide
            })
        ];

        // Create particle system
        const particleCount = 200;
        const particleGeometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const particleSizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 80;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 80;
            particleSizes[i] = Math.random() * 2;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('size', new THREE.BufferAttribute(particleSizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00B8D9,
            size: 0.1,
            transparent: true,
            opacity: 0.4,
            blending: THREE.AdditiveBlending
        });

        const particles = new THREE.Points(particleGeometry, particleMaterial);
        scene.add(particles);

        // Create line connections
        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];
        const connectionCount = 40;

        for (let i = 0; i < connectionCount; i++) {
            const x1 = (Math.random() - 0.5) * 50;
            const y1 = (Math.random() - 0.5) * 50;
            const z1 = (Math.random() - 0.5) * 50;
            const x2 = x1 + (Math.random() - 0.5) * 15;
            const y2 = y1 + (Math.random() - 0.5) * 15;
            const z2 = z1 + (Math.random() - 0.5) * 15;
            linePositions.push(x1, y1, z1, x2, y2, z2);
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lineMaterial = new THREE.LineBasicMaterial({
            color: 0x0B3B8F,
            transparent: true,
            opacity: 0.1
        });
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // Create floating objects
        for (let i = 0; i < 12; i++) {
            const geo = geometries[i % geometries.length];
            const mat = materials[i % materials.length].clone();
            const mesh = new THREE.Mesh(geo, mat);

            mesh.position.x = (Math.random() - 0.5) * 40;
            mesh.position.y = (Math.random() - 0.5) * 30;
            mesh.position.z = (Math.random() - 0.5) * 20 - 5;

            const scale = Math.random() * 1.5 + 0.5;
            mesh.scale.set(scale, scale, scale);

            mesh.userData = {
                rotSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                    z: (Math.random() - 0.5) * 0.005
                },
                floatSpeed: Math.random() * 0.5 + 0.5,
                floatOffset: Math.random() * Math.PI * 2,
                originalY: mesh.position.y
            };

            objects.push(mesh);
            scene.add(mesh);
        }

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x0B3B8F, 0.5);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00B8D9, 0.8);
        directionalLight.position.set(5, 5, 5);
        scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0x00B8D9, 1, 50);
        pointLight.position.set(-10, 10, 10);
        scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0x0B3B8F, 0.8, 50);
        pointLight2.position.set(10, -10, 5);
        scene.add(pointLight2);

        // Mouse interaction
        let mouseX = 0, mouseY = 0;
        const targetMouse = { x: 0, y: 0 };

        document.addEventListener('mousemove', (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Animation loop
        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.01;

            // Smooth mouse follow
            targetMouse.x += (mouseX - targetMouse.x) * 0.05;
            targetMouse.y += (mouseY - targetMouse.y) * 0.05;

            // Rotate and float objects
            objects.forEach(obj => {
                obj.rotation.x += obj.userData.rotSpeed.x;
                obj.rotation.y += obj.userData.rotSpeed.y;
                obj.rotation.z += obj.userData.rotSpeed.z;
                obj.position.y = obj.userData.originalY +
                    Math.sin(time * obj.userData.floatSpeed + obj.userData.floatOffset) * 1.5;
            });

            // Camera parallax
            camera.position.x += (targetMouse.x * 3 - camera.position.x) * 0.02;
            camera.position.y += (-targetMouse.y * 2 - camera.position.y) * 0.02;
            camera.lookAt(scene.position);

            // Rotate particles
            particles.rotation.y += 0.0005;
            particles.rotation.x += 0.0002;

            // Rotate lines
            lines.rotation.y += 0.0003;

            renderer.render(scene, camera);
        }

        animate();

        // Handle resize
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    initHero3D();

    // ============================================
    // GLOBE / NETWORK VISUALIZATION (About Section)
    // ============================================
    function initGlobe() {
        const canvas = document.getElementById('globeCanvas');
        if (!canvas || typeof THREE === 'undefined') return;

        const container = canvas.parentElement;
        const width = container.offsetWidth;
        const height = container.offsetHeight;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        camera.position.z = 5;

        // Globe wireframe
        const globeGeo = new THREE.SphereGeometry(1.8, 32, 32);
        const globeMat = new THREE.MeshBasicMaterial({
            color: 0x0B3B8F,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const globe = new THREE.Mesh(globeGeo, globeMat);
        scene.add(globe);

        // Outer ring
        const ringGeo = new THREE.RingGeometry(2.2, 2.25, 64);
        const ringMat = new THREE.MeshBasicMaterial({
            color: 0x00B8D9,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.3
        });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 3;
        scene.add(ring);

        // Second ring
        const ring2 = new THREE.Mesh(
            new THREE.RingGeometry(2.5, 2.53, 64),
            new THREE.MeshBasicMaterial({
                color: 0x0B3B8F,
                side: THREE.DoubleSide,
                transparent: true,
                opacity: 0.15
            })
        );
        ring2.rotation.x = -Math.PI / 4;
        ring2.rotation.y = Math.PI / 6;
        scene.add(ring2);

        // Dots on globe (healthcare network points)
        const dotGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const dotMat = new THREE.MeshBasicMaterial({ color: 0x00B8D9 });

        const points = [
            [0.3, 0.5, 1.7], [-0.8, 1.2, 1.1], [1.0, 0.8, 1.3],
            [-0.5, -0.3, 1.8], [0.9, -0.6, 1.5], [-1.2, 0.4, 1.3],
            [0.1, 1.5, 1.0], [-0.7, -1.0, 1.4], [1.3, 0.2, 1.2],
            [-0.2, 0.9, 1.5], [0.6, -1.2, 1.2], [-1.0, -0.5, 1.4],
        ];

        const dots = [];
        points.forEach(([x, y, z]) => {
            const dot = new THREE.Mesh(dotGeo, dotMat.clone());
            dot.position.set(x, y, z);
            dots.push(dot);
            scene.add(dot);
        });

        // Connection lines between dots
        const lineMat2 = new THREE.LineBasicMaterial({
            color: 0x00B8D9,
            transparent: true,
            opacity: 0.15
        });

        for (let i = 0; i < points.length - 1; i++) {
            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.Float32BufferAttribute([
                ...points[i], ...points[i + 1]
            ], 3));
            const line = new THREE.Line(lineGeo, lineMat2);
            scene.add(line);
        }

        // Ambient glow
        const glowGeo = new THREE.SphereGeometry(2.0, 32, 32);
        const glowMat = new THREE.MeshBasicMaterial({
            color: 0x00B8D9,
            transparent: true,
            opacity: 0.03
        });
        const glow = new THREE.Mesh(glowGeo, glowMat);
        scene.add(glow);

        let time = 0;
        function animate() {
            requestAnimationFrame(animate);
            time += 0.005;

            globe.rotation.y += 0.003;
            ring.rotation.z += 0.002;
            ring2.rotation.z -= 0.001;

            // Pulse dots
            dots.forEach((dot, i) => {
                const s = 1 + Math.sin(time * 3 + i) * 0.3;
                dot.scale.set(s, s, s);
                dot.material.opacity = 0.5 + Math.sin(time * 2 + i) * 0.3;
            });

            renderer.render(scene, camera);
        }

        animate();

        // Resize
        const resizeObserver = new ResizeObserver(() => {
            const w = container.offsetWidth;
            const h = container.offsetHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
        resizeObserver.observe(container);
    }

    initGlobe();

    // ============================================
    // HERO PARTICLES (CSS-based floating particles)
    // ============================================
    function createParticles() {
        const container = document.getElementById('heroParticles');
        if (!container) return;

        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'hero-particle';
            particle.style.cssText = `
                position: absolute;
                width: ${Math.random() * 4 + 1}px;
                height: ${Math.random() * 4 + 1}px;
                background: rgba(0, 184, 217, ${Math.random() * 0.3 + 0.1});
                border-radius: 50%;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
                pointer-events: none;
            `;
            container.appendChild(particle);
        }

        // Add keyframes
        if (!document.getElementById('particleStyles')) {
            const style = document.createElement('style');
            style.id = 'particleStyles';
            style.textContent = `
                @keyframes particleFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
                    25% { transform: translate(${Math.random() * 40 - 20}px, -${Math.random() * 40 + 20}px) scale(1.2); opacity: 0.6; }
                    50% { transform: translate(${Math.random() * 60 - 30}px, -${Math.random() * 20 + 10}px) scale(0.8); opacity: 0.4; }
                    75% { transform: translate(-${Math.random() * 30}px, ${Math.random() * 20}px) scale(1.1); opacity: 0.5; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    createParticles();

    // ============================================
    // NAVIGATION
    // ============================================
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    // Scroll behavior
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.scrollY;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;

        // Update active nav link
        updateActiveNav();
    });

    // Mobile toggle
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('open');
    });

    // Close on link click
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('open');
        });
    });

    // Update active nav link
    function updateActiveNav() {
        const sections = document.querySelectorAll('.section, .hero-section');
        const navLinksArr = document.querySelectorAll('.nav-link');
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 150;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinksArr.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    // ============================================
    // SCROLL REVEAL ANIMATIONS
    // ============================================
    function initScrollAnimations() {
        const reveals = document.querySelectorAll('.reveal-up');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = entry.target.dataset.delay || 0;
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, parseInt(delay));
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        reveals.forEach(el => observer.observe(el));
    }

    // ============================================
    // ANIMATED STATISTICS
    // ============================================
    function animateStats() {
        const stats = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseInt(entry.target.dataset.target);
                    animateNumber(entry.target, 0, target, 2000);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        stats.forEach(stat => observer.observe(stat));
    }

    function animateNumber(element, start, end, duration) {
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(start + (end - start) * eased);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        
        requestAnimationFrame(update);
    }

    // ============================================
    // TESTIMONIALS SLIDER
    // ============================================
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const dotsContainer = document.getElementById('sliderDots');

    if (track && prevBtn && nextBtn) {
        let currentSlide = 0;
        const totalSlides = track.children.length;

        function goToSlide(index) {
            currentSlide = index;
            if (currentSlide < 0) currentSlide = totalSlides - 1;
            if (currentSlide >= totalSlides) currentSlide = 0;

            track.style.transform = `translateX(-${currentSlide * 100}%)`;

            // Update dots
            document.querySelectorAll('#sliderDots .dot').forEach((dot, i) => {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        prevBtn.addEventListener('click', () => goToSlide(currentSlide - 1));
        nextBtn.addEventListener('click', () => goToSlide(currentSlide + 1));

        // Dot clicks
        document.querySelectorAll('#sliderDots .dot').forEach((dot, i) => {
            dot.addEventListener('click', () => goToSlide(i));
        });

        // Auto-slide
        let autoSlide = setInterval(() => goToSlide(currentSlide + 1), 6000);

        // Pause on hover
        track.parentElement.addEventListener('mouseenter', () => clearInterval(autoSlide));
        track.parentElement.addEventListener('mouseleave', () => {
            autoSlide = setInterval(() => goToSlide(currentSlide + 1), 6000);
        });
    }

    // ============================================
    // PARTNER TABS FILTER
    // ============================================
    const partnerTabs = document.querySelectorAll('.partner-tab');
    const partnerCards = document.querySelectorAll('.partner-logo-card');

    partnerTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            partnerTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const category = tab.dataset.category;

            partnerCards.forEach(card => {
                if (category === 'all' || card.dataset.category === category) {
                    card.style.display = 'flex';
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        if (!card.dataset.category.includes(category) && category !== 'all') {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });

    // ============================================
    // CONTACT FORM
    // ============================================
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Animate button
            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.innerHTML = '<span>Mengirim...</span>';
            btn.disabled = true;

            // Simulate send
            setTimeout(() => {
                btn.innerHTML = '<span>✓ Terkirim!</span>';
                btn.style.background = 'linear-gradient(135deg, #10B981, #059669)';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.disabled = false;
                    contactForm.reset();
                }, 2500);
            }, 1500);
        });
    }

    // ============================================
    // SMOOTH SCROLL
    // ============================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ============================================
    // 3D TILT EFFECT ON CARDS
    // ============================================
    function init3DTilt() {
        const cards = document.querySelectorAll('.product-card-inner, .service-card, .why-card');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = ((y - centerY) / centerY) * -5;
                const rotateY = ((x - centerX) / centerX) * 5;

                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = '';
            });
        });
    }

    init3DTilt();

    // ============================================
    // MAGNETIC BUTTON EFFECT
    // ============================================
    document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translateY(-2px) translate(${x * 0.15}px, ${y * 0.15}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = '';
        });
    });

    // ============================================
    // DUPLICATE PARTNER LOGOS FOR INFINITE SCROLL
    // ============================================
    function duplicatePartners() {
        const track = document.querySelector('.partners-track');
        if (!track) return;
        const cards = track.innerHTML;
        track.innerHTML = cards + cards;
    }
    duplicatePartners();

    // ============================================
    // CURSOR GLOW EFFECT
    // ============================================
    function initCursorGlow() {
        const glow = document.createElement('div');
        glow.className = 'cursor-glow';
        glow.style.cssText = `
            position: fixed;
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(11, 59, 143, 0.04), transparent 70%);
            pointer-events: none;
            z-index: 0;
            transform: translate(-50%, -50%);
            transition: opacity 0.3s;
        `;
        document.body.appendChild(glow);

        let glowX = 0, glowY = 0;
        let currentX = 0, currentY = 0;

        document.addEventListener('mousemove', (e) => {
            glowX = e.clientX;
            glowY = e.clientY;
        });

        function updateGlow() {
            currentX += (glowX - currentX) * 0.08;
            currentY += (glowY - currentY) * 0.08;
            glow.style.left = currentX + 'px';
            glow.style.top = currentY + 'px';
            requestAnimationFrame(updateGlow);
        }

        updateGlow();
    }

    initCursorGlow();
});
