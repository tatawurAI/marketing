'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Cpu,
  Compass,
  Zap,
  Shield,
  Lightbulb,
} from 'lucide-react';
import styles from './Hero.module.scss';

export function Hero() {
  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className={styles.section}>
      {/* Background */}
      <div className={styles.background} />

      {/* Geometric patterns */}
      <div className={styles.patterns}>
        {/* Grid pattern */}
        <div className={styles.grid} />

        {/* Floating shapes */}
        <motion.div
          animate={{
            y: [-20, 20, -20],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${styles.floatingShape} ${styles.shape1}`}
        />
        <motion.div
          animate={{
            y: [20, -20, 20],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${styles.floatingShape} ${styles.shape2}`}
        />
        <motion.div
          animate={{
            y: [-15, 15, -15],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className={`${styles.floatingShape} ${styles.shape3}`}
        />
      </div>

      {/* Floating icons */}
      <div className={styles.floatingIcons}>
        <motion.div
          animate={{ y: [-10, 10, -10], rotate: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className={`${styles.floatingIcon} ${styles.icon1}`}
        >
          <Building2 size={48} strokeWidth={1} />
        </motion.div>
        <motion.div
          animate={{ y: [10, -10, 10], rotate: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className={`${styles.floatingIcon} ${styles.icon2}`}
        >
          <Cpu size={64} strokeWidth={1} />
        </motion.div>
        <motion.div
          animate={{ y: [-15, 15, -15], rotate: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className={`${styles.floatingIcon} ${styles.icon3}`}
        >
          <Compass size={56} strokeWidth={1} />
        </motion.div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.contentInner}>
          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={styles.tagline}
          >
            <span className={styles.taglineDot} />
            <span className={styles.taglineText}>
              Where AEC Expertise Meets AI Engineering
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={styles.headline}
          >
            <span className={styles.dark}>Evolving the Built Environment </span>
            <br />
            <span className={styles.dark}>Through </span>
            <span className={styles.gradient}>Intelligent Automation</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.subheadline}
          >
            From schematic design to site execution, we help AEC firms automate
            workflows, embed intelligent systems, and build smarter at every
            phase of delivery.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={styles.cta}
          >
            <motion.button
              onClick={() => handleScroll('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.ctaPrimary}
            >
              Book a Consultation
              <ArrowRight size={18} className={styles.arrow} />
            </motion.button>
            <motion.button
              onClick={() => handleScroll('#services')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={styles.ctaSecondary}
            >
              Explore Our Services
            </motion.button>
          </motion.div>

          {/* Focus Areas */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className={styles.focusAreas}
          >
            {[
              {
                icon: Zap,
                label: 'AI & Automation',
                desc: 'Cut weeks of manual work',
              },
              {
                icon: Shield,
                label: 'Product Strategy',
                desc: 'Define what to build first',
              },
              {
                icon: Lightbulb,
                label: 'Innovation',
                desc: 'Practical innovation, not hype',
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                className={styles.focusItem}
              >
                <div className={styles.focusIcon}>
                  <item.icon size={20} />
                </div>
                <div className={styles.focusText}>
                  <div className={styles.label}>{item.label}</div>
                  <div className={styles.desc}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className={styles.scrollIndicator}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className={styles.scrollMouse}
        >
          <motion.div className={styles.scrollDot} />
        </motion.div>
      </motion.div>
    </section>
  );
}
