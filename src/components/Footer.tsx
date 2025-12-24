'use client';

import { motion } from 'framer-motion';
import { Linkedin, ArrowUp } from 'lucide-react';
import { Logo } from './Logo';
import styles from './Footer.module.scss';

const footerLinks = [
  { name: 'Services', href: '#services' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export function Footer() {
  const handleScroll = (href: string) => {
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.glow1} />
        <div className={styles.glow2} />
      </div>

      <div className={styles.inner}>
        {/* Main footer content */}
        <div className={styles.main}>
          <div className={styles.grid}>
            {/* Brand section */}
            <div className={styles.brand}>
              <a
                href="#home"
                onClick={(e) => {
                  e.preventDefault();
                  handleScroll('#home');
                }}
                className={styles.logoLink}
              >
                <Logo size="large" />
              </a>

              <p className={styles.brandDescription}>
                Evolving Construction Through Intelligent Automation. Expert
                consulting services bridging traditional AEC workflows with
                cutting-edge software and AI solutions.
              </p>

              {/* Social links */}
              <div className={styles.socialLinks}>
                <a
                  href="https://linkedin.com/in/telafifi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                >
                  <Linkedin size={20} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.linksSection}>
              <h4>Quick Links</h4>
              <ul className={styles.linksList}>
                {footerLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      onClick={(e) => {
                        e.preventDefault();
                        handleScroll(link.href);
                      }}
                      className={styles.link}
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className={styles.bottom}>
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Tatawur AI LLC. All rights reserved.
            </p>

            <motion.button
              onClick={scrollToTop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={styles.backToTop}
            >
              <ArrowUp size={16} />
              Back to top
            </motion.button>
          </div>
        </div>
      </div>
    </footer>
  );
}
