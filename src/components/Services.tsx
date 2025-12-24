'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Compass, Boxes, Brain, Bot, ArrowRight } from 'lucide-react';
import styles from './Services.module.scss';

const services = [
  {
    icon: Compass,
    title: 'Design & Plan Automation',
    description:
      'Transform weeks of manual work into automated workflows—from schematic design through fabrication-ready outputs.',
    features: [
      'AI-assisted design generation and optimization',
      'Automated drawing production and documentation',
      'Design-to-fabrication data pipelines',
      'Parametric systems that adapt to project constraints',
      'Scale your output without scaling your team',
    ],
    color: 'primary',
  },
  {
    icon: Boxes,
    title: 'Digital Twin & Simulation',
    description:
      'Build a living digital replica that connects your model to schedules, quantities, and the systems that drive your project.',
    features: [
      'Automated BOM generation and quantity takeoffs',
      '4D scheduling and construction sequencing',
      'Integrations with ERP, procurement, and project controls',
      'Predictive simulation and scenario modeling',
      'Real-time synchronization across design and field',
    ],
    color: 'secondary',
  },
  {
    icon: Brain,
    title: 'AI & Intelligent Systems',
    description:
      'Embed machine intelligence into your workflows—augmenting human expertise with systems that learn and adapt.',
    features: [
      'Custom AI models trained on your domain data',
      'Computer vision for quality control and progress tracking',
      'Natural language interfaces for technical documentation',
      'Predictive analytics for scheduling and risk assessment',
      'Intelligent automation that improves over time',
    ],
    color: 'primary',
  },
  {
    icon: Bot,
    title: 'Robotics & Fabrication',
    description:
      'Bridge the gap between digital design and physical production with software that drives automated construction.',
    features: [
      'Robotic construction system integration',
      'Automated fabrication workflow development',
      'Machine control software and path planning',
      'Real-time feedback loops between site and model',
      'End-to-end digital-to-physical pipelines',
    ],
    color: 'secondary',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
};

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const handleScroll = () => {
    const element = document.querySelector('#contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="services" className={styles.section}>
      {/* Background patterns */}
      <div className={styles.backgroundPattern}>
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
          <span className={styles.badge}>What We Offer</span>
          <h2 className={styles.title}>Services</h2>
          <p className={styles.description}>
            Comprehensive consulting solutions tailored to your digital
            transformation needs
          </p>
        </motion.div>

        {/* Service cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={styles.servicesGrid}
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className={styles.serviceCard}
            >
              <div className={styles.serviceCardInner}>
                {/* Header */}
                <div className={styles.serviceHeader}>
                  <div
                    className={`${styles.serviceIcon} ${styles[service.color]}`}
                  >
                    <service.icon strokeWidth={1.5} />
                  </div>
                  <div className={styles.serviceInfo}>
                    <h3 className={styles.serviceTitle}>{service.title}</h3>
                    <p className={styles.serviceDescription}>
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <ul className={styles.featuresList}>
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className={styles.featureItem}>
                      <span
                        className={`${styles.featureDot} ${styles[service.color]}`}
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Hover overlay */}
                <div
                  className={`${styles.serviceOverlay} ${styles[service.color]}`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className={styles.ctaSection}
        >
          <motion.button
            onClick={handleScroll}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={styles.ctaButton}
          >
            Ready to discuss your project?
            <ArrowRight size={18} className={styles.arrow} />
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
