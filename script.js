document.addEventListener('DOMContentLoaded', () => {

    // ── UTILITY BAR DISMISS ──
    const utilBar = document.getElementById('utility-bar');
    const utilClose = document.getElementById('utility-close');
    if (utilBar && utilClose) {
        if (sessionStorage.getItem('utilDismissed')) {
            utilBar.style.display = 'none';
        }
        utilClose.addEventListener('click', () => {
            utilBar.style.marginTop = `-${utilBar.offsetHeight}px`;
            utilBar.style.opacity = '0';
            setTimeout(() => { utilBar.style.display = 'none'; }, 300);
            sessionStorage.setItem('utilDismissed', 'true');
        });
    }

    // ── MOBILE MENU FOCUS TRAP ──
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    
    if (hamburger && mobileMenu) {
        const toggle = () => {
            const open = hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            hamburger.setAttribute('aria-expanded', open);
            document.body.style.overflow = open ? 'hidden' : '';
            
            if (open) {
                const firstFocusable = mobileMenu.querySelectorAll(focusableElements)[0];
                if (firstFocusable) setTimeout(() => firstFocusable.focus(), 100);
            }
        };

        hamburger.addEventListener('click', toggle);
        
        const links = mobileMenu.querySelectorAll('.mobile-link');
        links.forEach(l => l.addEventListener('click', toggle));

        // Focus trap logic
        mobileMenu.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                const focusableContent = mobileMenu.querySelectorAll(focusableElements);
                const firstFocusableElement = focusableContent[0];
                const lastFocusableElement = focusableContent[focusableContent.length - 1];

                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
            if (e.key === 'Escape') {
                toggle();
                hamburger.focus();
            }
        });
    }

    // ── STICKY NAVBAR ──
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });

    // ── SCROLL REVEAL ──
    const faders = document.querySelectorAll('.anim-fade');
    const fadeObs = new IntersectionObserver((entries, obs) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    
    // Check for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
        faders.forEach(el => fadeObs.observe(el));
    } else {
        faders.forEach(el => el.classList.add('visible'));
    }

    // ── HERO IMAGE CINEMATIC ZOOM ──
    const heroImg = document.querySelector('.hero-img');
    if (heroImg && !prefersReducedMotion) {
        setTimeout(() => { heroImg.style.transform = 'scale(1)'; }, 400);
    }

    // ── MAGNETIC BUTTON ──
    if (!prefersReducedMotion) {
        document.querySelectorAll('.magnetic-btn').forEach(btn => {
            btn.addEventListener('mousemove', e => {
                const r = btn.getBoundingClientRect();
                const x = e.clientX - r.left - r.width / 2;
                const y = e.clientY - r.top - r.height / 2;
                btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0,0)';
            });
        });
    }

    // ── ACCOUNTABILITY COUNTER + BARS ──
    const accSection = document.querySelector('.accountability');
    if (accSection) {
        let accFired = false;
        const easeOutQuad = t => t * (2 - t);

        const accObs = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !accFired) {
                accFired = true;
                
                if (!prefersReducedMotion) {
                    const counters = accSection.querySelectorAll('.acc-num');
                    const bars = accSection.querySelectorAll('.acc-bar-fill');
                    
                    counters.forEach((el, index) => {
                        // Stagger start time
                        setTimeout(() => {
                            const target = parseInt(el.dataset.target);
                            let startTime = null;
                            const duration = 1500;

                            const step = (timestamp) => {
                                if (!startTime) startTime = timestamp;
                                const progress = Math.min((timestamp - startTime) / duration, 1);
                                const current = Math.floor(easeOutQuad(progress) * target);
                                
                                el.innerHTML = current + '<span>%</span>';
                                
                                if (progress < 1) {
                                    window.requestAnimationFrame(step);
                                } else {
                                    el.innerHTML = target + '<span>%</span>';
                                }
                            };
                            window.requestAnimationFrame(step);
                        }, index * 150); // 150ms stagger
                    });

                    bars.forEach((bar, index) => {
                        setTimeout(() => {
                            bar.style.width = bar.dataset.width + '%';
                        }, 200 + (index * 150));
                    });
                } else {
                    accSection.querySelectorAll('.acc-bar-fill').forEach(bar => {
                        bar.style.width = bar.dataset.width + '%';
                    });
                }
            }
        }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
        accObs.observe(accSection);
    }

    // ── JOURNEY SCROLL SPY ──
    const steps = document.querySelectorAll('.jcard');
    const jnavBtns = document.querySelectorAll('.jnav-btn');
    if (steps.length && jnavBtns.length) {
        const spy = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    const id = e.target.id;
                    jnavBtns.forEach(b => {
                        b.classList.toggle('active', b.dataset.target === id);
                    });
                }
            });
        }, { rootMargin: '-20% 0px -60% 0px', threshold: 0 });
        steps.forEach(s => spy.observe(s));

        jnavBtns.forEach(b => {
            b.addEventListener('click', () => {
                const el = document.getElementById(b.dataset.target);
                if (el) {
                    const y = el.getBoundingClientRect().top + window.scrollY - 140; // account for scroll-margin
                    window.scrollTo({ top: y, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
                }
            });
        });
    }

    // ── EDITORIAL STORY CAROUSEL ──
    const slides = document.querySelectorAll('.story-slide');
    const storyTabs = document.querySelectorAll('.story-card-tab');
    if (slides.length > 0 && storyTabs.length > 0) {
        storyTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const index = parseInt(tab.dataset.slide);
                slides.forEach(s => s.classList.remove('active'));
                storyTabs.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'false');
                });
                slides[index].classList.add('active');
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'true');
            });
        });
    }

    // ── DONATION LOGIC ──
    const freqRadios = document.querySelectorAll('.freq-radio');
    const amtRadios = document.querySelectorAll('.amt-radio');
    const ctx = document.getElementById('d-context');
    const customWrap = document.getElementById('other-wrap');
    const customIn = document.getElementById('other-input');
    const proceed = document.getElementById('proceed-btn');

    let monthly = false;
    let amount = '3000';

    freqRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                monthly = e.target.value === 'monthly';
                const indicator = document.querySelector('.dtabs-indicator');
                if (indicator) {
                    indicator.style.transform = monthly ? 'translateX(100%)' : 'translateX(0)';
                }
                updateBtn();
            }
        });
    });

    amtRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                amount = e.target.value;
                if(e.target.dataset.context && ctx) {
                    ctx.style.opacity = '0';
                    setTimeout(() => {
                        ctx.textContent = e.target.dataset.context;
                        ctx.style.opacity = '1';
                    }, 180);
                }
                
                if (amount === 'other') {
                    if (customWrap) customWrap.style.display = 'block';
                    if (customIn) customIn.focus();
                } else {
                    if (customWrap) customWrap.style.display = 'none';
                    if (customIn) customIn.value = '';
                }
                updateBtn();
            }
        });
    });

    if (customIn) {
        customIn.addEventListener('input', (e) => {
            let rawValue = e.target.value.replace(/\D/g, '');
            if (rawValue) {
                e.target.value = Number(rawValue).toLocaleString('en-IN');
            } else {
                e.target.value = '';
            }
            amount = rawValue || '0';
            updateBtn();
        });
    }

    function updateBtn() {
        if (!proceed) return;
        const textSpan = proceed.querySelector('.proceed-text');
        if (!textSpan) return;

        let display = '';
        if (amount === 'other' || amount === '0') {
            const raw = customIn ? customIn.value.replace(/,/g, '') : '';
            display = raw ? `₹${Number(raw).toLocaleString('en-IN')}` : '';
        } else {
            display = `₹${Number(amount).toLocaleString('en-IN')}`;
        }
        
        if (display) {
            textSpan.textContent = `Donate ${display} Now`;
            if (monthly) textSpan.textContent += ' Monthly';
        } else {
            textSpan.textContent = `Donate Now`;
        }
    }

    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutClose = document.getElementById('checkout-close');
    const checkoutDisplayAmt = document.getElementById('checkout-display-amt');
    const checkoutDisplayCtx = document.getElementById('checkout-display-ctx');
    const checkoutForm = document.getElementById('checkout-form');
    const paySubmitBtn = document.getElementById('pay-submit-btn');

    if (proceedBtn && checkoutModal) {
        proceedBtn.addEventListener('click', () => {
            // Update modal data
            let displayAmt = '';
            if (amount === 'other' || document.querySelector('.damt-custom')?.classList.contains('active')) {
                const raw = otherInput ? otherInput.value.replace(/,/g, '') : '';
                displayAmt = raw ? `₹${Number(raw).toLocaleString('en-IN')}` : '₹0';
            } else {
                displayAmt = `₹${Number(amount).toLocaleString('en-IN')}`;
            }
            if (monthly) displayAmt += ' / mo';
            
            if (checkoutDisplayAmt) checkoutDisplayAmt.textContent = displayAmt;
            if (ctx && checkoutDisplayCtx) checkoutDisplayCtx.textContent = ctx.textContent;

            // Open modal
            checkoutModal.classList.add('active');
            checkoutModal.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            
            // Focus trap for modal
            setTimeout(() => {
                const firstInput = checkoutModal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        });

        const closeCheckout = () => {
            checkoutModal.classList.remove('active');
            checkoutModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
            proceedBtn.focus();
        };

        if (checkoutClose) checkoutClose.addEventListener('click', closeCheckout);
        checkoutModal.addEventListener('click', (e) => {
            if (e.target === checkoutModal) closeCheckout();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && checkoutModal.classList.contains('active')) {
                closeCheckout();
            }
        });

        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                if(paySubmitBtn) {
                    paySubmitBtn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Processing Securely...';
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    paySubmitBtn.disabled = true;
                }
                
                // Simulate network request
                setTimeout(() => {
                    window.location.href = 'thank-you.html';
                }, 2000);
            });
        }
    }

    // ── NEWSLETTER FORM ──
    const form = document.getElementById('diary-form');
    const formContainer = document.getElementById('diary-form-container');
    const successState = document.getElementById('diary-success-state');
    
    if (form) {
        form.addEventListener('submit', e => {
            e.preventDefault();
            const btn = form.querySelector('.diary-submit');
            const input = form.querySelector('input');
            
            btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i>';
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            btn.disabled = true;
            input.disabled = true;
            
            setTimeout(() => {
                if (formContainer) formContainer.style.display = 'none';
                if (successState) successState.style.display = 'block';
            }, 1200);
        });
    }

    // ── FAQ ACCORDION ──
    const faqBtns = document.querySelectorAll('.faq-btn');
    faqBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isExpanded = btn.getAttribute('aria-expanded') === 'true';
            
            // Close all
            faqBtns.forEach(b => {
                b.setAttribute('aria-expanded', 'false');
                if (b.nextElementSibling) b.nextElementSibling.style.maxHeight = null;
            });
            
            // Open clicked if it was not already open
            if (!isExpanded) {
                btn.setAttribute('aria-expanded', 'true');
                const content = btn.nextElementSibling;
                if (content) content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // ── INITIATIVE DRAWER ──
    const initData = {
        akshar: { tag: 'Education', title: 'Project Akshar', img: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=900&auto=format&fit=crop', m1Val: '₹500', m1Lbl: 'Cost per kit', m2Val: '12,847', m2Lbl: 'Students', content: '<p>Project Akshar is our foundational literacy initiative. We believe education is the primary catalyst out of inherited poverty.</p><p>We provide comprehensive literacy kits, establish after-school digital labs, and work closely with parents to reduce dropout rates among girls in tribal regions.</p>' },
        nourish: { tag: 'Nutrition', title: 'Nourish', img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=900&auto=format&fit=crop', m1Val: '₹50', m1Lbl: 'Cost per meal', m2Val: '2.1M', m2Lbl: 'Meals served', content: '<p>Nourish operates 12 high-capacity community kitchens across Palghar, Raigad, and Nashik districts.</p><p>Our hot, protein-rich meals ensure day-laborers and their children receive essential daily nutrition, directly combating severe acute malnutrition.</p>' },
        sanjeevani: { tag: 'Healthcare', title: 'Sanjeevani', img: 'https://images.unsplash.com/photo-1584515933487-779824d29309?q=80&w=900&auto=format&fit=crop', m1Val: '15,312', m1Lbl: 'Patients treated', m2Val: '43', m2Lbl: 'Villages covered', content: '<p>Sanjeevani deploys fully-equipped mobile medical clinics to villages where the nearest hospital is a day\'s journey away.</p><p>We conduct localized surgical camps to treat cataracts, manage chronic conditions, and provide emergency medical interventions.</p>' }
    };
    
    window.openInitDrawer = function(id) {
        const d = initData[id];
        if(!d) return;
        document.getElementById('init-tag').textContent = d.tag;
        document.getElementById('init-title').textContent = d.title;
        document.getElementById('init-hero').style.backgroundImage = `url('${d.img}')`;
        document.getElementById('init-metrics').innerHTML = `<div><strong style="display: block; font-size: 1.2rem; color: var(--terra);">${d.m1Val}</strong><span style="font-size: 0.85rem; color: var(--text2);">${d.m1Lbl}</span></div><div><strong style="display: block; font-size: 1.2rem; color: var(--terra);">${d.m2Val}</strong><span style="font-size: 0.85rem; color: var(--text2);">${d.m2Lbl}</span></div>`;
        document.getElementById('init-content').innerHTML = d.content;
        
        const drawer = document.getElementById('init-drawer');
        if(drawer) {
            drawer.classList.add('active');
            drawer.setAttribute('aria-hidden', 'false');
            document.body.style.overflow = 'hidden';
            setTimeout(() => { const c = document.getElementById('init-close'); if(c) c.focus(); }, 100);
        }
    };
    
    const initClose = document.getElementById('init-close');
    const initDrawer = document.getElementById('init-drawer');
    const closeInit = () => {
        if(initDrawer) {
            initDrawer.classList.remove('active');
            initDrawer.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };
    if(initClose) initClose.addEventListener('click', closeInit);
    if(initDrawer) initDrawer.addEventListener('click', (e) => { if (e.target === initDrawer) closeInit(); });

    // ── VOLUNTEER MODAL ──
    const volModal = document.getElementById('vol-modal');
    document.querySelectorAll('.vol-trigger').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if(volModal) {
                volModal.classList.add('active');
                volModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                setTimeout(() => { const sel = document.getElementById('vol-type'); if(sel) sel.focus(); }, 100);
            }
        });
    });
    const closeVol = () => {
        if(volModal) {
            volModal.classList.remove('active');
            volModal.setAttribute('aria-hidden', 'true');
            document.body.style.overflow = '';
        }
    };
    const volClose = document.getElementById('vol-close');
    if(volClose) volClose.addEventListener('click', closeVol);
    if(volModal) volModal.addEventListener('click', (e) => { if (e.target === volModal) closeVol(); });

    const volForm = document.getElementById('vol-form');
    if(volForm) {
        volForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = document.getElementById('vol-submit-btn');
            if(btn) {
                btn.innerHTML = '<i data-lucide="loader-2" class="lucide-spin"></i> Sending...';
                if (typeof lucide !== 'undefined') lucide.createIcons();
                btn.disabled = true;
            }
            setTimeout(() => {
                volForm.style.display = 'none';
                const successMsg = document.getElementById('vol-success');
                if(successMsg) successMsg.style.display = 'block';
            }, 1200);
        });
    }

    // Global Esc handler
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if(initDrawer && initDrawer.classList.contains('active')) closeInit();
            if(volModal && volModal.classList.contains('active')) closeVol();
        }
    });

    // ── ICON REPLACEMENT ENGINE (FontAwesome to Lucide) ──
    const faToLucide = {
        'fa-seedling': 'leaf',
        'fa-graduation-cap': 'graduation-cap',
        'fa-bowl-rice': 'utensils',
        'fa-file-pdf': 'file-text',
        'fa-shield-halved': 'shield-check',
        'fa-receipt': 'receipt',
        'fa-rotate-left': 'refresh-ccw',
        'fa-chevron-down': 'chevron-down',
        'fa-lock': 'lock',
        'fa-envelope': 'mail',
        'fa-arrow-right': 'arrow-right',
        'fa-circle-check': 'check-circle-2',
        'fa-landmark': 'landmark',
        'fa-file-invoice-dollar': 'file-spreadsheet',
        'fa-globe': 'globe',
        'fa-certificate': 'award',
        'fa-location-dot': 'map-pin',
        'fa-arrow-up': 'arrow-up',
        'fa-xmark': 'x',
        'fa-calendar': 'calendar',
        'fa-clock': 'clock',
        'fa-check': 'check',
        'fa-spinner': 'loader-2'
    };
    
    document.querySelectorAll('i').forEach(i => {
        for (const [fa, luc] of Object.entries(faToLucide)) {
            if (i.classList.contains(fa)) {
                i.setAttribute('data-lucide', luc);
                i.className = ''; // clear FA classes
                if (fa === 'fa-spinner') i.classList.add('lucide-spin');
                break;
            }
        }
    });
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

});
