'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { HardHat, Code2, Brain } from 'lucide-react';
import styles from './Overview.module.scss';

const valueProps = [
  {
    icon: HardHat,
    title: 'Domain Expertise',
    description:
      'We don\'t just consult. We\'ve shipped production systems used on real job sites, from design automation tools to robotically-built homes.',
    color: 'secondary',
  },
  {
    icon: Code2,
    title: 'Technical Leadership',
    description:
      'We\'ve built and scaled software teams from the ground up, shipping tools now used across AEC projects worldwide.',
    color: 'primary',
  },
  {
    icon: Brain,
    title: 'AI Integration',
    description:
      'We don\'t bolt on AI. We design intelligent systems that make your teams faster and your outputs more reliable.',
    color: 'secondary',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export function Overview() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className={styles.section}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.glow} />
      </div>

      <div ref={ref} className={styles.container}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <span className={styles.badge}>Why Tatawur AI</span>
          <h2 className={styles.title}>
            Transforming AEC <span className={styles.gradient}>Workflows</span>
          </h2>
          <p className={styles.description}>
            Tatawur AI brings together deep domain expertise in architectural
            engineering and proven software leadership to help architecture,
            engineering, and construction firms cut costs, accelerate delivery,
            and build a durable competitive advantage.
          </p>
        </motion.div>

        {/* Value propositions */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.valueProps}
        >
          {valueProps.map((prop) => (
            <motion.div
              key={prop.title}
              variants={itemVariants}
              className={styles.card}
            >
              <div className={styles.cardInner}>
                {/* Icon */}
                <div className={`${styles.cardIcon} ${styles[prop.color]}`}>
                  <prop.icon strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className={styles.cardTitle}>{prop.title}</h3>
                <p className={styles.cardDescription}>{prop.description}</p>

                {/* Hover gradient border effect */}
                <div
                  className={`${styles.cardOverlay} ${styles[prop.color]}`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Additional info */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className={styles.additionalInfo}
        >
          <div className={styles.additionalInfoInner}>
            <p className={styles.additionalInfoText}>
              With experience scaling software organizations from startup to
              unicorn status and developing production-grade construction
              technology systems, we understand both the{' '}
              <span className={`${styles.highlight} ${styles.primary}`}>
                technical possibilities
              </span>{' '}
              and the{' '}
              <span className={`${styles.highlight} ${styles.secondary}`}>
                practical constraints
              </span>{' '}
              of the AEC industry.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
