import './style.css'
import Lenis from 'lenis'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Initialize Lucide Icons
if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

// Initialize Lenis for Smooth Scrolling
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothTouch: false,
  touchMultiplier: 2,
  infinite: false,
})

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      lenis.scrollTo(target);
    }
  });
});


// Integrate GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// --- Animations ---


function animateAboutSection() {
  // Kill existing About ScrollTriggers to prevent duplicates on theme change
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.id === 'about-pin') {
      trigger.kill();
    }
  });

  // --- 1. Headline word-by-word reveal ---
  const words = document.querySelectorAll('.about-word');
  if (!words.length) return;

  gsap.set(words, { opacity: 0, y: 30, filter: 'blur(8px)' });

  const isMobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 901;
  const endValue = isMobile ? '+=1000' : '+=1500';

  // Pinned scrub animation (both mobile & desktop)
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'about-pin',
      trigger: '.about-headline',
      start: 'center center',
      end: endValue,
      scrub: 1.5,
      pin: true,
    }
  });

  tl.to(words, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    stagger: 0.1,
    ease: 'power2.out',
  }, 0);

  tl.to('.about-line-muted', {
    opacity: 1,
    ease: 'none',
  }, 0.2);

  // Sort triggers by DOM order
  setTimeout(() => {
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, 50);
}

// Run on load and after theme change
window.addEventListener('DOMContentLoaded', animateAboutSection);
document.addEventListener('themechange', animateAboutSection);

// Patch theme toggle to dispatch themechange event
const origSetTheme = window.setTheme;
window.setTheme = function (theme) {
  origSetTheme(theme);
  document.dispatchEvent(new Event('themechange'));
};
// 1. Hero Section Entrance Animation (plays after preloader)
// Updated in preloader timeline below

// 1b. Hero Parallax on Scroll
gsap.to('.hero-bg-glow', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
  yPercent: 30,
  opacity: 0,
})

gsap.to('.hero-photo-wrapper', {
  scrollTrigger: {
    trigger: '.hero',
    start: 'top top',
    end: 'bottom top',
    scrub: true,
  },
  yPercent: 20,
  opacity: 0.3,
})
// 1d. Projects Intro Animation
gsap.from('.projects-intro-content > *', {
  scrollTrigger: {
    trigger: '.projects-intro',
    start: 'top 85%',
    toggleActions: 'play none none reverse',
  },
  y: 40,
  opacity: 0,
  stagger: 0.15,
  duration: 0.8,
  ease: 'power3.out',
});

// 2. Horizontal Scroll Projects Section
const projectsContainer = document.querySelector('.projects-container');
const projectsWrapper = document.querySelector('.projects-wrapper');

function setupProjectsAnimation() {
  if (!projectsContainer || !projectsWrapper) return;

  // Kill all existing project animations
  gsap.killTweensOf(projectsContainer);
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && (trigger.vars.trigger === projectsWrapper ||
      trigger.vars.trigger?.querySelector?.('.project-panel'))) {
      trigger.kill();
    }
  });

  const isDesktopLayout = window.matchMedia('(min-width: 901px)').matches;

  if (isDesktopLayout) {
    // Desktop: Horizontal scroll
    const scrollTween = gsap.to(projectsContainer, {
      x: () => -(projectsContainer.scrollWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: projectsWrapper,
        pin: true,
        scrub: 1,
        end: () => "+=" + projectsContainer.scrollWidth,
        markers: false
      }
    });

    // Animate project info on desktop
    gsap.utils.toArray('.project-info').forEach((info) => {
      gsap.from(info, {
        opacity: 0,
        y: 50,
        scrollTrigger: {
          trigger: info.parentElement,
          containerAnimation: scrollTween,
          start: "left center",
          toggleActions: "play none none reverse"
        }
      });
    });
  } else {
    // Mobile: Vertical stack - make visible immediately
    gsap.set('.project-panel', { opacity: 1, y: 0 });

    // Optional: Add fade-in on scroll for mobile
    gsap.utils.toArray('.project-panel').forEach((panel, i) => {
      gsap.from(panel, {
        scrollTrigger: {
          trigger: panel,
          start: 'top 85%',
          toggleActions: 'play none none none',
          markers: false
        },
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: i * 0.05,
        ease: 'power2.out'
      });
    });
  }
}

// Initial setup
setupProjectsAnimation();

// Handle resize with better logic
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    ScrollTrigger.getAll().forEach(t => t.refresh());
    setupProjectsAnimation();
  }, 500);
});

// 4. Custom Cursor (desktop / fine pointer only)
const cursor = document.querySelector('.custom-cursor');
const cursorLinks = document.querySelectorAll('a, .magnetic, .project-btn');

if (window.matchMedia('(pointer: fine)').matches && cursor) {
  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });

  cursorLinks.forEach(link => {
    link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
}

// 5. Magnetic Elements (desktop / fine pointer only)
if (window.matchMedia('(pointer: fine)').matches) {
  const magnetics = document.querySelectorAll('.magnetic');
  magnetics.forEach(magnetic => {
    magnetic.addEventListener('mousemove', (e) => {
      const position = magnetic.getBoundingClientRect();
      const x = e.clientX - position.left - position.width / 2;
      const y = e.clientY - position.top - position.height / 2;

      gsap.to(magnetic, {
        x: x * 0.4,
        y: y * 0.4,
        duration: 0.5,
        ease: 'power2.out'
      });
    });

    magnetic.addEventListener('mouseleave', () => {
      gsap.to(magnetic, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)'
      });
    });
  });
}

// 6. Header Hide/Show on Scroll
let lastScrollY = window.scrollY;
const header = document.querySelector('.site-header');

window.addEventListener('scroll', () => {
  if (window.scrollY > lastScrollY && window.scrollY > 100) {
    header.classList.add('hidden');
  } else {
    header.classList.remove('hidden');
  }
  lastScrollY = window.scrollY;
});

// Mobile Hamburger Menu Toggle
const hamburgerMenu = document.getElementById('hamburger-menu');
const mobileNavMenu = document.getElementById('mobile-nav-menu');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const menuCloseBtn = document.getElementById('menu-close-btn');

function toggleMobileMenu() {
  hamburgerMenu.classList.toggle('active');
  mobileNavMenu.classList.toggle('active');
}

function closeMobileMenu() {
  hamburgerMenu.classList.remove('active');
  mobileNavMenu.classList.remove('active');
}

hamburgerMenu.addEventListener('click', toggleMobileMenu);

// Close menu when close button is clicked
if (menuCloseBtn) {
  menuCloseBtn.addEventListener('click', closeMobileMenu);
}

// Close mobile menu when clicking outside (on the menu overlay)
mobileNavMenu.addEventListener('click', (e) => {
  if (e.target === mobileNavMenu) {
    closeMobileMenu();
  }
});

// Close mobile menu when a link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    closeMobileMenu();
  });
});

// ScrollSpy for mobile nav links
const sectionsToSpy = document.querySelectorAll('section[id], footer[id]');
const navSpyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      mobileNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.3 });

sectionsToSpy.forEach(sec => navSpyObserver.observe(sec));

// Mobile theme toggle
if (mobileThemeToggle) {
  mobileThemeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    setTheme(currentTheme === 'dark' ? 'light' : 'dark');
  });
}

// Theme Toggle Logic
const themeToggle = document.getElementById('theme-toggle');
const htmlEl = document.documentElement;
const sunIcon = document.querySelector('.sun-icon');
const moonIcon = document.querySelector('.moon-icon');

function setTheme(theme) {
  htmlEl.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (theme === 'dark') {
    sunIcon.style.display = 'block';
    moonIcon.style.display = 'none';
  } else {
    sunIcon.style.display = 'none';
    moonIcon.style.display = 'block';
  }
}

// Check saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else {
  setTheme('dark');
}

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlEl.getAttribute('data-theme');
  setTheme(currentTheme === 'dark' ? 'light' : 'dark');
});

// 7. Preloader Animation
const preloaderTl = gsap.timeline();
preloaderTl.to('.preloader-text', {
  opacity: 1,
  duration: 1,
  ease: "power2.inOut"
})
  .to('.preloader-progress', {
    width: '100%',
    duration: 1.5,
    ease: "power2.inOut"
  }, "-=0.5")
  .to('.preloader', {
    yPercent: -100,
    duration: 1,
    ease: "power4.inOut"
  }, "+=0.2")
  // Hero entrance animations
  .from('.hero-greeting', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  }, "-=0.4")
  .from('.hero-line', {
    y: 80,
    opacity: 0,
    duration: 0.8,
    stagger: 0.12,
    ease: "power3.out"
  }, "-=0.5")
  .from('.hero-subtitle', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out"
  }, "-=0.3")
  .from('.hero-cta-group', {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: "power3.out"
  }, "-=0.3")
  .from('.hero-photo-wrapper', {
    scale: 0.8,
    opacity: 0,
    duration: 1,
    ease: "elastic.out(1, 0.6)"
  }, "-=0.8")
  .from('.hero-scroll-indicator', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: "power2.out"
  }, "-=0.3");

// 8. Scroll Progress Indicator
window.addEventListener('scroll', () => {
  const scrollTop = window.scrollY;
  const docHeight = document.body.offsetHeight;
  const winHeight = window.innerHeight;
  const scrollPercent = scrollTop / (docHeight - winHeight);
  const scrollProgress = document.querySelector('.scroll-progress');
  if (scrollProgress) {
    scrollProgress.style.width = Math.round(scrollPercent * 100) + '%';
  }
});

// 10. About Section Animations
// Bio text slides up smoothly
gsap.from('.about-bio-text', {
  scrollTrigger: {
    trigger: '.about-bio-row',
    start: 'top 80%',
    toggleActions: 'play none none reverse',
  },
  y: 40,
  opacity: 0,
  duration: 1.1,
  ease: 'power3.out',
});



// Stats row fades up
gsap.from('.about-stats', {
  scrollTrigger: {
    trigger: '.about-stats',
    start: 'top 88%',
    toggleActions: 'play none none reverse',
  },
  y: 40,
  opacity: 0,
  duration: 0.9,
  ease: 'power3.out',
});

// Animated counters
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(stat => {
  const target = parseInt(stat.getAttribute('data-target'));
  ScrollTrigger.create({
    trigger: stat,
    start: 'top 88%',
    once: true,
    onEnter: () => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.8,
        ease: 'power2.out',
        onUpdate: function () {
          stat.textContent = Math.round(obj.val);
        },
      });
    },
  });
});

// Service cards staggered reveal
gsap.utils.toArray('.service-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: '.about-services',
      start: 'top 88%',
      toggleActions: 'play none none reverse',
    },
    opacity: 0,
    y: 40,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out',
  });
});

// 11. Chatbot Widget Interactive AI Clone Logic
const chatbotToggle = document.getElementById('chatbot-toggle-btn');
const chatbotWindow = document.getElementById('chatbot-window');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatOpenIcon = document.querySelector('.chat-open-icon');
const chatCloseIcon = document.querySelector('.chat-close-icon');
const chatbotMuteBtn = document.getElementById('chatbot-mute-btn');
const suggestionsContainer = document.getElementById('chatbot-suggestions');
const suggestionsRow = document.getElementById('suggestions-row');

// --- Feature 4: Web Audio API sound effect ---
let isMuted = false;
function playPopSound() {
  if (isMuted) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.08);
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.15);
  } catch (e) { /* Audio API not supported, silently fail */ }
}

// --- Feature 3: Context Awareness via IntersectionObserver ---
let currentSection = 'hero';
const sectionContextMap = {
  'hero': null, // no special message on hero
  'about': "I see you're exploring Juan's background. Want to know more about his experience or skills?",
  'skills': "I see you're checking out the Tech Stack! Want me to go into detail on any specific technology?",
  'work': "I see you're looking at the Projects! Would you like a summary of how any of them were built?",
  'contact': "Ready to connect? I can give you Juan's email and links right now!"
};
const sections = document.querySelectorAll('#hero, #about, #skills, #work, #contact');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentSection = entry.target.id;
    }
  });
}, { threshold: 0.4 });
sections.forEach(s => observer.observe(s));

let contextMessageSent = false;

if (chatbotToggle && chatbotWindow && chatbotForm && chatbotInput && chatbotMessages) {
  // Mute toggle
  if (chatbotMuteBtn) {
    chatbotMuteBtn.addEventListener('click', () => {
      isMuted = !isMuted;
      chatbotMuteBtn.querySelector('.mute-icon-on').style.display = isMuted ? 'none' : 'block';
      chatbotMuteBtn.querySelector('.mute-icon-off').style.display = isMuted ? 'block' : 'none';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  }

  // Toggle chatbot visibility
  chatbotToggle.addEventListener('click', () => {
    const isActive = chatbotWindow.classList.toggle('active');
    document.querySelector('.chatbot-widget').classList.toggle('active', isActive);
    if (isActive) {
      chatOpenIcon.style.display = 'none';
      chatCloseIcon.style.display = 'block';
      setTimeout(() => {
        chatbotInput.focus();
        showDefaultSuggestions(); // show starter suggestions
      }, 350);

      // Feature 3: Send context message once per open session
      if (!contextMessageSent && currentSection && sectionContextMap[currentSection]) {
        contextMessageSent = true;
        setTimeout(() => {
          appendMessage(sectionContextMap[currentSection], 'bot', true);
          playPopSound();
        }, 800);
      }
    } else {
      chatOpenIcon.style.display = 'block';
      chatCloseIcon.style.display = 'none';
      contextMessageSent = false;
      hideSuggestions();
    }
  });


  // Handle message send via form
  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userText = chatbotInput.value.trim();
    if (!userText) return;
    chatbotInput.value = '';
    sendMessage(userText);
  });

  // Feature 2: Centralized send function with dynamic typing delay
  function sendMessage(text) {
    hideSuggestions(); // hide while thinking
    appendMessage(text, 'user');
    chatbotMessages.scrollTo({ top: chatbotMessages.scrollHeight, behavior: 'smooth' });

    const typingBubble = appendTypingIndicator();
    const botResponse = getBotResponse(text);

    // Dynamic delay: base 800ms + 12ms per character of the response
    const delay = Math.min(800 + botResponse.length * 12, 3000);

    setTimeout(() => {
      typingBubble.remove();
      appendMessage(botResponse, 'bot');
      playPopSound();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      chatbotMessages.scrollTo({ top: chatbotMessages.scrollHeight, behavior: 'smooth' });
      updateSuggestions(text); // show smart follow-ups
    }, delay);
  }

  function appendMessage(text, sender, isContext = false) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}${isContext ? ' context' : ''}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = text;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const mins = now.getMinutes().toString().padStart(2, '0');
    timeSpan.textContent = `${hours}:${mins}`;

    msgDiv.appendChild(contentDiv);
    msgDiv.appendChild(timeSpan);
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTo({ top: chatbotMessages.scrollHeight, behavior: 'smooth' });
  }

  function appendTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message bot';

    const indicator = document.createElement('div');
    indicator.className = 'typing-indicator';
    indicator.innerHTML = `
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
    `;

    msgDiv.appendChild(indicator);
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTo({ top: chatbotMessages.scrollHeight, behavior: 'smooth' });
    return msgDiv;
  }

  // Smart suggestion map: keyword → follow-up suggestions
  const suggestionMap = [
    {
      keywords: ['project', 'work', 'portfolio', 'built', 'developed', 'apex', 'chef', 'gym', 'hr', 'booking'],
      pills: ['How was APEX built?', 'What stack was used?', 'Is there a live demo?']
    },
    {
      keywords: ['stack', 'skill', 'tech', 'language', 'framework', 'tool', 'react', 'node', 'php'],
      pills: ['What frontend tools?', 'Backend experience?', 'Does he use AI tools?']
    },
    {
      keywords: ['contact', 'hire', 'email', 'freelance', 'reach', 'message', 'available', 'availability'],
      pills: ['What are his rates?', 'How long per project?', 'Is he remote-friendly?']
    },
    {
      keywords: ['service', 'offer', 'speciali', 'provide'],
      pills: ['Tell me about AI solutions', 'What is Tech VA?', 'Does he do UI/UX?']
    },
    {
      keywords: ['rate', 'price', 'cost', 'budget', 'quote', 'fee'],
      pills: ['How to get a quote?', 'What is his email?', 'How long does it take?']
    },
    {
      keywords: ['experience', 'years', 'background', 'career', 'history'],
      pills: ['View his projects', 'What are his skills?', 'Where is he based?']
    },
    {
      keywords: ['ai', 'automation', 'gpt', 'llm', 'machine learning'],
      pills: ['AI in his projects?', 'What AI tools?', 'Can he build chatbots?']
    },
    {
      keywords: ['design', 'ui', 'ux', 'frontend', 'front-end'],
      pills: ['See his portfolio', 'What tools for design?', 'Is he mobile-first?']
    },
    {
      keywords: ['hello', 'hi', 'hey', 'greet', 'start'],
      pills: ['Show me his projects', 'What are his skills?', 'How to contact him?']
    },
  ];

  const defaultSuggestions = ['🚀 His projects', '⚙️ Tech stack', '📬 Contact him', '💼 Services'];

  function updateSuggestions(lastInput) {
    const normalized = lastInput.toLowerCase();
    let pills = defaultSuggestions;

    for (const entry of suggestionMap) {
      if (entry.keywords.some(k => normalized.includes(k))) {
        pills = entry.pills;
        break;
      }
    }

    suggestionsRow.innerHTML = '';
    pills.forEach((text, i) => {
      const btn = document.createElement('button');
      btn.className = 'suggestion-pill';
      btn.textContent = text;
      btn.style.animationDelay = `${i * 0.06}s`;
      btn.addEventListener('click', () => {
        chatbotInput.value = text;
        hideSuggestions();
        sendMessage(text);
        chatbotInput.value = '';
      });
      suggestionsRow.appendChild(btn);
    });

    suggestionsContainer.classList.add('visible');
  }

  function hideSuggestions() {
    suggestionsContainer.classList.remove('visible');
  }

  // Show default suggestions when chat opens
  function showDefaultSuggestions() {
    updateSuggestions('hello');
  }

  function getBotResponse(input) {
    const normalized = input.toLowerCase().trim();

    // --- Easter Egg: Magic Word ---
    if (normalized === 'magic word') {
      return "Tanginamo.";
    }

    // --- Greetings (echoed back naturally) ---
    if (/^(hello|hi|hy|hey|greetings|good morning|good afternoon|good evening|sup|what's up|howdy|yo|hiya)/.test(normalized)) {
      const greetMap = {
        'hello': 'Hello.',
        'hi': 'Hi.',
        'hy': 'Hy.',
        'hey': 'Hey.',
        'yo': 'Hello.',
        'sup': 'Hello.',
        'howdy': 'Hello.',
        'hiya': 'Hi.',
        'greetings': 'Greetings.',
        'good morning': 'Good morning.',
        'good afternoon': 'Good afternoon.',
        'good evening': 'Good evening.',
        "what's up": 'Hello.',
      };
      let echo = 'Hello.';
      for (const key of Object.keys(greetMap)) {
        if (normalized.startsWith(key)) { echo = greetMap[key]; break; }
      }
      return `${echo} I am JARVIS, the virtual assistant of Juan Miguel Repas. How may I assist you today?`;
    }

    // --- Goodbye ---
    if (normalized.includes('bye') || normalized.includes('goodbye') || normalized.includes('see you') || normalized.includes('take care') || normalized.includes('later')) {
      return "Goodbye. Should you have any further inquiries, do not hesitate to return. I am always available.";
    }

    // --- Thank you ---
    if (normalized.includes('thank') || normalized.includes('thanks') || normalized.includes('appreciate')) {
      return "You are welcome. It is my purpose to assist. Is there anything else I can help you with?";
    }

    // --- Projects ---
    if (normalized.includes('project') || normalized.includes('work') || normalized.includes('portfolio') || normalized.includes('built') || normalized.includes('developed')) {
      return "Juan has developed 5 key web applications:<br><br>• <strong>APEX Performance Medicine</strong>: A premium concierge longevity and performance medicine website deployed on Vercel. Built with React and Tailwind CSS.<br>• <strong>Chef Caleb's Platform</strong>: A React culinary coaching website with a digital store and Stripe-integrated checkout.<br>• <strong>Elevate Gym</strong>: A high-performance fitness platform with class scheduling and membership management built in Next.js.<br>• <strong>HR Management System</strong>: A secure enterprise-grade internal employee onboarding and payroll dashboard built with PHP and MySQL.<br>• <strong>Booking System</strong>: A real-time reservation platform with automated confirmations.<br><br>Detailed documentation for each project is available in the Work section — just click the Documentation button on any project!";
    }

    // --- Tech Stack ---
    if (normalized.includes('stack') || normalized.includes('skill') || normalized.includes('tech') || normalized.includes('language') || normalized.includes('framework') || normalized.includes('tool')) {
      return "Juan's core technology stack includes:<br><br>• <strong>Frontend</strong>: HTML5, CSS3, JavaScript, React, Next.js, Vue.js<br>• <strong>Backend</strong>: Node.js, Express, PHP, Python<br>• <strong>Databases</strong>: MongoDB, MySQL, PostgreSQL<br>• <strong>Mobile Applications</strong>: Flutter<br>• <strong>Dev Tools</strong>: Git, GitHub, Vite, Figma, Postman";
    }

    // --- Contact ---
    if (normalized.includes('contact') || normalized.includes('hire') || normalized.includes('email') || normalized.includes('freelance') || normalized.includes('onlinejobs') || normalized.includes('reach') || normalized.includes('message')) {
      return "For inquiries or potential collaborations, please contact Juan through the following channels:<br><br>• <strong>Email</strong>: <a href='mailto:repasjuanmiguel@gmail.com' style='color:inherit; text-decoration:underline;'>repasjuanmiguel@gmail.com</a><br>• <strong>OnlineJobs Profile</strong>: Available via the link in the footer.<br>• <strong>Professional Resume</strong>: Available for download in the footer.";
    }

    // --- APEX Performance Medicine ---
    if (normalized.includes('apex') || normalized.includes('performance medicine') || normalized.includes('longevity') || normalized.includes('wellness') || normalized.includes('medical')) {
      return "APEX Performance Medicine is Juan's latest project — a premium concierge longevity and health optimization website. It features a cinematic hero section, detailed services showcase, and a consultation booking CTA, all built with React, Tailwind CSS, and deployed on Vercel. You can view it live at <a href='https://apex-performance-jmr.vercel.app/' target='_blank' style='color:inherit; text-decoration:underline;'>apex-performance-jmr.vercel.app</a>.";
    }

    // --- Availability ---
    if (normalized.includes('available') || normalized.includes('availability') || normalized.includes('open') || normalized.includes('accept') || normalized.includes('taking')) {
      return "Juan is currently open and available for freelance projects and consulting engagements. He accepts both short-term and long-term contracts. To discuss your project requirements, please send details to <a href='mailto:repasjuanmiguel@gmail.com' style='color:inherit; text-decoration:underline;'>repasjuanmiguel@gmail.com</a>.";
    }

    // --- Resume / CV ---
    if (normalized.includes('resume') || normalized.includes('cv') || normalized.includes('curriculum')) {
      return "Juan's professional resume is available for immediate download. You may find the download link in the footer section of this portfolio.";
    }

    // --- GitHub ---
    if (normalized.includes('github') || normalized.includes('repository') || normalized.includes('repo') || normalized.includes('code')) {
      return "Juan maintains an active GitHub profile where selected open-source contributions and personal projects are showcased. The GitHub link is accessible from the footer section of this page.";
    }

    // --- Front-End Focus ---
    if (normalized.includes('design') || normalized.includes('ui') || normalized.includes('ux') || normalized.includes('frontend') || normalized.includes('front-end')) {
      return "Juan specializes in modern front-end development, focusing on responsive layout design, fluid animations, mobile-first optimization, and seamless user experiences using tools like React, Next.js, CSS3, and GSAP.";
    }

    // --- AI and Automation ---
    if (normalized.includes('ai') || normalized.includes('automation') || normalized.includes('gpt') || normalized.includes('llm') || normalized.includes('machine learning') || normalized.includes('artificial intelligence')) {
      return "Juan integrates advanced AI and automation solutions, including natural language processing applications, large language model API configurations, intelligent chatbot systems, and custom workflow automation pipelines tailored for business operations.";
    }

    // --- Experience ---
    if (normalized.includes('experience') || normalized.includes('years') || normalized.includes('history') || normalized.includes('background') || normalized.includes('career')) {
      return "Juan has over 3 years of professional experience in full-stack web engineering, digital solution architecture, and AI integration, having successfully delivered over 15 distinct software projects for a range of clients and industries.";
    }

    // --- Services ---
    if (normalized.includes('service') || normalized.includes('offer') || normalized.includes('provide') || normalized.includes('speciali')) {
      return "Juan offers the following professional services:<br><br>• Front-End Web Development<br>• Technical Virtual Assistance (Tech VA)<br>• Custom AI integration and workflow automation<br>• UI/UX design and mobile-first responsive optimization<br>• API integration and third-party system connectivity";
    }

    // --- Location ---
    if (normalized.includes('location') || normalized.includes('country') || normalized.includes('where') || normalized.includes('based') || normalized.includes('philippines') || normalized.includes('timezone')) {
      return "Juan is based in the Philippines and operates remotely, accommodating clients across international time zones including US, UK, EU, and Asia-Pacific regions with consistent and responsive communication.";
    }

    // --- Rates / Pricing ---
    if (normalized.includes('rate') || normalized.includes('price') || normalized.includes('cost') || normalized.includes('budget') || normalized.includes('quote') || normalized.includes('fee') || normalized.includes('charge')) {
      return "Freelance rates and project fees are structured according to complexity, timeline, and unique requirements. To receive a formal project proposal and cost estimate, please send your project details to <a href='mailto:repasjuanmiguel@gmail.com' style='color:inherit; text-decoration:underline;'>repasjuanmiguel@gmail.com</a>.";
    }

    // --- Education ---
    if (normalized.includes('education') || normalized.includes('degree') || normalized.includes('study') || normalized.includes('university') || normalized.includes('college') || normalized.includes('school')) {
      return "Juan holds strong computational and engineering knowledge built through rigorous self-directed research, formal coursework in software engineering principles, and advanced applied learning in front-end technologies and AI-driven application design.";
    }

    // --- Process / Workflow ---
    if (normalized.includes('process') || normalized.includes('workflow') || normalized.includes('approach') || normalized.includes('methodology') || normalized.includes('how do you work')) {
      return "Juan follows a structured project workflow:<br><br>1. Discovery and requirements gathering<br>2. System architecture and design planning<br>3. Iterative development with regular client updates<br>4. Quality assurance and security review<br>5. Deployment, documentation, and post-launch support";
    }

    // --- Collaboration / Team ---
    if (normalized.includes('team') || normalized.includes('collaborat') || normalized.includes('partner') || normalized.includes('together') || normalized.includes('work with')) {
      return "Juan is highly collaborative and has experience working within both independent freelance and cross-functional team environments. He adapts to client-preferred communication tools such as Slack, Trello, Notion, or direct email correspondence.";
    }

    // --- Timeline / Deadline ---
    if (normalized.includes('timeline') || normalized.includes('deadline') || normalized.includes('how long') || normalized.includes('duration') || normalized.includes('delivery')) {
      return "Project timelines vary depending on scope and complexity. Simple landing pages may be delivered within a few days, while full-scale web applications typically require two to six weeks. Juan provides realistic delivery estimates during the proposal phase.";
    }

    // --- Testimonials / Reviews ---
    if (normalized.includes('testimonial') || normalized.includes('review') || normalized.includes('feedback') || normalized.includes('client') || normalized.includes('opinion')) {
      return "Client satisfaction is central to Juan's professional practice. He has received consistent positive feedback for his attention to detail, reliable delivery timelines, and high-quality output. References and work samples are available upon request.";
    }

    // --- Strengths ---
    if (normalized.includes('strength') || normalized.includes('best at') || normalized.includes('strongest') || normalized.includes('good at') || normalized.includes('expert')) {
      return "Juan's core professional strengths include rapid full-stack prototyping, clean and maintainable code architecture, responsive UI/UX implementation, secure backend design, and proactive client communication throughout the development process.";
    }

    // --- Jokes ---
    if (normalized.includes('joke') || normalized.includes('funny') || normalized.includes('humor') || normalized.includes('laugh')) {
      const jokes = [
        "Why do programmers wear glasses? Because they cannot C#.",
        "How many programmers does it take to change a light bulb? None, that is a hardware issue.",
        "There are 10 types of people in this world: Those who understand binary, and those who do not.",
        "A developer walks into a bar and orders 1 beer, then 0 beers. The bartender serves 0. The developer says: I have not started yet."
      ];
      return jokes[Math.floor(Math.random() * jokes.length)];
    }

    // --- Capabilities ---
    if (normalized.includes('what can you do') || normalized.includes('help me with') || normalized.includes('your purpose')) {
      return "As an AI assistant, I am trained to provide comprehensive details about Juan's portfolio. I can discuss his <strong>tech stack</strong>, <strong>projects</strong>, <strong>professional experience</strong>, <strong>services</strong>, <strong>availability</strong>, and provide his <strong>contact information</strong>. What would you like to know?";
    }

    // --- How are you ---
    if (normalized.includes('how are you') || normalized.includes('how do you do') || normalized.includes('how have you been')) {
      return "I am operating at optimal efficiency, thank you for inquiring. I am here to help you learn more about Juan Miguel Repas. How may I assist you today?";
    }

    // --- Are you human/bot ---
    if (normalized.includes('are you human') || normalized.includes('are you a bot') || normalized.includes('real person') || normalized.includes('are you ai')) {
      return "I am an artificial intelligence assistant, specifically engineered to guide you through Juan's professional portfolio. While I am not human, I am programmed to provide you with all the information you might need regarding his work and expertise.";
    }

    // --- Identity ---
    if (normalized.includes('who are you') || normalized.includes('what are you') || normalized.includes('jarvis') || normalized.includes('your name') || normalized.includes('introduce')) {
      return "I am JARVIS, the virtual AI assistant of Juan Miguel Repas. I can provide information on his professional background, services, completed projects, technology stack, availability, and contact details.";
    }

    // --- About Juan ---
    if (normalized.includes('about') || normalized.includes('juan') || normalized.includes('tell me more') || normalized.includes('who is')) {
      return "Juan Miguel Repas is a Front-End Developer, Technical Virtual Assistant, and AI Solutions Integrator based in the Philippines. He builds responsive, mobile-first, and high-performance web applications for clients across various industries globally.";
    }

    // --- Default fallback ---
    const fallbacks = [
      "That is an excellent question, though it falls slightly outside my current training data. For a definitive answer, I highly recommend contacting Juan directly at <a href='mailto:repasjuanmiguel@gmail.com' style='color:inherit; text-decoration:underline;'>repasjuanmiguel@gmail.com</a>.",
      "I am still learning and do not have the precise data to answer that. However, I can assist you with details about Juan's <strong>projects</strong>, <strong>skills</strong>, or <strong>experience</strong>. Alternatively, you can email him directly!",
      "I appreciate your curiosity. While I cannot process that specific request, I am fully equipped to discuss Juan's web development expertise and availability. How else may I assist you?"
    ];
    return fallbacks[Math.floor(Math.random() * fallbacks.length)];
  }
}

// =============================================
// SCROLL TO TOP BUTTON
// =============================================

const scrollTopBtn = document.getElementById('scroll-top-btn');

lenis.on('scroll', ({ scroll }) => {
  if (scroll > 400) {
    scrollTopBtn.classList.add('visible');
  } else {
    scrollTopBtn.classList.remove('visible');
  }
});

scrollTopBtn.addEventListener('click', () => {
  lenis.scrollTo(0, { duration: 1.5, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
});

if (typeof lucide !== 'undefined') lucide.createIcons();

// =============================================
// DOCUMENTATION MODAL
// =============================================

const projectDocs = {
  apex: {
    number: '01',
    category: 'Health & Wellness',
    title: 'APEX Performance Medicine',
    subtitle: 'A premium concierge longevity and performance medicine website built for health-conscious individuals seeking advanced medical optimization.',
    liveUrl: 'https://apex-performance-jmr.vercel.app/',
    overview: 'APEX Performance Medicine is a high-end medical wellness brand website designed to convey trust, authority, and premium quality. The site is tailored for a concierge-style clientele who expect a seamless, sophisticated digital experience that matches the caliber of the services offered.',
    tech: ['React', 'Tailwind CSS', 'Framer Motion', 'Vercel', 'Vite'],
    features: [
      'Premium hero section with bold typography and cinematic visuals',
      'Detailed services showcase with smooth scroll animations',
      'Consultation booking CTA with urgency-driven copy',
      'Mobile-first responsive design across all breakpoints',
      'Contact form integrated for patient inquiries',
      'Dark luxury aesthetic matching the brand identity',
      'Fast-loading and SEO-optimized for Google ranking',
      'Custom scroll-triggered reveal animations',
    ],
    process: 'The project started with brand research and defining the visual language — dark backgrounds, gold accents, and clean typography to evoke trust and exclusivity. I built the site using React and Tailwind CSS with Framer Motion handling all scroll-triggered and entrance animations. The layout was designed mobile-first, then scaled up for desktop, with careful attention to white space and hierarchy. Deployed on Vercel for instant, globally distributed delivery.',
    screenshots: [
      '/PROJECTS/APEX%20PERFORMANCE/HERO%20SECTION.png',
      '/PROJECTS/APEX%20PERFORMANCE/SERVICES.png',
      '/PROJECTS/APEX%20PERFORMANCE/CONTACT.png',
    ],
  },
  chefcaleb: {
    number: '02',
    category: 'E-Commerce & Coaching',
    title: "Chef Caleb's Website",
    subtitle: 'A complete culinary coaching platform with a digital product store, integrated checkout, and an automated countdown sale system.',
    liveUrl: 'https://chefcalebweb.netlify.app',
    overview: "Chef Caleb's Website is a full-stack culinary coaching platform designed to sell digital products, courses, and coaching sessions online. The platform includes a custom product store, a Stripe-powered checkout, and a countdown sale system that automatically activates and deactivates promotions.",
    tech: ['React', 'Node.js', 'Stripe API', 'Netlify', 'MongoDB'],
    features: [
      'Custom digital product store with category filtering',
      'Stripe payment integration for secure checkout',
      'Automated countdown timer for flash sales',
      'Admin dashboard for product and order management',
      'Dynamic hero section with brand photography',
      'Email confirmation for orders via NodeMailer',
      'Responsive layout for mobile and desktop',
      'SEO optimization for culinary niche keywords',
    ],
    process: "The platform was built in phases. First, the front-end React app was scaffolded with a clean, food-inspired design system. Then, a Node.js/Express backend was built to handle product CRUD, order processing, and Stripe webhooks. The automated countdown sale system uses a cron-job-like scheduler that checks sale dates and toggles promotional pricing dynamically. Deployed on Netlify (frontend) and a cloud server for the backend.",
    screenshots: [
      '/project_1.png',
      '/project_1b.png',
      '/project_1_new.png',
    ],
  },
  elevategym: {
    number: '03',
    category: 'Fitness & Wellness',
    title: 'Elevate Gym',
    subtitle: 'A high-performance fitness platform interface designed for maximum user engagement with class scheduling and member management.',
    liveUrl: 'https://elevategymweb.netlify.app',
    overview: 'Elevate Gym is a feature-rich fitness platform UI built for a modern gym brand. It focuses on member engagement through a clean, energetic interface that showcases classes, trainer profiles, and membership tiers to drive sign-ups and retention.',
    tech: ['Next.js', 'Tailwind CSS', 'MongoDB', 'Netlify'],
    features: [
      'Interactive class scheduling and booking system',
      'Trainer profile pages with specialization details',
      'Membership tier comparison and sign-up flow',
      'Dynamic workout program showcase',
      'Fitness progress tracking dashboard UI',
      'Hero section with high-energy brand photography',
      'Fully mobile-responsive across all screen sizes',
      'Smooth page transitions and micro-animations',
    ],
    process: 'The design was inspired by premium fitness brands — bold typography, high-contrast colors, and strong imagery. Built with Next.js for server-side rendering and optimal performance, and Tailwind CSS for rapid, consistent styling. MongoDB handles member data and class schedules. The trainer profiles and class pages use dynamic routing for a scalable content structure.',
    screenshots: [
      '/project_2.png',
      '/project_2b.png',
      '/project_2c.png',
    ],
  },
  hrsystem: {
    number: '04',
    category: 'Enterprise Dashboard',
    title: 'HR Management System',
    subtitle: 'An enterprise-grade internal dashboard for streamlining employee onboarding, payroll, and performance tracking across departments.',
    liveUrl: null,
    overview: 'This HR Management System is an internal enterprise tool built for a company to centralize and automate their HR workflows. It handles the complete employee lifecycle — from onboarding to payroll processing and performance reviews — across multiple departments.',
    tech: ['PHP', 'MySQL', 'HTML5', 'CSS3', 'JavaScript'],
    features: [
      'Employee onboarding workflow with document management',
      'Automated payroll calculation and generation',
      'Performance review cycles with rating system',
      'Department and team hierarchy management',
      'Role-based access control (RBAC) for HR, managers, and employees',
      'Leave and attendance tracking with calendar view',
      'Reporting dashboard with exportable data (CSV/PDF)',
      'Audit logs for compliance and data integrity',
    ],
    process: 'This was a complex enterprise project built with PHP on the backend and MySQL for relational data management. PHP handled all server-side logic — from employee CRUD operations to payroll calculation and session-based authentication. MySQL stored all relational data with normalized tables for employees, departments, payroll, and performance records. RBAC was implemented early to ensure data security across all user roles, with different views and permissions for HR admins, managers, and employees.',
    screenshots: [
      '/project_3.png',
      '/project_3b.png',
      '/project_3c.png',
    ],
  },
  booking: {
    number: '05',
    category: 'Service Platform',
    title: 'Booking System',
    subtitle: 'A comprehensive booking and reservation platform for service-based businesses with real-time availability and automated confirmations.',
    liveUrl: null,
    overview: 'The Booking System is a full-featured reservation platform designed for service-based businesses. It allows customers to browse available time slots, book appointments, and receive automated confirmation emails — all in a seamless, self-service flow.',
    tech: ['JavaScript', 'HTML5', 'CSS3', 'Node.js', 'Firebase'],
    features: [
      'Real-time availability calendar with slot management',
      'Customer self-service appointment booking',
      'Automated email confirmations via SendGrid',
      'Admin panel for managing bookings and availability',
      'Cancellation and rescheduling system',
      'Business hours and holiday configuration',
      'SMS notification integration',
      'Mobile-first responsive interface',
    ],
    process: 'The booking system was built with vanilla JavaScript on the front-end for speed and simplicity, with a Node.js backend managing the scheduling logic and Firebase Firestore for real-time data sync. The availability algorithm checks for conflicts in real-time so double-bookings are impossible. Email confirmations are sent automatically using SendGrid webhooks on booking confirmation and cancellation events.',
    screenshots: [
      '/PROJECTS/BOOKING SYSTEM/Screenshot 2026-05-27 195839.png',
      '/PROJECTS/BOOKING SYSTEM/Screenshot 2026-05-27 195852.png',
      '/PROJECTS/BOOKING SYSTEM/Screenshot 2026-05-27 195903.png',
    ],
  },
};

// DOM references
const docsModal = document.getElementById('docs-modal');
const docsModalClose = document.getElementById('docs-modal-close');
const docsModalNumber = document.getElementById('docs-modal-number');
const docsModalCategory = document.getElementById('docs-modal-category');
const docsModalTitle = document.getElementById('docs-modal-title');
const docsModalSubtitle = document.getElementById('docs-modal-subtitle');
const docsModalLinks = document.getElementById('docs-modal-links');
const docsOverview = document.getElementById('docs-overview');
const docsTechList = document.getElementById('docs-tech-list');
const docsFeaturesList = document.getElementById('docs-features-list');
const docsProcess = document.getElementById('docs-process');
const docsScreenshots = document.getElementById('docs-screenshots');

function openDocsModal(projectId) {
  const data = projectDocs[projectId];
  if (!data) return;

  // Populate content
  docsModalNumber.textContent = data.number;
  docsModalCategory.textContent = data.category;
  docsModalTitle.textContent = data.title;
  docsModalSubtitle.textContent = data.subtitle;

  // Links
  docsModalLinks.innerHTML = '';
  if (data.liveUrl) {
    docsModalLinks.innerHTML += `<a href="${data.liveUrl}" target="_blank"><i data-lucide="arrow-up-right"></i> View Live Site</a>`;
  } else {
    docsModalLinks.innerHTML += `<a href="#" style="opacity:0.5; pointer-events:none;"><i data-lucide="lock"></i> Internal / Coming Soon</a>`;
  }

  // Overview
  docsOverview.textContent = data.overview;

  // Tech
  docsTechList.innerHTML = data.tech.map(t => `<span>${t}</span>`).join('');

  // Features
  docsFeaturesList.innerHTML = data.features.map(f => `<li>${f}</li>`).join('');

  // Process
  docsProcess.textContent = data.process;

  // Screenshots
  docsScreenshots.innerHTML = data.screenshots.map(src => `<img src="${src}" alt="Screenshot" loading="lazy" />`).join('');

  // Activate modal
  docsModal.classList.add('active');
  docsModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lenis.stop();

  // Re-init lucide icons inside modal
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeDocsModal() {
  docsModal.classList.remove('active');
  docsModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  lenis.start();
}

// Attach to doc buttons
document.querySelectorAll('.doc-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const projectId = btn.getAttribute('data-project-id');
    openDocsModal(projectId);
  });
});

// Close button
docsModalClose.addEventListener('click', closeDocsModal);

// Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && docsModal.classList.contains('active')) {
    closeDocsModal();
  }
});

// ==========================================
// Contact Form Submission (Web3Forms)
// ==========================================
const contactForm = document.getElementById('contact-form');
const formResult = document.getElementById('form-result');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const formData = new FormData(contactForm);
    const object = Object.fromEntries(formData);
    const json = JSON.stringify(object);

    formResult.textContent = 'Sending message...';
    formResult.className = 'form-result'; // reset classes
    formResult.style.display = 'block';

    const submitBtn = document.getElementById('submit-btn');
    submitBtn.style.opacity = '0.7';
    submitBtn.style.pointerEvents = 'none';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: json
    })
      .then(async (response) => {
        let json = await response.json();
        if (response.status == 200) {
          formResult.textContent = "Message sent successfully! I'll get back to you soon.";
          formResult.classList.add('success');
          contactForm.reset();
        } else {
          console.log(response);
          formResult.textContent = json.message || "Something went wrong!";
          formResult.classList.add('error');
        }
      })
      .catch((error) => {
        console.log(error);
        formResult.textContent = "Something went wrong! Please try again later.";
        formResult.classList.add('error');
      })
      .finally(() => {
        submitBtn.style.opacity = '1';
        submitBtn.style.pointerEvents = 'all';
        setTimeout(() => {
          formResult.style.display = 'none';
          formResult.className = 'form-result';
        }, 5000);
      });
  });
}

// ==========================================
// Tech Stack Marquee Interactions (Touch & Hover)
// ==========================================
const techCards = document.querySelectorAll('.tech-card');

techCards.forEach(card => {
  const glowColor = card.getAttribute('data-glow');
  if (glowColor) {
    // Set custom glow properties dynamically
    card.style.setProperty('--glow-color', glowColor);
    card.style.setProperty('--glow-shadow', glowColor + '40'); // Hex-Alpha ~25% opacity
  }

  // Handle Touch Events (Mobile/Tablet)
  card.addEventListener('touchstart', (e) => {
    // Prevent default tap behavior if you want to explicitly handle glow, 
    // but leave it natural for links/a tag wraps.
    const marquee = card.closest('.tech-marquee');

    // Clear active/paused from all other cards/marquees
    document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tech-marquee').forEach(m => m.classList.remove('paused'));

    // Activate current card and pause current marquee
    card.classList.add('active');
    if (marquee) {
      marquee.classList.add('paused');
    }

    // Auto-resume after 2.5 seconds
    if (card.touchTimeout) clearTimeout(card.touchTimeout);
    card.touchTimeout = setTimeout(() => {
      card.classList.remove('active');
      if (marquee) {
        marquee.classList.remove('paused');
      }
    }, 2500);
  }, { passive: true });
});

// Clear active states on tap outside the tech section
document.addEventListener('touchstart', (e) => {
  if (!e.target.closest('.tech-stack-section')) {
    document.querySelectorAll('.tech-card').forEach(c => c.classList.remove('active'));
    document.querySelectorAll('.tech-marquee').forEach(m => m.classList.remove('paused'));
  }
}, { passive: true });

// ==========================================
// Canvas Particle Mesh Network
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById('hero-particles');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    const mouse = {
      x: null,
      y: null,
      radius: 180
    };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    window.addEventListener('mouseout', () => {
      mouse.x = null;
      mouse.y = null;
    });

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 0.8;
        this.vy = (Math.random() - 0.5) * 0.8;
        this.size = Math.random() * 2 + 1;
        this.color = 'rgba(255, 255, 255, 0.4)';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges
        if (this.x < 0 || this.x > width) this.vx *= -1;
        if (this.y < 0 || this.y > height) this.vy *= -1;

        // Mouse interaction
        if (mouse.x != null) {
          let dx = mouse.x - this.x;
          let dy = mouse.y - this.y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < mouse.radius) {
            const forceDirectionX = dx / distance;
            const forceDirectionY = dy / distance;
            const force = (mouse.radius - distance) / mouse.radius;
            // Particles gently repel from mouse
            this.x -= forceDirectionX * force * 3;
            this.y -= forceDirectionY * force * 3;
          }
        }
      }

      draw(particleColor) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();
      }
    }

    function initParticles() {
      particles = [];
      let numberOfParticles = Math.min((width * height) / 12000, 150); // limit for performance
      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      ctx.clearRect(0, 0, width, height);

      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      const pColor = isLight ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
      const lColorRGB = isLight ? '0, 0, 0' : '255, 255, 255';

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw(pColor);

        for (let j = i; j < particles.length; j++) {
          let dx = particles[i].x - particles[j].x;
          let dy = particles[i].y - particles[j].y;
          let distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${lColorRGB}, ${(1 - distance / 150) * 0.25})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
  }
});
