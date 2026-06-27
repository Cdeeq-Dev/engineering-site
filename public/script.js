// ========================================
// NEXVOLT ENGINEERING - JAVASCRIPT
// Interactive functionality and features
// ========================================

// ========== MOBILE MENU ========== 
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger?.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
    navLinks.style.position = 'absolute';
    navLinks.style.top = '60px';
    navLinks.style.left = '0';
    navLinks.style.right = '0';
    navLinks.style.flexDirection = 'column';
    navLinks.style.gap = '0';
    navLinks.style.background = 'linear-gradient(135deg, #001f3f 0%, #0074d9 100%)';
    navLinks.style.padding = '1rem';
});

// ========== SMOOTH SCROLLING ========== 
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            // Only auto-close the mobile nav on small screens
            if (window.innerWidth < 769) {
                navLinks && (navLinks.style.display = 'none');
            }
        }
    });
});

// ========== SCROLL TO SECTION FUNCTION ==========
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ========== WHATSAPP INTEGRATION ==========
function openWhatsApp() {
    window.open('https://wa.me/2349013813773?text=Hello%20NexVolt%20Engineering', '_blank');
}

// ========== PORTFOLIO FILTER ==========
function filterPortfolio(category) {
    const items = document.querySelectorAll('.portfolio-item');
    const buttons = document.querySelectorAll('.filter-btn');

    // Update active button
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    // Filter items
    items.forEach(item => {
        if (category === 'all' || item.dataset.category === category) {
            item.style.display = 'block';
            setTimeout(() => {
                item.style.opacity = '1';
                item.style.transform = 'scale(1)';
            }, 50);
        } else {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.8)';
            setTimeout(() => {
                item.style.display = 'none';
            }, 300);
        }
    });
}

// ========== FAQ TOGGLE ==========
function toggleFAQ(element) {
    const answer = element.nextElementSibling;
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.classList.remove('show');
        }
    });
    
    document.querySelectorAll('.faq-question').forEach(item => {
        if (item !== element) {
            item.classList.remove('active');
        }
    });
    
    // Toggle current FAQ
    answer.classList.toggle('show');
    element.classList.toggle('active');
}

// ========== CHAT FUNCTIONALITY ==========
const whatsappNumber = '2349013813773';
const whatsappChatLink = `https://wa.me/${whatsappNumber}?text=Hello%20NexVolt%20Engineering`;

const chatBotResponses = {
    'hello': 'Hello! 👋 Welcome to NexVolt Engineering. How can we assist you today?',
    'hi': 'Hi there! 👋 How can we help with your electrical needs?',
    'services': 'We offer industrial installations, generator systems, control panels, ATS/AMF panels, factory wiring, distribution boards, and maintenance services. What interests you?',
    'contact': `You can reach us via WhatsApp at <a href="${whatsappChatLink}" target="_blank" rel="noopener">${whatsappNumber}</a> or use the contact form.`,
    'whatsapp': `Start a WhatsApp chat here: <a href="${whatsappChatLink}" target="_blank" rel="noopener">Message us on WhatsApp</a>`,
    'price': 'We provide customized quotes based on your project requirements. Please fill out our quote request form or contact us directly.',
    'emergency': '24/7 Emergency Support Available! Call us immediately at +27 (0) 82 999 8888',
    'experience': 'We have 5+ years of experience in industrial electrical contracting with 5+ successful projects.',
    'certified': 'Yes! All our engineers are professionally certified, licensed, and trained in the latest standards.',
    'guarantee': 'We guarantee quality workmanship and on-time project completion with 99% client satisfaction.',
    'default': `Thanks for your message! You can also contact us on WhatsApp: <a href="${whatsappChatLink}" target="_blank" rel="noopener">${whatsappNumber}</a>. How else can we help?`
};

function toggleChat() {
    const chatWidget = document.getElementById('chatWidget');
    chatWidget.classList.toggle('show');
    if (chatWidget.classList.contains('show')) {
        document.getElementById('chatInput').focus();
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();

    if (!message) return;

    // Add user message
    addChatMessage(message, 'user');
    input.value = '';

    // Simulate bot response delay
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
    }, 500);
}

function addChatMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');

    const messagePara = document.createElement('p');
    if (sender === 'bot') {
        messagePara.innerHTML = text;
    } else {
        messagePara.textContent = text;
    }

    messageDiv.appendChild(messagePara);
    chatMessages.appendChild(messageDiv);

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function getBotResponse(userMessage) {
    const lowerMessage = userMessage.toLowerCase();

    // Check for keyword matches
    for (const [keyword, response] of Object.entries(chatBotResponses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }

    return chatBotResponses.default;
}

// ========== FORM SUBMISSIONS ==========

function handleQuoteSubmit(e) {
    e.preventDefault();

    const formData = new FormData(e.target);
    const name = formData.get('fullName') || '';
    const email = formData.get('email') || '';
    const company = formData.get('company') || '';
    const phone = formData.get('phone') || '';
    const service = formData.get('service') || '';
    const details = formData.get('details') || '';

    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const recipient = 'abubakarbellosdk@gmail.com';
    const subject = encodeURIComponent(`Quote Request from ${name}`);
    const body = encodeURIComponent(
        `Name: ${name}\n` +
        `Email: ${email}\n` +
        `Company: ${company}\n` +
        `Phone: ${phone}\n` +
        `Service: ${service}\n\n` +
        `Project Details:\n${details}`
    );
    const mailtoLink = `mailto:${recipient}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
    e.target.reset();
}

async function handleContactSubmit(e) {
    e.preventDefault();

    const formEl = e.target;
    const organization = formEl.elements['organization'].value.trim();
    const email = formEl.elements['email'].value.trim();
    const phone = formEl.elements['phone'].value.trim();
    const service = formEl.elements['service'].value.trim();
    const message = formEl.elements['message'].value.trim();

    if (!validateEmail(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const submitBtn = formEl.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ organization, email, phone, service, message }),
        });
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Something went wrong.');
        }

        showContactSuccess(formEl, data.clientId);
        formEl.reset();
    } catch (err) {
        alert('Could not send your message: ' + err.message + '\nPlease try again or contact us on WhatsApp.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
    }
}

// Show a success message in place of the form, with a button to proceed to checkout
function showContactSuccess(formEl, clientId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'contact-success';
    wrapper.innerHTML = `
        <div class="contact-success-icon">✅</div>
        <h3>Message Received!</h3>
        <p>Thanks for reaching out. Our team will review your request and get back to you shortly.</p>
        <p>Ready to move forward? You can view pricing and start your project now.</p>
        <button type="button" class="btn btn-primary" id="proceedToCheckoutBtn">Proceed to Checkout →</button>
        <button type="button" class="btn btn-secondary" id="sendAnotherBtn">Send Another Message</button>
    `;
    formEl.style.display = 'none';
    formEl.insertAdjacentElement('afterend', wrapper);

    document.getElementById('proceedToCheckoutBtn').addEventListener('click', () => {
        window.location.href = `checkout.html?clientId=${encodeURIComponent(clientId)}`;
    });
    document.getElementById('sendAnotherBtn').addEventListener('click', () => {
        wrapper.remove();
        formEl.style.display = '';
    });
}

// ========== CHAT INPUT ENTER KEY ==========
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                sendChatMessage();
            }
        });
    }


    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeQuoteModal();
        }
    });
});

// ========== ANIMATE STATS ON SCROLL ==========
function animateStats() {
    const stats = document.querySelectorAll('.stat h3');
    
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const finalValue = target.textContent;
                
                // Extract number
                const number = parseInt(finalValue);
                
                if (!isNaN(number)) {
                    let current = 0;
                    const increment = number / 50;

                    const counter = setInterval(() => {
                        current += increment;
                        if (current >= number) {
                            target.textContent = finalValue;
                            clearInterval(counter);
                            observer.unobserve(target);
                        } else {
                            target.textContent = Math.floor(current) + '+';
                        }
                    }, 30);
                }
            }
        });
    }, observerOptions);

    stats.forEach(stat => observer.observe(stat));
}

// ========== NAVBAR BACKGROUND ON SCROLL ==========
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 15px rgba(0, 31, 63, 0.2)';
    } else {
        navbar.style.boxShadow = '0 4px 6px rgba(0, 31, 63, 0.1)';
    }
});

// ========== LAZY LOAD IMAGES ==========
function lazyLoadImages() {
    const images = document.querySelectorAll('img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.style.animation = 'fadeInUp 0.5s ease';
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// ========== PORTFOLIO ANIMATION ==========
document.addEventListener('DOMContentLoaded', () => {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach((item, index) => {
        item.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s backwards`;
    });
});

// ========== INITIALIZE ON PAGE LOAD ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('NexVolt Engineering Website Loaded');
    
    animateStats();
    lazyLoadImages();
    
    // Set initial chat message
    setTimeout(() => {
        console.log('Chat widget ready');
    }, 1000);
});

// ========== SERVICE CARD HOVER EFFECT ==========
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = '';
            }, 10);
        });
    });
});

// ========== SCROLL ANIMATIONS ==========
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.service-card, .feature-box, .contact-card, .testimonial-card');
    elements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
});

// ========== FORM VALIDATION ==========
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

// ========== AUTO CLOSE MOBILE MENU ON NAV CLICK ==========
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        // Only hide the nav on mobile sizes to avoid removing header on desktop
        if (window.innerWidth < 769) {
            const navLinks = document.querySelector('.nav-links');
            navLinks && (navLinks.style.display = 'none');
        }
    });
});

// ========== PORTFOLIO GRID RESPONSIVE ==========
function updatePortfolioGrid() {
    const portfolioGrid = document.getElementById('portfolioGrid');
    if (!portfolioGrid) return;

    const width = window.innerWidth;
    if (width < 768) {
        portfolioGrid.style.gridTemplateColumns = '1fr';
    } else if (width < 1024) {
        portfolioGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
    } else {
        portfolioGrid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
    }
}

window.addEventListener('resize', updatePortfolioGrid);
document.addEventListener('DOMContentLoaded', updatePortfolioGrid);

// ========== SMOOTH SCROLL PERFORMANCE ==========
if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
}

// ========== DYNAMIC YEAR IN FOOTER ==========
document.addEventListener('DOMContentLoaded', () => {
    const footerBottom = document.querySelector('.footer-bottom');
    if (footerBottom) {
        const currentYear = new Date().getFullYear();
        footerBottom.innerHTML = footerBottom.innerHTML.replace('2024', currentYear);
    }
});

// ========== SERVICE CLICK TO QUOTE FORM ==========
document.addEventListener('DOMContentLoaded', () => {
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => {
            scrollToSection('contact');
        });
    });
});

// ========== TESTIMONIAL CAROUSEL AUTO-SCROLL ==========
let testimonialIndex = 0;
function autoScrollTestimonials() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    if (testimonialCards.length === 0) return;

    testimonialCards.forEach(card => card.style.opacity = '0.6');
    
    const card = testimonialCards[testimonialIndex];
    card.style.opacity = '1';
    
    testimonialIndex = (testimonialIndex + 1) % testimonialCards.length;
}

// Optional: Uncomment to enable auto-scroll
// setInterval(autoScrollTestimonials, 5000);

// ========== CONSOLE WELCOME MESSAGE ==========
console.log('%cWelcome to NexVolt Engineering Ltd', 'font-size: 20px; font-weight: bold; color: #0074d9;');
console.log('%cProfessional Industrial Electrical Contracting', 'font-size: 14px; color: #001f3f;');
console.log('%cCall us: +27 (0) 11 123 4567 | WhatsApp: +27 (0) 82 999 8888', 'font-size: 12px; color: #25d366;');
