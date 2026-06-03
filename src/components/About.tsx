'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Image from 'next/image';
import {
  Bot,
  Code2,
  LayoutPanelTop,
  Factory,
  Cloud,
  Layers,
  Users,
  Target,
} from 'lucide-react';
import styles from './About.module.scss';

const expertise = [
  { icon: Bot, label: 'AI/ML & Computer Vision' },
  { icon: Factory, label: 'Robotics & Autonomous Systems' },
  { icon: Cloud, label: 'Cloud Architecture & DevOps' },
  { icon: Code2, label: 'Full-Stack Development' },
  { icon: LayoutPanelTop, label: 'Computational Design & Geometry' },
  { icon: Layers, label: 'Scalable Systems Architecture' },
  { icon: Target, label: 'Product Strategy' },
  { icon: Users, label: 'Technical Leadership' },
];

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const, delay },
  },
});

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="about" className={styles.section}>
      <div ref={ref} className={styles.container}>
        <motion.div
          variants={fadeUp(0)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <span className={styles.badge}>About</span>
          <h2 className={styles.title}>Meet Tarek — Founder of TATAWUR</h2>
        </motion.div>

        <div className={styles.layout}>
          <motion.div
            variants={fadeUp(0.1)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={styles.textCol}
          >
            <p className={styles.leadText}>
              Tarek is uniquely positioned at the intersection of software, AI, and
              the built environment — with deep technical expertise and a proven
              track record of building novel products in uncharted territory.
            </p>
            <p className={styles.bioText}>
              At ICON, Tarek led product and engineering, building the software
              organization behind the platform that powered over 200
              robotically-built homes — delivering computational geometry engines,
              design automation tools, and real-time operations software that scaled
              construction technology from prototype to production.
            </p>
            <p className={styles.bioText}>
              Before that, he worked as an engineer at Arup and Walter P Moore,
              building BIM automation tools that reduced design iteration time by
              over 50%. Combined with graduate degrees in AI, computer science, and
              structural engineering, this breadth is exactly what Tatawur AI brings
              to every engagement: the ability to see across the full project
              lifecycle and build solutions that actually work in the field.
            </p>
          </motion.div>

          <motion.div
            variants={fadeUp(0.2)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className={styles.photoCol}
          >
            <div className={styles.photo}>
              <Image
                src="/tarek-profile.jpeg"
                alt="Tarek El-Afifi, Founder of Tatawur AI"
                fill
                className={styles.photoImage}
                priority
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={fadeUp(0.3)}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.expertiseSection}
        >
          <p className={styles.expertiseLabel}>Technical Expertise</p>
          <div className={styles.expertiseTags}>
            {expertise.map((item, index) => (
              <motion.div
                key={item.label}
                variants={fadeUp(0.35 + index * 0.04)}
                initial="hidden"
                animate={isInView ? 'visible' : 'hidden'}
                className={styles.expertiseTag}
              >
                <item.icon size={14} strokeWidth={1.5} />
                <span>{item.label}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
