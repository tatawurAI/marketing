'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Mail, Linkedin } from 'lucide-react';
import styles from './Contact.module.scss';

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="contact" className={styles.section}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.glow} />
        <div className={styles.dots} />
      </div>

      <div ref={ref} className={styles.container}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <span className={styles.badge}>Get In Touch</span>
          <h2 className={styles.title}>
            Let&apos;s Find Out What&apos;s Possible
          </h2>
          <p className={styles.description}>
            Every engagement starts with a conversation. Tell us about your
            project and we&apos;ll take it from there.
          </p>
        </motion.div>

        {/* Contact content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={styles.contactContent}
        >
          {/* Email info */}
          <div className={styles.emailSection}>
            <div className={styles.emailIcon}>
              <Mail size={28} />
            </div>
            <div className={styles.emailInfo}>
              <span className={styles.emailLabel}>Send an email to</span>
              <span className={styles.emailAddress}>tarek@tatawur.ai</span>
            </div>
          </div>

          {/* What to include */}
          <div className={styles.includeSection}>
            <h3 className={styles.includeTitle}>
              To make our first conversation count, share:
            </h3>
            <ul className={styles.includeList}>
              <li>What you&apos;re building and what&apos;s slowing you down</li>
              <li>Your timeline and goals</li>
              <li>Any specific technologies or workflows involved</li>
              <li>Your preferred way to connect (call, video, etc.)</li>
            </ul>
          </div>

          {/* Connect section */}
          <div className={styles.connectSection}>
            <p className={styles.connectText}>
              You can also connect with me on LinkedIn:
            </p>
            <a
              href="https://linkedin.com/in/telafifi"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.linkedinLink}
            >
              <Linkedin size={20} />
              <span>Tarek El-Afifi's LinkedIn Profile</span>
            </a>
          </div>

          {/* Response time */}
          <div className={styles.responseNote}>
            <div className={styles.responseDot} />
            <span>Typically respond within 24 hours</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
