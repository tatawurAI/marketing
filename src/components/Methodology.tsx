'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, BarChart2, Code2, CheckCircle2 } from 'lucide-react';
import styles from './Methodology.module.scss';

const stages = [
  {
    number: '01',
    nodeX: 200,
    icon: Search,
    title: 'Discovery',
    color: 'primary',
    description:
      'Structured interviews, direct system access, and time with your team to map workflows, surface product needs, and understand your technical landscape. We go broad before we go deep, making sure the solution we design fits the real problem.',
  },
  {
    number: '02',
    nodeX: 383,
    icon: BarChart2,
    title: 'Analysis',
    color: 'secondary',
    description:
      "We model the solution architecture and validate feasibility. Prototype integrations, data-flow diagrams, and a prioritized build list with effort and impact estimates for each workstream. You know exactly what you're getting before we write a line of production code.",
  },
  {
    number: '03',
    nodeX: 567,
    icon: Code2,
    title: 'Build',
    color: 'primary',
    description:
      'We ship working software. Iterative delivery with weekly checkpoints. No black-box development: you see every commit and can redirect at any checkpoint. From prototype to production-grade systems running in active deployments.',
  },
  {
    number: '04',
    nodeX: 750,
    icon: CheckCircle2,
    title: 'Verify',
    color: 'secondary',
    description:
      'We measure against the baseline established in Discovery. Automated testing, integration validation, and a documented handoff so your team owns what we built, with the context to maintain and extend it.',
  },
];

const diagonals: [number, number, number, number][] = [
  [100, 30, 200, 100],
  [200, 100, 292, 30],
  [292, 30, 383, 100],
  [383, 100, 475, 30],
  [475, 30, 567, 100],
  [567, 100, 658, 30],
  [658, 30, 750, 100],
  [750, 100, 850, 30],
];

const hangers: [number, number, number, number][] = [
  [292, 30, 292, 100],
  [475, 30, 475, 100],
  [658, 30, 658, 100],
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export function Methodology() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="methodology" className={styles.section}>
      <div className={styles.backgroundAccent} />

      <div ref={ref} className={styles.container}>
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className={styles.header}
        >
          <span className={styles.badge}>How We Work</span>
          <h2 className={styles.title}>
            Engineered to{' '}
            <span className={styles.gradient}>Deliver</span>
          </h2>
          <p className={styles.description}>
            Four stages. No surprises. Every engagement follows the same
            disciplined process from first audit to production handoff.
          </p>
        </motion.div>

        {/* Pratt truss schematic */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={styles.schematic}
        >
          <svg
            viewBox="0 0 900 140"
            preserveAspectRatio="xMidYMid meet"
            width="100%"
            aria-label="Four-stage engagement methodology: Discovery, Analysis, Build, Verify"
            role="img"
            className={styles.svg}
          >
            {stages.map((stage) => (
              <text
                key={`label-${stage.title}`}
                x={stage.nodeX}
                y={16}
                textAnchor="middle"
                fontSize="10"
                fontFamily="monospace"
                fill="rgba(242,244,245,0.5)"
                letterSpacing="0.08em"
              >
                {stage.title.toUpperCase()}
              </text>
            ))}
            <line x1="50" y1="100" x2="850" y2="100" stroke="rgba(242,244,245,0.2)" strokeWidth="2" className={styles.trussLine} />
            {diagonals.map(([x1, y1, x2, y2], i) => (
              <line key={`diag-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(242,244,245,0.15)" strokeWidth="1.5" className={styles.trussLine} />
            ))}
            {hangers.map(([x1, y1, x2, y2], i) => (
              <line key={`hanger-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(242,244,245,0.1)" strokeWidth="1" className={styles.trussLine} />
            ))}
            {stages.map((stage, i) => (
              <g key={`node-${stage.nodeX}`}>
                <circle cx={stage.nodeX} cy="100" r="7" style={{ fill: i % 2 === 0 ? 'var(--primary)' : 'var(--secondary)' }} />
                <rect x={stage.nodeX - 14} y={86} width="28" height="28" fill="#1A1F21" stroke="rgba(242,244,245,0.2)" strokeWidth="1" rx="0" />
                <text x={stage.nodeX} y={104} textAnchor="middle" fontSize="10" fontFamily="monospace" fill="rgba(242,244,245,0.8)" fontWeight="400" letterSpacing="0.05em">
                  {stage.number}
                </text>
              </g>
            ))}
          </svg>
        </motion.div>

        {/* Stage cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.stagesGrid}
        >
          {stages.map((stage) => (
            <motion.div key={stage.title} variants={cardVariants} className={styles.stageCard}>
              <div className={styles.stageCardInner}>
                <div className={styles.stageHeader}>
                  <div className={`${styles.stageIcon} ${styles[stage.color]}`}>
                    <stage.icon strokeWidth={1.5} />
                  </div>
                  <div className={styles.stageInfo}>
                    <h3 className={styles.stageTitle}>{stage.title}</h3>
                    <p className={styles.stageDescription}>{stage.description}</p>
                  </div>
                </div>
                <div className={`${styles.stageOverlay} ${styles[stage.color]}`} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
