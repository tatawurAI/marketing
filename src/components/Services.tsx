'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './Services.module.scss';

const services = [
  {
    number: '01',
    title: 'Design & Plan Automation',
    description:
      'Transform weeks of manual work into automated workflows — from computational geometry and parametric modeling through fabrication-ready outputs.',
    features: [
      'AI-assisted design generation and geometric optimization',
      'Automated drawing production and documentation',
      'Design-to-fabrication data pipelines',
      'Parametric systems that adapt to project constraints',
      'Scale your output without scaling your team',
    ],
  },
  {
    number: '02',
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
  },
  {
    number: '03',
    title: 'AI & Intelligent Systems',
    description:
      'From product strategy to production deployment — embed machine intelligence into your workflows and build AI-powered tools your teams will actually use.',
    features: [
      'Product strategy and roadmapping for AI-powered engineering initiatives',
      'Custom AI models trained on your domain data',
      'Computer vision for quality control and progress tracking',
      'Natural language interfaces for technical documentation',
      'Predictive analytics for scheduling and risk assessment',
    ],
  },
  {
    number: '04',
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
  },
];

export function Services() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="services" className={styles.section}>
      <div ref={ref} className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.55 }}
          className={styles.header}
        >
          <span className={styles.badge}>What We Offer</span>
          <h2 className={styles.title}>Services</h2>
          <p className={styles.description}>
            End-to-end consulting tailored to where you are and where you want to go.
          </p>
        </motion.div>

        <div className={styles.servicesList}>
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.55, delay: 0.1 + index * 0.1 }}
              className={styles.serviceRow}
            >
              <span className={styles.serviceNumber} aria-hidden="true">
                {service.number}
              </span>

              <div className={styles.serviceLeft}>
                <h3 className={styles.serviceTitle}>{service.title}</h3>
              </div>

              <div className={styles.serviceRight}>
                <p className={styles.serviceDescription}>{service.description}</p>
                <ul className={styles.featuresList}>
                  {service.features.map((feature) => (
                    <li key={feature} className={styles.featureItem}>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
