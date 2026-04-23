
document.addEventListener('DOMContentLoaded', () => {

    // --- Navigation Scroll Effect ---
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // --- Mobile Menu Toggle ---
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            // Change icon logic if using specific icons
        });
    }

    // --- Parallax Effect ---
    const parallaxBg = document.querySelector('.hero-bg');
    const parallaxEls = document.querySelectorAll('.parallax-el');

    window.addEventListener('scroll', () => {
        let offset = window.pageYOffset;

        // Background parallax
        if (parallaxBg) {
            parallaxBg.style.transform = `translateY(${offset * 0.45}px)`;
        }

        // Element parallax
        parallaxEls.forEach(el => {
            let speedY = el.dataset.speed || 0.1;
            let speedX = el.dataset.speedX || 0;
            let elOffset = el.getBoundingClientRect().top;

            if (elOffset < window.innerHeight && elOffset > -window.innerHeight) {
                let y = elOffset * speedY;
                let x = 0; // Horizontal parallax disabled per user request
                el.style.transform = `translate(${x}px, ${y}px)`;
            }
        });
    });

    // --- Reveal on Scroll ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            } else {
                entry.target.classList.remove('active');
            }
        });
    }, {
        threshold: 0.15, // Trigger when 15% of element is visible
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            // Close others
            faqItems.forEach(other => {
                if (other !== item) other.classList.remove('active');
            });
            // Toggle current
            item.classList.toggle('active');
        });
    });

});
