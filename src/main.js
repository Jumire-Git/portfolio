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
  direction: 'vertical',
  gestureDirection: 'vertical',
  smooth: true,
  mouseMultiplier: 1,
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

function raf(time) {
  lenis.raf(time)
  requestAnimationFrame(raf)
}

requestAnimationFrame(raf)

// Integrate GSAP with Lenis
lenis.on('scroll', ScrollTrigger.update)

gsap.ticker.add((time) => {
  lenis.raf(time * 1000)
})

gsap.ticker.lagSmoothing(0)

// --- Animations ---

// About Section Animations
import { ScrollTrigger as ST } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ST);

function animateAboutSection() {
  // Kill existing About ScrollTriggers to prevent duplicates on theme change
  ScrollTrigger.getAll().forEach(trigger => {
    if (trigger.vars && trigger.vars.id === 'about-pin') {
      trigger.kill();
    }
  });

  // --- 1. Headline word-by-word reveal (Pinned) ---
  const words = document.querySelectorAll('.about-word');
  if (!words.length) return;

  gsap.set(words, { opacity: 0, y: 30 });

  // Create a timeline that pins the headline and scrubs the animation
  const tl = gsap.timeline({
    scrollTrigger: {
      id: 'about-pin',
      trigger: '.about-headline',
      start: 'center center', // Lock when the headline reaches the center of the viewport
      end: '+=1500', // Stay locked for 1500px of scrolling
      scrub: 1.5, // Smooth scrubbing
      pin: true, // Pin the section
    }
  });

  // Animate all words in with stagger
  tl.to(words, {
    opacity: 1,
    y: 0,
    stagger: 0.1,
    ease: 'power2.out',
  }, 0);

  // Animate muted lines: brighten opacity as they enter
  tl.to('.about-line-muted', {
    opacity: 1,
    ease: 'none',
  }, 0.2); // Start slightly after the first words

  // Sort triggers by DOM order so the About section pin is calculated BEFORE the Projects section pin
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

// 4. Custom Cursor
const cursor = document.querySelector('.custom-cursor');
const cursorLinks = document.querySelectorAll('a, .magnetic, .project-btn');

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

cursorLinks.forEach(link => {
  link.addEventListener('mouseenter', () => cursor.classList.add('hover'));
  link.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// 5. Magnetic Elements
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

function toggleMobileMenu() {
  hamburgerMenu.classList.toggle('active');
  mobileNavMenu.classList.toggle('active');
}

hamburgerMenu.addEventListener('click', toggleMobileMenu);

// Close mobile menu when a link is clicked
mobileNavLinks.forEach(link => {
  link.addEventListener('click', () => {
    hamburgerMenu.classList.remove('active');
    mobileNavMenu.classList.remove('active');
  });
});

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
const quickReplyChips = document.querySelectorAll('.quick-reply-chip');

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
    if (isActive) {
      chatOpenIcon.style.display = 'none';
      chatCloseIcon.style.display = 'block';
      setTimeout(() => chatbotInput.focus(), 300);

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
      contextMessageSent = false; // Reset so the next open can show context again
    }
  });

  // Feature 1: Quick-reply chip click handler
  quickReplyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const query = chip.dataset.query;
      if (!query) return;
      sendMessage(query);
    });
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
    appendMessage(text, 'user');
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    const typingBubble = appendTypingIndicator();
    const botResponse = getBotResponse(text);

    // Dynamic delay: base 800ms + 12ms per character of the response
    const delay = Math.min(800 + botResponse.length * 12, 3000);

    setTimeout(() => {
      typingBubble.remove();
      appendMessage(botResponse, 'bot');
      playPopSound();
      if (typeof lucide !== 'undefined') lucide.createIcons();
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
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
  }

  function appendTypingIndicator() {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'chat-message bot typing-indicator';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = `
      <div class="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    `;
    msgDiv.appendChild(contentDiv);
    chatbotMessages.appendChild(msgDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    return msgDiv;
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
      return "Juan has developed several key web applications:<br><br>• <strong>Chef Caleb's Platform</strong>: A React culinary coaching website with secure Stripe integrated checkout.<br>• <strong>Elevate Gym</strong>: A high-performance dynamic user interface developed in Next.js.<br>• <strong>HR Dashboard</strong>: A secure enterprise-grade corporate employee onboarding and department dashboard.<br><br>Detailed descriptions and live project links are available in the Work section.";
    }

    // --- Tech Stack ---
    if (normalized.includes('stack') || normalized.includes('skill') || normalized.includes('tech') || normalized.includes('language') || normalized.includes('framework') || normalized.includes('tool')) {
      return "Juan's core technology stack includes:<br><br>• <strong>Frontend</strong>: HTML5, CSS3, JavaScript, React, Next.js, Vue.js<br>• <strong>Backend</strong>: Node.js, Express, PHP, Python<br>• <strong>Databases</strong>: MongoDB, MySQL, PostgreSQL<br>• <strong>Mobile Applications</strong>: Flutter<br>• <strong>Dev Tools</strong>: Git, GitHub, Vite, Figma, Postman";
    }

    // --- Contact ---
    if (normalized.includes('contact') || normalized.includes('hire') || normalized.includes('email') || normalized.includes('freelance') || normalized.includes('onlinejobs') || normalized.includes('reach') || normalized.includes('message')) {
      return "For inquiries or potential collaborations, please contact Juan through the following channels:<br><br>• <strong>Email</strong>: <a href='mailto:repasjuanmiguel@gmail.com' style='color:inherit; text-decoration:underline;'>repasjuanmiguel@gmail.com</a><br>• <strong>OnlineJobs Profile</strong>: Available via the link in the footer.<br>• <strong>Professional Resume</strong>: Available for download in the footer.";
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

    // --- Cybersecurity ---
    if (normalized.includes('cyber') || normalized.includes('security') || normalized.includes('secure') || normalized.includes('hacking') || normalized.includes('vulnerability')) {
      return "Security is a core discipline in Juan's development practice. He implements secure development lifecycles, encrypted credential storage, API authentication, input validation, and threat mitigation strategies across all systems he builds.";
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
      return "Juan offers the following professional services:<br><br>• Full-stack web application development<br>• Custom AI integration and workflow automation<br>• Infrastructure security audits and threat mitigation<br>• Technical virtual assistance for business operations<br>• API design, integration, and third-party system connectivity";
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
      return "Juan holds strong computational and engineering knowledge built through rigorous self-directed research, formal coursework in software engineering principles, and advanced applied learning in cybersecurity and AI-driven application design.";
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
      return "Juan Miguel Repas is a Full-Stack Developer, AI Solutions Integrator, and Cybersecurity advocate based in the Philippines. He builds scalable, secure, and high-performance web and mobile applications for clients across various industries globally.";
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
