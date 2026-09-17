document.addEventListener('DOMContentLoaded', () => {
    const loginModalOverlay = document.getElementById('login-modal-overlay');
    const loginBtn = document.getElementById('login-btn');
    const heroCtaBtn = document.getElementById('hero-cta-btn');
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const navLinks = document.getElementById('nav-links');
    const closeModalBtn = document.querySelector('.close-btn');
    const userNavProfile = document.querySelector('.user-nav-profile');
    const userDropdownMenu = document.querySelector('.user-dropdown-menu');

    const showLoginModal = () => {
        if (loginModalOverlay) {
            loginModalOverlay.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    };
    window.showLoginModal = showLoginModal;

    const hideLoginModal = () => {
        if (loginModalOverlay) {
            loginModalOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        }
    };

    loginBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        showLoginModal();
    });

    heroCtaBtn?.addEventListener('click', (e) => {
        const isLoggedIn = !document.getElementById('login-btn');
        if (!isLoggedIn) {
            e.preventDefault();
            showLoginModal();
        }
    });

    mobileMenuToggle?.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuToggle.querySelector('i');
        if (icon.classList.contains('fa-bars')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        } else {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = mobileMenuToggle.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    closeModalBtn?.addEventListener('click', hideLoginModal);

    loginModalOverlay?.addEventListener('click', (e) => {
        if (e.target === loginModalOverlay) hideLoginModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && loginModalOverlay && !loginModalOverlay.classList.contains('hidden')) {
            hideLoginModal();
        }
    });

    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.feature-card, .testimonial-card, .stat-item');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        elements.forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    };
    animateOnScroll();

    const setupPasswordToggle = (toggleId, inputId) => {
        const toggleBtn = document.getElementById(toggleId);
        const passwordInput = document.getElementById(inputId);

        if (toggleBtn && passwordInput) {
            toggleBtn.addEventListener('click', function (e) {
                e.preventDefault(); 
                const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordInput.setAttribute('type', type);
                this.classList.toggle('fa-eye');
                this.classList.toggle('fa-eye-slash');
            });
        }
    };

    setupPasswordToggle('toggleSignupPassword', 'password');
    setupPasswordToggle('toggleLoginPassword', 'modal-password');

    // --- ADDED: CLICK-BASED USER DROPDOWN LOGIC ---
    if (userNavProfile && userDropdownMenu) {
        userNavProfile.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevents click from reaching the window
            userDropdownMenu.classList.toggle('show');
        });

        // Close the menu if user clicks anywhere else
        window.addEventListener('click', () => {
            if (userDropdownMenu.classList.contains('show')) {
                userDropdownMenu.classList.remove('show');
            }
        });
    }

    async function loadKarnatakaDistricts() {

    const districtSelect = document.getElementById('district-select');

    if (!districtSelect) return;

    try {

        const response = await fetch(
            '/api/market-prices/districts'
        );

        if (!response.ok) {
            throw new Error('Failed to fetch districts');
        }

        const data = await response.json();

        districtSelect.innerHTML = '';

        const districts = data.districts || [];

        districts.forEach(district => {

            const option = document.createElement('option');

            option.value = district;
            option.textContent = district;

            districtSelect.appendChild(option);

        });

        // Default district
        districtSelect.value = 'Belagavi';

        // Load Belagavi initially
        loadLiveMarketPrices('Belagavi');

    } catch (error) {

        console.error(
            'Error loading Karnataka districts:',
            error
        );

        districtSelect.innerHTML =
            '<option>Unable to load districts</option>';

    }

}


async function loadLiveMarketPrices(district = 'Belagavi') {

    const container =
        document.getElementById('market-prices-container');

    const marketDate =
        document.getElementById('market-date');

    if (!container) return;

    container.innerHTML = `
        <p class="market-loading">
            <i class="fas fa-spinner fa-spin"></i>
            Loading live market rates...
        </p>
    `;

    try {

        const response = await fetch(
            `/api/market-prices?district=${encodeURIComponent(district)}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch market prices');
        }

        const data = await response.json();

        const prices = data.prices || [];

        if (marketDate && data.latestDate) {

            marketDate.textContent =
                `Latest available market data: ${data.latestDate}`;

        }

        if (prices.length === 0) {

            container.innerHTML = `
                <p class="market-empty">
                    No market price data available for ${district}.
                </p>
            `;

            return;

        }

        container.innerHTML = '';

        prices.forEach(item => {

            const cropName = item.commodity;

            const card = document.createElement('div');

            card.className = 'market-price-item';

            card.innerHTML = `

                <div class="market-crop">

                    <span class="crop-icon">🌾</span>

                    <span>${cropName}</span>

                </div>

                <div class="market-price">

                    ₹${Number(item.modalPrice).toLocaleString('en-IN')}

                    <small>Modal price per quintal</small>

                </div>

                <small style="display:block; margin-top:10px; color:#718096;">
                    <i class="fas fa-store"></i>
                    ${item.market}
                </small>

                <small style="display:block; margin-top:5px; color:#718096;">
                    Variety: ${item.variety}
                </small>

            `;

            container.appendChild(card);

        });

    } catch (error) {

        console.error(
            'Error loading market prices:',
            error
        );

        container.innerHTML = `
            <p class="market-error">
                Unable to load live market prices right now.
            </p>
        `;

    }

}
    
    loadKarnatakaDistricts();

const districtSelect =
    document.getElementById('district-select');

if (districtSelect) {

    districtSelect.addEventListener('change', () => {

        loadLiveMarketPrices(
            districtSelect.value
        );

    });

}
});