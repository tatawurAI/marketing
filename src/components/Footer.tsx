'use client';

import { motion } from 'framer-motion';
import { Linkedin, ArrowUp } from 'lucide-react';
import Image from 'next/image';
import { Logo } from './Logo';
import styles from './Footer.module.scss';

const footerLinks = [
  { name: 'Services', href: '#services' },
  { name: 'Work', href: '#work' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

export function Footer() {
  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <Image
        src="/brand/tatawur-pratt-rule-ivory.svg"
        alt=""
        width={1440}
        height={40}
        className={styles.trussRule}
        aria-hidden="true"
      />

      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <a
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                handleScroll('#home');
              }}
              className={styles.logoLink}
              aria-label="Back to top"
            >
              <Logo size="medium" />
            </a>
            <p className={styles.tagline}>
              Intelligent automation for engineering-intensive industries.
            </p>
            <a
              href="https://linkedin.com/in/telafifi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.socialLink}
            >
              <Linkedin size={14} strokeWidth={1.5} />
              LinkedIn
            </a>
          </div>

          <div className={styles.linksSection}>
            <p className={styles.linksLabel}>Quick Links</p>
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

        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2026 Tatawur AI LLC. All rights reserved.
          </p>
          <motion.button
            onClick={scrollToTop}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={styles.backToTop}
          >
            <ArrowUp size={14} strokeWidth={1.5} />
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  );
}
