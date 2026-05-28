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

// 9. Tech Stack Cards Staggered Reveal
gsap.utils.toArray('.tech-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: card,
      start: 'top 90%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 40,
    scale: 0.9,
    duration: 0.6,
    delay: i * 0.05,
    ease: 'power3.out'
  });
});

// 10. About Section Animations
// Slide in image and text
gsap.from('.about-image-wrapper', {
  scrollTrigger: { trigger: '.about', start: 'top 75%', toggleActions: 'play none none reverse' },
  x: -60,
  opacity: 0,
  duration: 1,
  ease: 'power3.out'
});
gsap.from('.about-text-wrapper', {
  scrollTrigger: { trigger: '.about', start: 'top 75%', toggleActions: 'play none none reverse' },
  x: 60,
  opacity: 0,
  duration: 1,
  ease: 'power3.out'
});

// Animated counters
const statNumbers = document.querySelectorAll('.stat-number');
statNumbers.forEach(stat => {
  const target = parseInt(stat.getAttribute('data-target'));
  ScrollTrigger.create({
    trigger: stat,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.to(stat, {
        duration: 1.5,
        ease: 'power2.out',
        onUpdate: function () {
          stat.textContent = Math.round(this.progress() * target);
        }
      });
    }
  });
});

// Service cards staggered reveal
gsap.utils.toArray('.service-card').forEach((card, i) => {
  gsap.from(card, {
    scrollTrigger: {
      trigger: '.about-services',
      start: 'top 85%',
      toggleActions: 'play none none reverse'
    },
    opacity: 0,
    y: 50,
    duration: 0.7,
    delay: i * 0.1,
    ease: 'power3.out'
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

if (chatbotToggle && chatbotWindow && chatbotForm && chatbotInput && chatbotMessages) {
  // Toggle chatbot visibility
  chatbotToggle.addEventListener('click', () => {
    const isActive = chatbotWindow.classList.toggle('active');
    if (isActive) {
      chatOpenIcon.style.display = 'none';
      chatCloseIcon.style.display = 'block';
      // Auto focus input
      setTimeout(() => chatbotInput.focus(), 300);
    } else {
      chatOpenIcon.style.display = 'block';
      chatCloseIcon.style.display = 'none';
    }
  });

  // Handle message send
  chatbotForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const userText = chatbotInput.value.trim();
    if (!userText) return;

    // Append user message
    appendMessage(userText, 'user');
    chatbotInput.value = '';

    // Scroll to bottom
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    // Show typing indicator
    const typingBubble = appendTypingIndicator();
    
    // Simulate AI clone response after a short delay
    setTimeout(() => {
      // Remove typing indicator
      typingBubble.remove();
      
      // Get AI response
      const botResponse = getBotResponse(userText);
      appendMessage(botResponse, 'bot');
      
      // Re-run Lucide icons in case response contains icons
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
      
      // Scroll to bottom again
      chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }, 1000 + Math.random() * 600);
  });

  function appendMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `chat-message ${sender}`;
    
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

    if (!normalized) {
      return 'Please ask me a question, Master.';
    }

    const matches = (phrases) => phrases.some((phrase) => normalized.includes(phrase));

    const intents = {
      greeting: ['hello', 'hi', 'hy', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'sup', "what's up", 'howdy', 'yo', 'hiya'],
      goodbye: ['bye', 'goodbye', 'see you', 'later', 'take care'],
      thanks: ['thank', 'thanks', 'appreciate', 'thx'],
      projects: ['project', 'work', 'portfolio', 'built', 'developed', 'site', 'app', 'website'],
      stack: ['stack', 'skill', 'skills', 'tech', 'technology', 'language', 'framework', 'tool'],
      contact: ['contact', 'hire', 'email', 'freelance', 'reach', 'message', 'work with', 'collaborate'],
      availability: ['available', 'availability', 'open', 'accept', 'taking'],
      resume: ['resume', 'cv', 'curriculum'],
      github: ['github', 'repository', 'repo', 'code', 'source'],
      security: ['cyber', 'security', 'secure', 'hacking', 'vulnerability', 'penetration'],
      ai: ['ai', 'automation', 'gpt', 'llm', 'machine learning', 'artificial intelligence', 'nlp'],
      experience: ['experience', 'years', 'history', 'background', 'career'],
      services: ['service', 'offer', 'provide', 'speciali', 'solution', 'solutions'],
      design: ['design', 'ui', 'ux', 'user interface', 'user experience', 'layout'],
      maintenance: ['support', 'maintenance', 'update', 'fix', 'bug', 'changes'],
      location: ['location', 'country', 'based', 'timezone', 'philippines'],
      rates: ['rate', 'price', 'cost', 'budget', 'quote', 'fee', 'charge'],
      education: ['education', 'degree', 'study', 'university', 'college', 'school'],
      process: ['process', 'workflow', 'approach', 'methodology', 'how do you work'],
      team: ['team', 'collaborat', 'partner', 'together'],
      timeline: ['timeline', 'deadline', 'how long', 'duration', 'delivery'],
      testimonials: ['testimonial', 'review', 'feedback', 'client', 'opinion'],
      strengths: ['strength', 'best at', 'strongest', 'good at', 'expert'],
      jokes: ['joke', 'funny', 'humor', 'laugh'],
      identity: ['who are you', 'what are you', 'jarvis', 'your name', 'introduce'],
      about: ['about', 'juan', 'tell me more', 'who is'],
    };

    const responses = {
      greeting: 'Hello, Master. I am JARVIS, Juan&apos;s virtual assistant. How may I assist you today?',
      goodbye: 'Goodbye, Master. If you have any more questions, feel free to ask.',
      thanks: 'You are welcome, Master. I am here to help.',
      projects: 'I have developed several key web applications:<br><br>• <strong>Chef Caleb&apos;s Platform</strong>: A React culinary coaching website with secure Stripe integrated checkout.<br>• <strong>Elevate Gym</strong>: A high-performance dynamic user interface developed in Next.js.<br>• <strong>HR Dashboard</strong>: A secure enterprise-grade corporate employee onboarding and department dashboard.<br><br>Detailed descriptions and live project links are available in the Work section.',
      stack: 'My core technology stack includes:<br><br>• <strong>Frontend</strong>: HTML5, CSS3, JavaScript, React, Next.js, Vue.js<br>• <strong>Backend</strong>: Node.js, Express, PHP, Python<br>• <strong>Databases</strong>: MongoDB, MySQL, PostgreSQL<br>• <strong>Mobile Applications</strong>: Flutter<br>• <strong>Dev Tools</strong>: Git, GitHub, Vite, Figma, Postman',
      contact: 'For inquiries or collaborations, please email me at <a href="mailto:repasjuanmiguel@gmail.com" style="color:inherit; text-decoration:underline;">repasjuanmiguel@gmail.com</a>. My OnlineJobs profile and resume are linked in the footer.',
      availability: 'I am currently open and available for freelance projects and consulting engagements. Send your project details to <a href="mailto:repasjuanmiguel@gmail.com" style="color:inherit; text-decoration:underline;">repasjuanmiguel@gmail.com</a>.',
      resume: 'My professional resume is available for immediate download. You can find the link in the footer section of this portfolio.',
      github: 'I maintain an active GitHub profile showcasing open-source contributions and personal projects. The GitHub link is available in the footer.',
      security: 'Security is a core part of how I build applications. I use secure development lifecycles, encrypted credential storage, API authentication, input validation, and threat mitigation strategies.',
      ai: 'I integrate AI and automation solutions, including natural language processing, LLM-powered experiences, intelligent chatbot systems, and workflow automation tailored for business operations.',
      experience: 'I have over 3 years of professional experience in full-stack web engineering, digital solution architecture, and AI integration, with more than 15 delivered software projects across different industries.',
      services: 'I offer:<br><br>• Full-stack web application development<br>• Custom AI integration and workflow automation<br>• Infrastructure security audits and threat mitigation<br>• Technical virtual assistance for business operations<br>• API design, integration, and third-party system connectivity',
      design: 'I specialize in polished UI/UX and responsive design for landing pages, dashboards, and applications. My work focuses on usability, clean layout, and strong brand presentation.',
      maintenance: 'I provide ongoing website and app maintenance, including bug fixes, updates, performance improvements, and feature enhancements.',
      location: 'I am based in the Philippines and work remotely with clients across US, UK, EU, and Asia-Pacific time zones.',
      rates: 'My freelance rates depend on scope, timeline, and requirements. Send your project details to <a href="mailto:repasjuanmiguel@gmail.com" style="color:inherit; text-decoration:underline;">repasjuanmiguel@gmail.com</a> for a personalized quote.',
      education: 'I have strong computational and engineering knowledge built from self-directed research, formal coursework, and applied learning in cybersecurity and AI application design.',
      process: 'I follow a structured project workflow:<br><br>1. Discovery and requirements gathering<br>2. System architecture and design planning<br>3. Iterative development with regular client updates<br>4. Quality assurance and security review<br>5. Deployment, documentation, and post-launch support',
      team: 'I am experienced working independently and within cross-functional teams. I can use communication tools like Slack, Trello, Notion, or direct email.',
      timeline: 'Project timelines vary by scope. Simple landing pages may take a few days, while full-scale web applications usually require two to six weeks. I provide realistic estimates during proposals.',
      testimonials: 'Client satisfaction is central to my work. I have received positive feedback for attention to detail, reliable delivery, and high-quality output. References are available upon request.',
      strengths: 'My strengths include rapid full-stack prototyping, clean architecture, responsive UI/UX, secure backend design, and proactive communication.',
      jokes: ['Why do programmers wear glasses? Because they cannot C#.', 'How many programmers does it take to change a light bulb? None, that is a hardware issue.', 'There are 10 types of people: those who understand binary and those who do not.', 'A developer walks into a bar and orders 1 beer, then 0 beers. The bartender serves 0. The developer says: I have not started yet.'],
      identity: 'I am JARVIS, Juan&apos;s virtual AI assistant. I introduce Juan Miguel Repas, the owner of this website, and can answer questions about his work, skills, experience, and availability.',
      about: 'Juan Miguel Repas is a Full-Stack Developer, AI Solutions Integrator, and Cybersecurity advocate based in the Philippines. He builds scalable, secure web and mobile applications for clients globally.',
    };

    if (matches(intents.greeting)) {
      return responses.greeting;
    }
    if (matches(intents.goodbye)) {
      return responses.goodbye;
    }
    if (matches(intents.thanks)) {
      return responses.thanks;
    }
    if (matches(intents.projects)) {
      return responses.projects;
    }
    if (matches(intents.stack)) {
      return responses.stack;
    }
    if (matches(intents.contact)) {
      return responses.contact;
    }
    if (matches(intents.availability)) {
      return responses.availability;
    }
    if (matches(intents.resume)) {
      return responses.resume;
    }
    if (matches(intents.github)) {
      return responses.github;
    }
    if (matches(intents.security)) {
      return responses.security;
    }
    if (matches(intents.ai)) {
      return responses.ai;
    }
    if (matches(intents.experience)) {
      return responses.experience;
    }
    if (matches(intents.services)) {
      return responses.services;
    }
    if (matches(intents.design)) {
      return responses.design;
    }
    if (matches(intents.maintenance)) {
      return responses.maintenance;
    }
    if (matches(intents.location)) {
      return responses.location;
    }
    if (matches(intents.rates)) {
      return responses.rates;
    }
    if (matches(intents.education)) {
      return responses.education;
    }
    if (matches(intents.process)) {
      return responses.process;
    }
    if (matches(intents.team)) {
      return responses.team;
    }
    if (matches(intents.timeline)) {
      return responses.timeline;
    }
    if (matches(intents.testimonials)) {
      return responses.testimonials;
    }
    if (matches(intents.strengths)) {
      return responses.strengths;
    }
    if (matches(intents.jokes)) {
      const jokes = responses.jokes;
      return jokes[Math.floor(Math.random() * jokes.length)];
    }
    if (matches(intents.identity)) {
      return responses.identity;
    }
    if (matches(intents.about)) {
      return responses.about;
    }

    return 'I appreciate your message, Master. That topic is outside my current knowledge. Try asking: "What technologies do you use?", "Tell me about your projects", or "How can I hire you?"';
  }
}
