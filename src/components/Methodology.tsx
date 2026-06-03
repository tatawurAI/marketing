'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import styles from './Methodology.module.scss';

const stages = [
  {
    number: '01',
    color: 'primary' as const,
    title: 'Discovery',
    description:
      'Structured interviews, direct system access, and time with your team to map workflows, surface product needs, and understand your technical landscape. We go broad before we go deep, making sure the solution we design fits the real problem.',
  },
  {
    number: '02',
    color: 'gold' as const,
    title: 'Analysis',
    description:
      "We model the solution architecture and validate feasibility. Prototype integrations, data-flow diagrams, and a prioritized build list with effort and impact estimates for each workstream. You know exactly what you're getting before we write a line of production code.",
  },
  {
    number: '03',
    color: 'primary' as const,
    title: 'Build',
    description:
      'We ship working software. Iterative delivery with weekly checkpoints. No black-box development: you see every commit and can redirect at any checkpoint. From prototype to production-grade systems running in active deployments.',
  },
  {
    number: '04',
    color: 'gold' as const,
    title: 'Verify',
    description:
      'We measure against the baseline established in Discovery. Automated testing, integration validation, and a documented handoff so your team owns what we built — with the context to maintain and extend it.',
  },
];

export function Methodology() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="methodology" className={styles.section}>
      <div ref={ref} className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.55 }}
          className={styles.header}
        >
          <span className={styles.badge}>How We Work</span>
          <h2 className={styles.title}>Engineered to Deliver</h2>
          <p className={styles.description}>
            Four stages. No surprises. Every engagement follows the same disciplined
            process from first audit to production handoff.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Image
            src="/brand/tatawur-pratt-rule-ivory.svg"
            alt=""
            width={1184}
            height={40}
            className={styles.trussRule}
            aria-hidden="true"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.55, delay: 0.3 }}
          className={styles.stagesGrid}
        >
          {stages.map((stage) => (
            <div key={stage.title} className={styles.stageCard}>
              <p className={`${styles.stageNumber} ${styles[stage.color]}`}>
                {stage.number}
              </p>
              <h3 className={styles.stageTitle}>{stage.title}</h3>
              <p className={styles.stageDescription}>{stage.description}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
