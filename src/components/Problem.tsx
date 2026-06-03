'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Problem.module.scss';

const painPoints = [
  {
    label: 'Documentation Bottlenecks',
    desc: 'Weeks of drawing production that could take hours.',
  },
  {
    label: 'Disconnected Systems',
    desc: 'Design, procurement, and field operations living in silos.',
  },
  {
    label: 'AI That Doesn\'t Fit',
    desc: 'Generic tools that don\'t know a UFC code from a load path.',
  },
];

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay },
  },
});

export function Problem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="problem" className={styles.section}>
      <div ref={ref} className={styles.container}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <span className={styles.badge}>The Problem</span>
          <h2 className={styles.title}>
            Engineering Teams Are Drowning in Manual Work
          </h2>
        </motion.div>

        <div className={styles.grid}>
          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={styles.leftCol}
          >
            <p className={styles.bodyText}>
              The physical world — construction, infrastructure, manufacturing —
              runs on highly specialized knowledge that off-the-shelf AI tools
              don&apos;t have. BIM workflows, structural codes, fabrication tolerances,
              site constraints: these aren&apos;t in any training dataset.
            </p>
            <p className={styles.bodyText}>
              The engineers on your team who know this domain best are the ones
              spending the most time on repetitive, automatable work. That&apos;s the
              problem we solve.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp(0.2)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={styles.rightCol}
          >
            {painPoints.map((point, index) => (
              <motion.div
                key={point.label}
                variants={fadeUp(0.25 + index * 0.08)}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={styles.painPoint}
              >
                <p className={styles.painLabel}>{point.label}</p>
                <p className={styles.painDesc}>{point.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
