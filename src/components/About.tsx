'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import {
  Bot,
  Code2,
  LayoutPanelTop,
  CircuitBoard,
  Factory,
  Cloud,
  Layers,
  Users,
} from 'lucide-react';
import styles from './About.module.scss';

const expertise = [
  { icon: Bot, label: 'AI/ML & Computer Vision' },
  { icon: Factory, label: 'Robotics & Autonomous Systems' },
  { icon: Cloud, label: 'Cloud Architecture & DevOps' },
  { icon: Code2, label: 'Full-Stack Development' },
  { icon: LayoutPanelTop, label: 'BIM & Computational Design' },
  { icon: CircuitBoard, label: 'Embedded Systems & IoT' },
  { icon: Layers, label: 'Microservices & Event-Driven' },
  { icon: Users, label: 'Technical Leadership' },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className={styles.section}>
      <div className={styles.backgroundAccent} />

      <div ref={ref} className={styles.container}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className={styles.header}
        >
          <span className={styles.label}>About</span>
          <h2 className={styles.title}>
            Meet Tarek - Founder of{' '}
            <span className={styles.gradient}>Tatawur AI</span>
          </h2>
        </motion.div>

        {/* Lead paragraph with profile photo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={styles.leadSection}
        >
          <p className={styles.leadText}>
            Tarek is uniquely positioned at the intersection of software, AI,
            and the built environment—with deep technical expertise and a
            proven track record of building novel products in uncharted
            territory.
          </p>
          <div className={styles.photoWrapper}>
            <div className={styles.photo}>
              <Image
                src="/tarek-profile.jpeg"
                alt="Tarek - Founder of Tatawur AI"
                fill
                className={styles.photoImage}
                priority
              />
            </div>
          </div>
        </motion.div>

        {/* Two column layout: Bio | Expertise */}
        <div className={styles.columns}>
          {/* Bio content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={styles.bioContent}
          >
            <p className={styles.bioText}>
              During his tenure as VP of Software Products at ICON, Tarek led a
              team of 30+ engineers developing the software platform behind
              over 200 robotically-built homes—delivering computational
              geometry engines, design automation tools, and real-time
              operations software that scaled construction technology from
              prototype to production.
            </p>

            <p className={styles.bioText}>
              Prior to software leadership, he worked as an engineer at Arup
              and Walter P Moore, building BIM automation tools that reduced
              design iteration time by over 50%. This foundation, combined with
              graduate degrees in AI, computer science, and structural
              engineering, enables him to translate complex technical
              possibilities into practical solutions.
            </p>
          </motion.div>

          {/* Expertise column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className={styles.expertiseColumn}
          >
            <p className={styles.expertiseLabel}>Technical Expertise</p>
            <div className={styles.expertiseGrid}>
              {expertise.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                  }
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                  className={styles.expertiseCard}
                >
                  <item.icon size={18} className={styles.expertiseIcon} />
                  <span className={styles.expertiseText}>{item.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
