"use client"

import { useEffect, useState } from "react"

export default function Portfolio() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [typedText, setTypedText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const fullText = "Bruna Alvares"

  useEffect(() => {
    const animateText = (element: Element) => {
      const text = element.textContent || ""
      const words = text.split(" ")
      let html = ""
      let totalChars = 0

      words.forEach((word, wordIndex) => {
        const letters = word.split("")
        letters.forEach((letter) => {
          const delay = totalChars * 0.03
          html += `<span class="letter-blur" style="animation-delay: ${delay}s">${letter}</span>`
          totalChars++
        })
        if (wordIndex < words.length - 1) {
          html += " "
          totalChars++
        }
      })

      element.innerHTML = html
    }

    const textElements = document.querySelectorAll(
      ".hero-bio, .section-title, .newsletter h2, .blog-section h2, .contact-section h2",
    )
    textElements.forEach((el) => {
      if (!el.classList.contains("animated")) {
        animateText(el)
        el.classList.add("animated")
      }
    })

    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -100px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate-in")
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(".animate-on-scroll")
    animatedElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const typingSpeed = isDeleting ? 80 : 150
    const pauseDuration = 2000

    const timer = setTimeout(() => {
      if (!isDeleting && typedText.length < fullText.length) {
        setTypedText(fullText.substring(0, typedText.length + 1))
      } else if (isDeleting && typedText.length > 0) {
        setTypedText(fullText.substring(0, typedText.length - 1))
      } else if (!isDeleting && typedText.length === fullText.length) {
        setTimeout(() => setIsDeleting(true), pauseDuration)
      } else if (isDeleting && typedText.length === 0) {
        setIsDeleting(false)
      }
    }, typingSpeed)

    return () => clearTimeout(timer)
  }, [typedText, isDeleting])

  const handleLinkClick = () => {
    setMobileMenuOpen(false)
  }

  return (
    <>
      <header>
        <div className="container">
          <nav>
            <div className="logo">BRUNA ALVARES</div>
            <div className="nav-links">
              <a href="#about">About</a>
              <a href="#work">Work</a>
              <a href="#blog">Blog</a>
              <a href="#contact">Contact</a>
            </div>
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileMenuOpen ? (
                  <>
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </>
                ) : (
                  <>
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                  </>
                )}
              </svg>
            </button>
            <div className="social-icons desktop-only">
              <a
                href="https://linkedin.com/in/bruna-alvares-50b6291b2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a href="#" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                </svg>
              </a>
            </div>
          </nav>
        </div>
        {mobileMenuOpen && (
          <div className="mobile-menu">
            <div className="mobile-menu-links">
              <a href="#about" onClick={handleLinkClick}>
                About
              </a>
              <a href="#work" onClick={handleLinkClick}>
                Work
              </a>
              <a href="#blog" onClick={handleLinkClick}>
                Blog
              </a>
              <a href="#contact" onClick={handleLinkClick}>
                Contact
              </a>
              <div className="mobile-menu-social">
                <a
                  href="https://linkedin.com/in/bruna-alvares-50b6291b2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>
        <section id="about" className="hero animate-on-scroll">
          <div className="container">
            <div className="hero-layout">
              <div className="hero-vertical-name">
                {typedText}
                <span className="typing-cursor">|</span>
              </div>
              <div className="hero-content-wrapper">
                <div className="hero-image-container animate-on-scroll">
                  <div className="hero-image-bg"></div>
                  <img src="/images/me-02.jpg" alt="Profile" className="hero-image" />
                </div>
                <div className="hero-content">
                  <span className="hero-role">Product & Data-driven Problem Solver</span>
                  <div className="hero-location">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    Curitiba, Brasil
                  </div>
                  <p className="hero-bio">
                    Transformo dados, comportamentos e problemas complexos em soluções digitais. Minha experiência
                    combina pesquisa, produto, marketing e tecnologia para entender o que as pessoas precisam,
                    identificar oportunidades e transformar insights em experiências e produtos que geram valor.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="marquee-wrapper">
          <div className="marquee-content">
            <div className="marquee-text">
              <span>Available for New Projects</span>
              <span className="marquee-dot">•</span>
              <span>Design & Development</span>
              <span className="marquee-dot">•</span>
              <span>Let's Build Something Amazing</span>
              <span className="marquee-dot">•</span>
              <span>Available for New Projects</span>
              <span className="marquee-dot">•</span>
              <span>Design & Development</span>
              <span className="marquee-dot">•</span>
              <span>Let's Build Something Amazing</span>
              <span className="marquee-dot">•</span>
            </div>
            <div className="marquee-text" aria-hidden="true">
              <span>Available for New Projects</span>
              <span className="marquee-dot">•</span>
              <span>Design & Development</span>
              <span className="marquee-dot">•</span>
              <span>Let's Build Something Amazing</span>
              <span className="marquee-dot">•</span>
              <span>Available for New Projects</span>
              <span className="marquee-dot">•</span>
              <span>Design & Development</span>
              <span className="marquee-dot">•</span>
              <span>Let's Build Something Amazing</span>
              <span className="marquee-dot">•</span>
            </div>
          </div>
        </div>

        <section id="work" className="section">
          <div className="container">
            <div className="section-header animate-on-scroll">
              <h2 className="section-title">Featured Work</h2>
              <a href="#" className="view-all">
                View All
              </a>
            </div>
            <div className="grid">
              <article className="card animate-on-scroll">
                <img src="/modern-design-system-interface.png" alt="Project 1" className="card-image" />
                <div className="card-content">
                  <span className="card-tag">Design System</span>
                  <h3 className="card-title">Unified Component Library</h3>
                  <p className="card-desc">
                    Built a scalable design system serving 50+ product teams with consistent patterns and reusable
                    components.
                  </p>
                </div>
              </article>

              <article className="card animate-on-scroll">
                <img src="/mobile-app-interface.png" alt="Project 2" className="card-image" />
                <div className="card-content">
                  <span className="card-tag">Mobile App</span>
                  <h3 className="card-title">Wellness Tracking Platform</h3>
                  <p className="card-desc">
                    Designed and developed a cross-platform mobile experience that helps users maintain healthy habits.
                  </p>
                </div>
              </article>

              <article className="card animate-on-scroll">
                <img src="/modern-ecommerce-website.png" alt="Project 3" className="card-image" />
                <div className="card-content">
                  <span className="card-tag">E-Commerce</span>
                  <h3 className="card-title">Sustainable Fashion Marketplace</h3>
                  <p className="card-desc">
                    Created a seamless shopping experience for eco-conscious consumers with integrated sustainability
                    metrics.
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="blog" className="section blog-section">
          <div className="container">
            <div className="section-header animate-on-scroll">
              <h2 className="section-title">Latest Articles</h2>
              <a href="#" className="view-all">
                View All
              </a>
            </div>
            <div className="grid">
              <article className="card animate-on-scroll">
                <div className="card-content">
                  <span className="card-tag">Design Systems</span>
                  <div className="blog-date">January 15, 2026</div>
                  <h3 className="card-title">Building Scalable Component Libraries</h3>
                  <p className="card-desc">
                    Learn how to create maintainable design systems that grow with your product and team. A
                    comprehensive guide to tokens, components, and documentation.
                  </p>
                  <a href="#" className="read-more">
                    Read More →
                  </a>
                </div>
              </article>

              <article className="card animate-on-scroll">
                <div className="card-content">
                  <span className="card-tag">Development</span>
                  <div className="blog-date">January 8, 2026</div>
                  <h3 className="card-title">Modern React Patterns for 2026</h3>
                  <p className="card-desc">
                    Exploring the latest patterns and best practices in React development, from server components to
                    advanced state management techniques.
                  </p>
                  <a href="#" className="read-more">
                    Read More →
                  </a>
                </div>
              </article>

              <article className="card animate-on-scroll">
                <div className="card-content">
                  <span className="card-tag">Product Design</span>
                  <div className="blog-date">December 28, 2025</div>
                  <h3 className="card-title">The Art of Micro-Interactions</h3>
                  <p className="card-desc">
                    Discover how subtle animations and feedback mechanisms can dramatically improve user experience and
                    product delight.
                  </p>
                  <a href="#" className="read-more">
                    Read More →
                  </a>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="newsletter animate-on-scroll">
          <div className="container">
            <div className="newsletter-inner">
              <h2>Stay Updated</h2>
              <p>Get insights on design, development, and product thinking delivered to your inbox.</p>
              <form className="form-group">
                <input type="email" placeholder="Enter your email" aria-label="Email address" />
                <button type="submit" className="btn-subscribe">
                  Subscribe
                </button>
              </form>
            </div>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="container">
            <div className="contact-wrapper animate-on-scroll">
              <div className="contact-info">
                <h2 className="section-title">Let's Work Together</h2>
                <p className="contact-desc">
                  I'm always interested in hearing about new projects and opportunities. Whether you have a question or
                  just want to say hi, feel free to reach out.
                </p>
                <div className="contact-details">
                  <div className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m2 7 10 7 10-7" />
                    </svg>
                    <span>hello@brunaalvares.com</span>
                  </div>
                  <div className="contact-item">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>San Francisco, CA</span>
                  </div>
                </div>
              </div>
              <form className="contact-form">
                <div className="form-row">
                  <div className="form-field">
                    <label htmlFor="name">Name</label>
                    <input type="text" id="name" name="name" placeholder="Your name" required />
                  </div>
                  <div className="form-field">
                    <label htmlFor="email">Email</label>
                    <input type="email" id="email" name="email" placeholder="your@email.com" required />
                  </div>
                </div>
                <div className="form-field">
                  <label htmlFor="subject">Subject</label>
                  <input type="text" id="subject" name="subject" placeholder="What's this about?" required />
                </div>
                <div className="form-field">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" name="message" rows={5} placeholder="Tell me more..." required></textarea>
                </div>
                <button type="submit" className="btn-submit">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="container">
          <div className="footer-grid">
            <div className="logo">BRUNA ALVARES</div>
            <div className="footer-content">
              <nav className="footer-nav">
                <a href="#about">About</a>
                <a href="#work">Work</a>
                <a href="#blog">Blog</a>
                <a href="#contact">Contact</a>
              </nav>
              <div className="social-icons">
                <a
                  href="https://linkedin.com/in/bruna-alvares-50b6291b2"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" aria-label="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="copyright">© 2026 Bruna Alvares. Todos os direitos reservados.</div>
          <div className="credit">Designed using 1UI.dev and built using v0.app</div>
        </div>
      </footer>
    </>
  )
}
