// Navigation toggle for mobile
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const nav = document.querySelector('.main-nav');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.main-nav')) {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
}

// Hide/show nav on scroll with direction detection
if (nav) {
    let lastScroll = 0;
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.scrollY;

                if (currentScroll <= 50) {
                    // At top - show fully
                    nav.classList.remove('scrolled');
                    nav.classList.remove('hidden');
                } else if (currentScroll > lastScroll && currentScroll > 100) {
                    // Scrolling down - hide
                    nav.classList.add('scrolled');
                    nav.classList.add('hidden');
                } else {
                    // Scrolling up - show
                    nav.classList.add('scrolled');
                    nav.classList.remove('hidden');
                }

                lastScroll = currentScroll;
                ticking = false;
            });
            ticking = true;
        }
    });
}
