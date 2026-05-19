'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import {
  Car, Shield, Wrench, Phone, ChevronRight,
  MapPin, Clock, Star, Zap, CheckCircle2, ArrowRight, Users, Award
} from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, profile, initialized } = useAuthStore();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const [activeService, setActiveService] = useState(0);

  useEffect(() => {
    if (!initialized) return;
    if (isAuthenticated && profile) {
      if (profile.role === 'admin') router.replace('/admin/dashboard');
      else if (profile.role === 'driver') router.replace('/driver/dashboard');
      else router.replace('/dashboard');
    }
  }, [isAuthenticated, profile, initialized, router]);

  const services = [
    {
      icon: Car,
      title: 'Hire a Driver',
      desc: 'Need someone to drive your car? Hire a professional, background-checked driver by the hour or for the whole day.',
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      service: 'acting_driver',
      stat: '500+ drivers',
    },
    {
      icon: Shield,
      title: 'Rent a Vehicle',
      desc: 'Choose from our wide range of well-maintained cars and bikes for your next road trip or daily commute.',
      color: '#10b981',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
      service: 'rental',
      stat: '200+ vehicles',
    },
    {
      icon: Wrench,
      title: 'Call a Mechanic',
      desc: "Car won't start? Flat tire? Our expert mechanics will come directly to your location to fix the issue.",
      color: '#f59e0b',
      gradient: 'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)',
      service: 'mechanic',
      stat: 'Avg. 12 min ETA',
    },
    {
      icon: Phone,
      title: 'Emergency SOS',
      desc: 'Stuck in a dangerous situation? Press the SOS button for immediate, priority roadside assistance.',
      color: '#ef4444',
      gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 100%)',
      service: 'emergency',
      stat: '24/7 available',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Happy Users', icon: Users },
    { value: '50+', label: 'Cities', icon: MapPin },
    { value: '4.8', label: 'App Rating', icon: Star },
    { value: '24/7', label: 'Support', icon: Clock },
  ];

  const testimonials = [
    {
      name: 'Rahul Sharma',
      role: 'Regular Customer',
      text: 'RideRelief saved me when my car broke down at midnight. The mechanic arrived in 10 minutes. Absolutely incredible service!',
      rating: 5,
      avatar: 'RS',
    },
    {
      name: 'Priya Nair',
      role: 'Business Traveler',
      text: 'I use their driver hiring service every week. Always professional, always on time. Best platform I have used.',
      rating: 5,
      avatar: 'PN',
    },
    {
      name: 'Arjun Mehta',
      role: 'Weekend Traveler',
      text: 'Rented a car for a road trip and the experience was seamless from booking to return. Transparent pricing!',
      rating: 5,
      avatar: 'AM',
    },
  ];

  return (
    <div className="rr-landing">
      {/* NAV */}
      <nav className="rr-nav">
        <div className="rr-nav-inner">
          <div className="rr-logo">
            <div className="rr-logo-icon">
              <Zap size={18} fill="white" strokeWidth={0} />
            </div>
            <span>RideRelief</span>
          </div>
          <div className="rr-nav-links">
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#testimonials">Reviews</a>
          </div>
          <div className="rr-nav-actions">
            <Link href="/login" className="rr-btn-ghost">Sign In</Link>
            <Link href="/register" className="rr-btn-primary">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="rr-hero" ref={heroRef}>
        <div className="rr-hero-bg" />
        <div className="rr-hero-orb rr-orb-1" />
        <div className="rr-hero-orb rr-orb-2" />
        <div className="rr-hero-orb rr-orb-3" />
        <div className="rr-hero-grid" />

        <div className="rr-hero-content">
          <motion.div
            className="rr-hero-left"
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rr-badge">
              <Star size={12} fill="#fbbf24" stroke="none" />
              <span>Rated 4.8/5 by 10,000+ Users</span>
            </div>

            <h1 className="rr-hero-title">
              Vehicle Troubles?
              <br />
              <span className="rr-gradient-text">We&apos;ve Got You</span>
              <br />
              Covered.
            </h1>

            <p className="rr-hero-sub">
              Whether you need a professional driver, a rental car, or an emergency mechanic
              right now — RideRelief is your all-in-one vehicle companion.
            </p>

            <div className="rr-hero-cta">
              <Link href="/register" className="rr-cta-primary">
                Get Started Free
                <ArrowRight size={18} />
              </Link>
              <Link href="/login" className="rr-cta-secondary">
                Sign In
              </Link>
            </div>

            <div className="rr-hero-trust">
              {['Background Verified', 'No Hidden Fees', 'Instant Booking'].map((t) => (
                <div key={t} className="rr-trust-item">
                  <CheckCircle2 size={14} />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            className="rr-hero-right"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="rr-car-showcase">
              <div className="rr-car-glow" />
              <Image
                src="/hero-car.png"
                alt="Premium Vehicle"
                width={600}
                height={380}
                className="rr-car-img"
                priority
              />
              <div className="rr-floating-card rr-card-top">
                <div className="rr-fc-icon" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                  <Zap size={16} />
                </div>
                <div>
                  <div className="rr-fc-title">Instant Match</div>
                  <div className="rr-fc-sub">Driver found in 2 min</div>
                </div>
              </div>
              <div className="rr-floating-card rr-card-bottom">
                <div className="rr-fc-icon" style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399' }}>
                  <MapPin size={16} />
                </div>
                <div>
                  <div className="rr-fc-title">Live Tracking</div>
                  <div className="rr-fc-sub">Real-time GPS updates</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Wave divider */}
        <div className="rr-hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none">
            <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" fill="var(--rr-surface)" />
          </svg>
        </div>
      </section>

      {/* STATS */}
      <section className="rr-stats">
        <div className="rr-container">
          <div className="rr-stats-grid">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                className="rr-stat-item"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <stat.icon size={20} className="rr-stat-icon" />
                <div className="rr-stat-value">{stat.value}</div>
                <div className="rr-stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="rr-services" id="services">
        <div className="rr-container">
          <motion.div
            className="rr-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rr-section-badge">Our Services</div>
            <h2 className="rr-section-title">
              Everything Your Car Needs,<br />
              <span className="rr-gradient-text">All in One Place</span>
            </h2>
            <p className="rr-section-sub">
              Tap a button and get exactly what you need. No hidden fees, just reliable service.
            </p>
          </motion.div>

          <div className="rr-services-layout">
            <div className="rr-services-tabs">
              {services.map((s, i) => (
                <button
                  key={s.title}
                  className={`rr-service-tab ${activeService === i ? 'active' : ''}`}
                  onClick={() => setActiveService(i)}
                  style={activeService === i ? { borderColor: s.color, color: s.color } : {}}
                >
                  <div className="rr-tab-icon" style={activeService === i ? { background: s.color + '22', color: s.color } : {}}>
                    <s.icon size={18} />
                  </div>
                  <span>{s.title}</span>
                  <ChevronRight size={16} className="rr-tab-arrow" />
                </button>
              ))}
            </div>

            <div className="rr-service-showcase">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeService}
                  className="rr-service-detail"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  style={{ background: services[activeService].gradient }}
                >
                  <div className="rr-sd-icon">
                    {(() => { const Icon = services[activeService].icon; return <Icon size={40} color="white" />; })()}
                  </div>
                  <h3 className="rr-sd-title">{services[activeService].title}</h3>
                  <p className="rr-sd-desc">{services[activeService].desc}</p>
                  <div className="rr-sd-stat">
                    <Zap size={14} />
                    {services[activeService].stat}
                  </div>
                  <Link
                    href={`/login?redirect=/book?service=${services[activeService].service}`}
                    className="rr-sd-btn"
                  >
                    Book Now <ArrowRight size={16} />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Service Cards Grid (mobile) */}
          <div className="rr-services-grid">
            {services.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <Link href={`/login?redirect=/book?service=${s.service}`} className="rr-service-card">
                  <div className="rr-sc-top" style={{ background: s.gradient }}>
                    <s.icon size={28} color="white" />
                  </div>
                  <div className="rr-sc-body">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <span className="rr-sc-stat">{s.stat}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="rr-how" id="how-it-works">
        <div className="rr-container">
          <motion.div
            className="rr-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rr-section-badge">Simple Process</div>
            <h2 className="rr-section-title">
              Get Help in <span className="rr-gradient-text">3 Easy Steps</span>
            </h2>
          </motion.div>

          <div className="rr-steps">
            {[
              { num: '01', title: 'Tell Us What You Need', desc: 'Open the app and select if you need a driver, mechanic, or rental car.', icon: Phone },
              { num: '02', title: 'We Find the Best Match', desc: 'Our system instantly connects you with the nearest top-rated professional.', icon: Zap },
              { num: '03', title: 'Track & Relax', desc: 'Watch them arrive on the map in real-time. Pay securely through the app.', icon: MapPin },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                className="rr-step"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="rr-step-num">{step.num}</div>
                <div className="rr-step-icon-wrap">
                  <step.icon size={24} />
                </div>
                <h3 className="rr-step-title">{step.title}</h3>
                <p className="rr-step-desc">{step.desc}</p>
                {i < 2 && <div className="rr-step-connector" />}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="rr-testimonials" id="testimonials">
        <div className="rr-container">
          <motion.div
            className="rr-section-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="rr-section-badge">Reviews</div>
            <h2 className="rr-section-title">
              What Our <span className="rr-gradient-text">Clients Say</span>
            </h2>
          </motion.div>

          <div className="rr-testimonials-grid">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                className="rr-testimonial-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="rr-stars">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#fbbf24" stroke="none" />
                  ))}
                </div>
                <p className="rr-testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="rr-testimonial-author">
                  <div className="rr-author-avatar">{t.avatar}</div>
                  <div>
                    <div className="rr-author-name">{t.name}</div>
                    <div className="rr-author-role">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="rr-cta-section">
        <div className="rr-container">
          <motion.div
            className="rr-cta-banner"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="rr-cta-orb-1" />
            <div className="rr-cta-orb-2" />
            <Award size={40} color="white" style={{ opacity: 0.8 }} />
            <h2 className="rr-cta-title">Ready to Experience Premium Vehicle Support?</h2>
            <p className="rr-cta-sub">Join 10,000+ satisfied users. No subscription needed.</p>
            <div className="rr-cta-actions">
              <Link href="/register" className="rr-cta-btn-white">
                Create Free Account <ArrowRight size={16} />
              </Link>
              <Link href="/login" className="rr-cta-btn-outline">
                Sign In
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="rr-footer">
        <div className="rr-container">
          <div className="rr-footer-top">
            <div className="rr-footer-brand">
              <div className="rr-logo">
                <div className="rr-logo-icon">
                  <Zap size={18} fill="white" strokeWidth={0} />
                </div>
                <span>RideRelief</span>
              </div>
              <p>Making vehicle ownership and travel completely hassle-free.</p>
            </div>
            <div className="rr-footer-links">
              <div className="rr-footer-col">
                <h4>Services</h4>
                <a href="#">Hire a Driver</a>
                <a href="#">Rent a Vehicle</a>
                <a href="#">Call a Mechanic</a>
                <a href="#">Emergency SOS</a>
              </div>
              <div className="rr-footer-col">
                <h4>Company</h4>
                <a href="#">About Us</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div className="rr-footer-col">
                <h4>Legal</h4>
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
              </div>
            </div>
          </div>
          <div className="rr-footer-bottom">
            <p>© {new Date().getFullYear()} RideRelief Platform. All rights reserved.</p>
            <div className="rr-footer-socials">
              <span>⭐ 4.8 on App Store</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
