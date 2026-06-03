'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Linkedin } from 'lucide-react';
import styles from './Contact.module.scss';

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay },
  },
});

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" className={styles.section}>
      <div ref={ref} className={styles.container}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <span className={styles.badge}>Get In Touch</span>
          <h2 className={styles.title}>Let&apos;s Find Out What&apos;s Possible</h2>
          <p className={styles.description}>
            Every engagement starts with a conversation. Tell us about your project
            and we&apos;ll take it from there.
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp(0.1)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.emailDisplay}
        >
          <a href="mailto:tarek@tatawur.ai" className={styles.emailLink}>
            tarek@tatawur.ai
          </a>
        </motion.div>

        <motion.div
          variants={fadeUp(0.2)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.includeSection}
        >
          <p className={styles.includeTitle}>What to include</p>
          <ul className={styles.includeList}>
            <li>What you&apos;re building and what&apos;s slowing you down</li>
            <li>Your timeline and goals</li>
            <li>Any specific technologies or workflows involved</li>
            <li>Your preferred way to connect (call, video, etc.)</li>
          </ul>
        </motion.div>

        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.socialRow}
        >
          <a
            href="https://linkedin.com/in/telafifi"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.linkedinLink}
          >
            <Linkedin size={16} strokeWidth={1.5} />
            <span>Tarek El-Afifi on LinkedIn</span>
          </a>

          <div className={styles.responseNote}>
            <span className={styles.responseDot} aria-hidden="true" />
            Typically respond within 24 hours
          </div>
        </motion.div>
      </div>
    </section>
  );
}
