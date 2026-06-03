'use client';

import { motion } from 'framer-motion';
import styles from './Hero.module.scss';

const lineVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const, delay },
  }),
};

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay },
  },
});

export function Hero() {
  const handleScroll = (href: string) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className={styles.section}>
      <div className={styles.container}>
        <motion.div
          custom={0}
          variants={lineVariants}
          initial="hidden"
          animate="visible"
          className={styles.eyebrow}
        >
          <span className={styles.eyebrowRule} aria-hidden="true" />
          <span className={styles.eyebrowText}>
            Intelligent Automation · Engineering-Intensive Industries
          </span>
        </motion.div>

        <div className={styles.headline} aria-label="Evolve the Physical World.">
          <motion.span
            custom={0.1}
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className={styles.line1}
          >
            Evolve the
          </motion.span>
          <motion.span
            custom={0.25}
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className={styles.line2}
          >
            Physical World<span className={styles.period}>.</span>
          </motion.span>
        </div>

        <motion.p
          variants={fadeUp(0.45)}
          initial="hidden"
          animate="visible"
          className={styles.subheadline}
        >
          From computational design to physical deployment — we embed intelligent
          systems into engineering workflows, and ship software that actually works
          on the job site.
        </motion.p>

        <motion.div
          variants={fadeUp(0.55)}
          initial="hidden"
          animate="visible"
          className={styles.cta}
        >
          <motion.button
            onClick={() => handleScroll('#contact')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={styles.ctaPrimary}
          >
            Book a Consultation →
          </motion.button>
          <motion.button
            onClick={() => handleScroll('#work')}
            whileHover={{ opacity: 0.75 }}
            className={styles.ctaSecondary}
          >
            See Our Work
          </motion.button>
        </motion.div>

        <motion.div
          variants={fadeUp(0.7)}
          initial="hidden"
          animate="visible"
          className={styles.proofRow}
        >
          {[
            { value: '2 SBIR Awards', label: 'DoD & DARPA' },
            { value: '200+ Homes Built', label: 'Robotic Construction' },
            { value: '50% Faster Iteration', label: 'Design Automation' },
          ].map((item) => (
            <div key={item.value} className={styles.proofItem}>
              <span className={styles.proofValue}>{item.value}</span>
              <span className={styles.proofLabel}>{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
