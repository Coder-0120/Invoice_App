import React, { useState, useEffect } from "react";
import { FileText, Zap, TrendingUp, Shield, Smartphone, Users, CheckCircle, ArrowRight, Play } from 'lucide-react';
import toast from "react-hot-toast";

const HomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const storedData = JSON.parse(localStorage.getItem("UserInfo"));
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);

      const elements = document.querySelectorAll('.feature-card');
      elements.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const isInView = rect.top < window.innerHeight - 100;
        setIsVisible(prev => ({ ...prev, [index]: isInView }));
      });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: <Zap size={32} />,
      title: "Lightning Fast",
      description: "Create professional invoices in under 60 seconds with our intuitive interface",
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Smart Analytics",
      description: "Track payments, revenue, and business growth with powerful insights",
      gradient: "linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)"
    },
    {
      icon: <Shield size={32} />,
      title: "Secure & Reliable",
      description: "Bank-level security with automatic backups and data encryption",
      gradient: "linear-gradient(135deg, #059669 0%, #0891b2 100%)"
    },
    {
      icon: <Smartphone size={32} />,
      title: "Mobile Ready",
      description: "Manage invoices anywhere, anytime on any device seamlessly",
      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)"
    },
    {
      icon: <Users size={32} />,
      title: "Client Management",
      description: "Organize customers and track their payment history effortlessly",
      gradient: "linear-gradient(135deg, #0891b2 0%, #3b82f6 100%)"
    },
    {
      icon: <FileText size={32} />,
      title: "Professional Templates",
      description: "Beautiful, customizable invoice designs that impress your clients",
      gradient: "linear-gradient(135deg, #059669 0%, #10b981 100%)"
    }
  ];

  const stats = [
    { number: "50K+", label: "Happy Users" },
    { number: "1M+", label: "Invoices Created" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" }
  ];

  const testimonials = [
    {
      name: "Anuj Sharma",
      role: "Freelance Designer",
      text: "This app transformed my invoicing process. I save hours every week!",
      avatar: "PS"
    },
    {
      name: "Rakesh Kumar",
      role: "Small Business Owner",
      text: "Professional invoices that help me get paid faster. Highly recommended!",
      avatar: "RK"
    },
    {
      name: "Anita Patel",
      role: "Consultant",
      text: "The best invoicing solution I've used. Simple, fast, and reliable.",
      avatar: "AP"
    }
  ];
  const handleLogout = () => {
    localStorage.removeItem("UserInfo");
    toast.success("Logged out successfully!");
    window.location.href = '/home';
  };

  return (
    <div style={styles.container}>
      {/* Animated Background */}
      <div style={{ ...styles.blob1, transform: `translate(${scrollY * 0.1}px, ${scrollY * 0.05}px)` }}></div>
      <div style={{ ...styles.blob2, transform: `translate(-${scrollY * 0.08}px, ${scrollY * 0.06}px)` }}></div>
      <div style={{ ...styles.blob3, transform: `translate(${scrollY * 0.06}px, -${scrollY * 0.04}px)` }}></div>

      {/* Navigation */}
      <nav style={styles.nav}>
        <div style={styles.navContent}>
          <div style={styles.logo} onClick={() => window.location.href = '/home'}>
            <FileText size={32} color="#059669" />
            <span style={styles.logoText}>InvoiceApp</span>
          </div>
          <div style={styles.navLinks}>
            <button
              style={storedData ? styles.logoutbtn : styles.loginBtn}
              onClick={storedData ? () => handleLogout() : () => window.location.href = '/login'}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = storedData ? '#ca1b1b' : '#059669';
                e.currentTarget.style.borderColor = storedData ? '#991b1b' : '#059669';
                e.currentTarget.style.color = storedData ? 'white' : 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = storedData ? '#ff0000' : '#059669';
                e.currentTarget.style.borderColor = storedData ? '#e2e8f0' : '#e2e8f0';
                e.currentTarget.style.color = storedData ? 'white' : 'white';
              }}
            >
              {storedData ? "Logout" : "Login"}
            </button>
            {/* <button
              style={styles.signupBtn}
              onClick={() => window.location.href = '/register'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(5, 150, 105, 0.2)';
              }}
            >
              Sign Up Free
            </button> */}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={{ ...styles.badge, opacity: Math.max(0, 1 - scrollY / 300) }}>
            <div style={styles.badgeDot}></div>
            Trusted by 50,000+ businesses worldwide
          </div>

          <h1 style={{ ...styles.heroTitle, transform: `translateY(${scrollY * 0.1}px)` }}>
            Professional Invoicing
            <br />
            <span style={styles.gradient}>Made Simple</span>
          </h1>

          <p style={{ ...styles.heroSubtitle, transform: `translateY(${scrollY * 0.15}px)` }}>
            Create and track professional invoices effortlessly.
            Manage your billing with powerful insights and stay on top of every payment.
          </p>

          <div style={{ ...styles.ctaButtons, opacity: Math.max(0, 1 - scrollY / 400) }}>
            <button
              style={styles.primaryBtn}
              onClick={storedData ? () => window.location.href = '/dashboard' : () => window.location.href = '/register'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(5, 150, 105, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1) translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(5, 150, 105, 0.2)';
              }}
            >
              {storedData ? "Go to Dashboard" : "Get Started Free"}
              <ArrowRight size={20} />
            </button>

            <button
              style={styles.secondaryBtn}
              onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(5, 150, 105, 0.1)';
                e.currentTarget.style.borderColor = '#059669';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <Play size={20} />
              Watch Demo
            </button>
          </div>

          {/* Invoice Preview Cards */}
          <div style={styles.previewContainer}>
            <div style={{ ...styles.invoicePreview, transform: `translateY(${Math.sin(scrollY * 0.01) * 10}px) rotateY(${scrollY * 0.02}deg)` }}>
              <div style={styles.previewHeader}>
                <FileText size={24} color="#059669" />
                <div style={styles.previewHeaderText}>
                  <div style={styles.previewTitle}>INVOICE</div>
                  <div style={styles.previewNumber}>INV-2024-001</div>
                </div>
                <div style={styles.previewStatus}>Paid</div>
              </div>
              <div style={styles.previewDivider}></div>
              <div style={styles.previewBody}>
                <div style={styles.previewRow}>
                  <div style={styles.previewLabel}>Customer</div>
                  <div style={styles.previewValue}>John Doe</div>
                </div>
                <div style={styles.previewRow}>
                  <div style={styles.previewLabel}>Amount</div>
                  <div style={styles.previewAmount}>₹45,000</div>
                </div>
              </div>
            </div>

            <div style={{ ...styles.successCard, transform: `translateY(${Math.sin(scrollY * 0.01 + 1) * 15}px)` }}>
              <CheckCircle size={40} color="white" />
              <div style={styles.successText}>Payment Received!</div>
              <div style={styles.successAmount}>₹45,000</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={styles.statsSection}>
        <div style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <div
              key={index}
              style={{
                ...styles.statCard,
                transform: scrollY > 300 ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.95)',
                opacity: scrollY > 300 ? 1 : 0,
                transitionDelay: `${index * 0.1}s`
              }}
            >
              <div style={styles.statNumber}>{stat.number}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={styles.featuresSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>FEATURES</span>
          <h2 style={styles.sectionTitle}>
            Everything you need for
            <br />
            <span style={styles.gradient}>professional invoicing</span>
          </h2>
          <p style={styles.sectionSubtitle}>
            Powerful features designed to streamline your billing and get you paid faster
          </p>
        </div>

        <div style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card"
              style={{
                ...styles.featureCard,
                transform: isVisible[index] ? 'translateY(0) scale(1)' : 'translateY(50px) scale(0.95)',
                opacity: isVisible[index] ? 1 : 0,
                transitionDelay: `${(index % 3) * 0.1}s`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-10px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 20px 50px rgba(5, 150, 105, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08)';
              }}
            >
              <div style={{ ...styles.featureIcon, background: feature.gradient }}>
                {feature.icon}
              </div>
              <h3 style={styles.featureTitle}>{feature.title}</h3>
              <p style={styles.featureDesc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={styles.testimonialsSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>TESTIMONIALS</span>
          <h2 style={styles.sectionTitle}>
            Loved by <span style={styles.gradient}>professionals</span>
          </h2>
        </div>

        <div style={styles.testimonialsGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={styles.testimonialCard}>
              <p style={styles.testimonialText}>"{testimonial.text}"</p>
              <div style={styles.testimonialFooter}>
                <div style={styles.testimonialAvatar}>{testimonial.avatar}</div>
                <div>
                  <div style={styles.testimonialName}>{testimonial.name}</div>
                  <div style={styles.testimonialRole}>{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>
            Ready to streamline your invoicing?
          </h2>
          <p style={styles.ctaSubtitle}>
            Join thousands of businesses already using InvoiceApp to get paid faster
          </p>
          <div style={styles.ctaButtonGroup}>
            <button
              style={styles.ctaPrimaryBtn}
              onClick={storedData ? () => window.location.href = '/dashboard' : () => window.location.href = '/register'}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(255, 255, 255, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(255, 255, 255, 0.15)';
              }}
            >
              {storedData ? "Go to Dashboard" : "Start Your Free Trial"}
              <ArrowRight size={20} />
            </button>
            <p style={styles.ctaNote}>No credit card required • Free 14-day trial</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerLeft}>
            <div style={styles.footerLogo}>
              <FileText size={28} color="#059669" />
              <span style={styles.footerLogoText}>InvoiceApp</span>
            </div>
            <p style={styles.footerTagline}>
              Professional invoicing made simple
            </p>
          </div>
          <div style={styles.footerRight}>
            <p style={styles.footerCopyright}>
              © 2025 InvoiceApp. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(to bottom, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%)",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  blob1: {
    position: "fixed",
    top: "-10%",
    left: "-5%",
    width: "600px",
    height: "600px",
    background: "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    zIndex: 0,
    pointerEvents: "none",
  },
  blob2: {
    position: "fixed",
    top: "30%",
    right: "-10%",
    width: "700px",
    height: "700px",
    background: "radial-gradient(circle, rgba(8, 145, 178, 0.12) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    zIndex: 0,
    pointerEvents: "none",
  },
  blob3: {
    position: "fixed",
    bottom: "-15%",
    left: "20%",
    width: "650px",
    height: "650px",
    background: "radial-gradient(circle, rgba(5, 150, 105, 0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(60px)",
    zIndex: 0,
    pointerEvents: "none",
  },
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    padding: "20px 0",
    background: "rgba(255, 255, 255, 0.9)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
    zIndex: 1000,
  },
  navContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoText: {
    fontSize: "24px",
    fontWeight: "700",
    background: "linear-gradient(135deg, #059669, #0891b2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  navLinks: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  loginBtn: {
    padding: "10px 24px",
    background: "white",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  logoutbtn:{
    padding: "10px 24px",
    background: "red",
    border: "2px solid #e2e8f0",
    borderRadius: "10px",
    fontSize: "15px",
    color: "white",
    fontWeight: "600",
    
  },
  signupBtn: {
    padding: "10px 24px",
    background: "linear-gradient(135deg, #059669, #0891b2)",
    border: "none",
    borderRadius: "10px",
    fontSize: "15px",
    fontWeight: "600",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)",
  },
  hero: {
    position: "relative",
    zIndex: 1,
    paddingTop: "140px",
    paddingBottom: "80px",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
  },
  heroContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 24px",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 24px",
    background: "white",
    borderRadius: "100px",
    fontSize: "14px",
    color: "#059669",
    fontWeight: "600",
    marginBottom: "32px",
    boxShadow: "0 4px 20px rgba(5, 150, 105, 0.1)",
    border: "1px solid rgba(5, 150, 105, 0.1)",
    transition: "opacity 0.3s",
  },
  badgeDot: {
    width: "8px",
    height: "8px",
    background: "#10b981",
    borderRadius: "50%",
    animation: "pulse 2s infinite",
  },
  heroTitle: {
    fontSize: "clamp(36px, 7vw, 72px)",
    fontWeight: "800",
    lineHeight: "1.1",
    color: "#1e293b",
    marginBottom: "24px",
    letterSpacing: "-0.02em",
    transition: "transform 0.3s",
  },
  gradient: {
    background: "linear-gradient(135deg, #059669, #0891b2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSubtitle: {
    fontSize: "clamp(16px, 2.5vw, 20px)",
    color: "#64748b",
    maxWidth: "700px",
    margin: "0 auto 40px",
    lineHeight: "1.7",
    transition: "transform 0.3s",
  },
  ctaButtons: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: "80px",
    transition: "opacity 0.3s",
  },
  primaryBtn: {
    padding: "16px 40px",
    background: "linear-gradient(135deg, #059669, #0891b2)",
    color: "white",
    border: "none",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    boxShadow: "0 10px 30px rgba(5, 150, 105, 0.2)",
    transition: "all 0.3s ease",
  },
  secondaryBtn: {
    padding: "16px 40px",
    background: "white",
    color: "#1e293b",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "17px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    transition: "all 0.3s ease",
  },
  previewContainer: {
    position: "relative",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "40px",
    flexWrap: "wrap",
    marginTop: "60px",
  },
  invoicePreview: {
    width: "320px",
    background: "white",
    borderRadius: "20px",
    padding: "28px",
    boxShadow: "0 20px 60px rgba(5, 150, 105, 0.15)",
    border: "1px solid rgba(5, 150, 105, 0.1)",
    transition: "transform 0.3s ease",
  },
  previewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "20px",
  },
  previewHeaderText: {
    flex: 1,
    marginLeft: "12px",
  },
  previewTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#64748b",
    letterSpacing: "1px",
  },
  previewNumber: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#1e293b",
    marginTop: "2px",
  },
  previewStatus: {
    padding: "6px 14px",
    background: "#d1fae5",
    color: "#065f46",
    borderRadius: "100px",
    fontSize: "12px",
    fontWeight: "600",
  },
  previewDivider: {
    height: "1px",
    background: "#e2e8f0",
    marginBottom: "20px",
  },
  previewBody: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  previewRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  previewLabel: {
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "500",
  },
  previewValue: {
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "600",
  },
  previewAmount: {
    fontSize: "20px",
    color: "#059669",
    fontWeight: "700",
  },
  successCard: {
    width: "240px",
    height: "160px",
    background: "linear-gradient(135deg, #059669, #10b981)",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
    boxShadow: "0 20px 60px rgba(5, 150, 105, 0.3)",
    transition: "transform 0.3s ease",
  },
  successText: {
    color: "white",
    fontSize: "16px",
    fontWeight: "600",
  },
  successAmount: {
    color: "white",
    fontSize: "24px",
    fontWeight: "700",
  },
  statsSection: {
    position: "relative",
    zIndex: 1,
    padding: "80px 24px",
    background: "white",
  },
  statsGrid: {
    maxWidth: "1100px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "32px",
  },
  statCard: {
    background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
    borderRadius: "20px",
    padding: "36px 24px",
    textAlign: "center",
    border: "1px solid rgba(5, 150, 105, 0.1)",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  statNumber: {
    fontSize: "48px",
    fontWeight: "800",
    background: "linear-gradient(135deg, #059669, #0891b2)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "8px",
  },
  statLabel: {
    fontSize: "16px",
    color: "#64748b",
    fontWeight: "600",
  },
  featuresSection: {
    position: "relative",
    zIndex: 1,
    padding: "100px 24px",
  },
  sectionHeader: {
    textAlign: "center",
    marginBottom: "80px",
  },
  sectionBadge: {
    display: "inline-block",
    padding: "8px 20px",
    background: "rgba(5, 150, 105, 0.1)",
    color: "#059669",
    borderRadius: "100px",
    fontSize: "13px",
    fontWeight: "700",
    marginBottom: "24px",
    letterSpacing: "1.5px",
  },
  sectionTitle: {
    fontSize: "clamp(32px, 6vw, 56px)",
    fontWeight: "800",
    lineHeight: "1.2",
    color: "#1e293b",
    marginBottom: "20px",
    letterSpacing: "-0.02em",
  },
  sectionSubtitle: {
    fontSize: "18px",
    color: "#64748b",
    maxWidth: "650px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  featuresGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  featureCard: {
    background: "white",
    borderRadius: "24px",
    padding: "40px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
  },
  featureIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "24px",
    color: "white",
    boxShadow: "0 8px 24px rgba(5, 150, 105, 0.2)",
  },
  featureTitle: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "12px",
  },
  featureDesc: {
    fontSize: "15px",
    color: "#64748b",
    lineHeight: "1.7",
  },
  testimonialsSection: {
    position: "relative",
    zIndex: 1,
    padding: "100px 24px",
    background: "white",
  },
  testimonialsGrid: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "32px",
  },
  testimonialCard: {
    background: "white",
    borderRadius: "20px",
    padding: "32px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(226, 232, 240, 0.8)",
  },
  testimonialText: {
    fontSize: "16px",
    color: "#475569",
    lineHeight: "1.7",
    marginBottom: "24px",
    fontStyle: "italic",
  },
  testimonialFooter: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  testimonialAvatar: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #059669, #0891b2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontWeight: "700",
    fontSize: "16px",
  },
  testimonialName: {
    fontSize: "16px",
    fontWeight: "600",
    color: "#1e293b",
  },
  testimonialRole: {
    fontSize: "14px",
    color: "#64748b",
    marginTop: "2px",
  },
  ctaSection: {
    position: "relative",
    zIndex: 1,
    padding: "100px 24px",
    background: "linear-gradient(135deg, #059669, #0891b2)",
    marginTop: "50px",
  },
  ctaContent: {
    maxWidth: "800px",
    margin: "0 auto",
    textAlign: "center",
  },
  ctaTitle: {
    fontSize: "clamp(32px, 6vw, 48px)",
    fontWeight: "800",
    color: "white",
    marginBottom: "20px",
    letterSpacing: "-0.02em",
  },
  ctaSubtitle: {
    fontSize: "20px",
    color: "rgba(255, 255, 255, 0.95)",
    marginBottom: "40px",
    lineHeight: "1.6",
  },
  ctaButtonGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
  ctaPrimaryBtn: {
    padding: "18px 48px",
    background: "white",
    color: "#059669",
    border: "none",
    borderRadius: "12px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(255, 255, 255, 0.15)",
    transition: "all 0.3s ease",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  ctaNote: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "14px",
    fontWeight: "500",
  },
  footer: {
    padding: "60px 24px 40px",
    background: "white",
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
  },
  footerContent: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "24px",
  },
  footerLeft: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  footerLogo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  footerLogoText: {
    fontSize: "20px",
    fontWeight: "700",
    color: "#1e293b",
  },
  footerTagline: {
    fontSize: "14px",
    color: "#64748b",
  },
  footerRight: {
    display: "flex",
    alignItems: "center",
  },
  footerCopyright: {
    fontSize: "14px",
    color: "#64748b",
  }
};
export default HomePage;