'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import styles from './SelectedWork.module.scss';

const projects = [
  {
    number: '01',
    title: 'OSD Phase II SBIR: Generative AI for Construction Approvals',
    tags: 'Knowledge Graphs · Agentic AI · BIM',
    body: 'Led a program to transform how the Department of Defense reviews military construction designs. Developed an AI assistant embedded directly within BIM authoring tools that encodes UFC and IBC building codes as a queryable knowledge graph, enabling continuous compliance analysis as architects work rather than treating review as a post-design gate. The system applies graph neural networks and LLM reasoning to surface violations with specific code citations and explicit uncertainty acknowledgment, shifting issue discovery from the construction site upstream, where they cost the least to fix.',
    link: {
      label: 'Publicly awarded contract',
      url: 'https://www.sbir.gov/awards/218464',
    },
  },
  {
    number: '02',
    title: 'DARPA Phase II SBIR: Secure Facility Design & Accreditation',
    tags: 'Artificial Intelligence · Computer Vision · Augmented Reality',
    body: 'Served as principal investigator on a DARPA-funded program to automate the design, construction management, and accreditation of secure facilities. Led the team that developed a graph-based BIM analysis engine using domain-specific AI agents, an iOS augmented reality application for life-size design visualization and field verification, and a point cloud scanning system that reconstructs interior spaces in three dimensions with 0.25″ accuracy over 30′, precise enough to verify as-built construction against design intent.',
    link: {
      label: 'Publicly awarded contract',
      url: 'https://www.sbir.gov/awards/209865',
    },
  },
  {
    number: '03',
    title: 'Robotic Construction Platform',
    tags: 'Robotics · Computational Geometry · Cloud Infrastructure',
    body: 'Built the software foundation for a robotic home construction platform, scaling from initial prototype to 200+ homes printed across multiple active sites. Designed the computational geometry engine that converts architectural models into structurally sound, thermally optimized print paths. Managed the development of real-time telemetry, site operations software, and computer vision systems for automated quality control and compliance documentation.',
  },
  {
    number: '04',
    title: 'Design-to-Build Pipeline',
    tags: 'Design Automation · BIM · ERP Integration',
    body: 'Built a platform managing the full design-to-build pipeline — handling design conversion from BIM platforms, bill of materials generation, quantity takeoffs, and cost integrations. Gave project teams a live view of how design decisions affect procurement, cost, and construction planning.',
  },
  {
    number: '05',
    title: 'Design Analysis & Automation',
    tags: 'Design Automation · Structural Engineering · BIM',
    body: 'Built integrations between structural analysis models, Revit, and construction takeoff platforms enabling continuous monitoring and compliance analysis as design changes occur on large commercial projects. Developed LOD 400 automation plugins for BIM platforms and custom interoperability tooling that eliminated significant manual rework across engineering teams. Parametric automation reduced design iteration time by over 50% on large-scale commercial projects.',
  },
  {
    number: '06',
    title: 'Offshore Structural Inspection',
    tags: 'Computer Vision · Structural Engineering · Machine Learning',
    body: 'Trained a computer vision model to automatically grade external corrosion on offshore oil and gas structures from inspection photos, enabling automated damage assessment at a global engineering firm. Replaced a manual, inspector-dependent process with an automated approach to structural damage assessment.',
  },
];

export function SelectedWork() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="work" className={styles.section}>
      <div ref={ref} className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.55 }}
          className={styles.header}
        >
          <span className={styles.badge}>Proof of Work</span>
          <h2 className={styles.title}>Selected Work</h2>
          <p className={styles.description}>
            Systems built and shipped — from government-funded R&D to production
            software on active job sites.
          </p>
        </motion.div>

        <div className={styles.projectsList}>
          {projects.map((project, index) => (
            <motion.div
              key={project.number}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
              transition={{ duration: 0.55, delay: 0.05 + index * 0.08 }}
              className={styles.projectRow}
            >
              <span className={styles.projectNumber} aria-hidden="true">
                {project.number}
              </span>

              <div className={styles.projectContent}>
                <h3 className={styles.projectTitle}>{project.title}</h3>
                <p className={styles.tags}>{project.tags}</p>
                <p className={styles.projectBody}>{project.body}</p>
                {project.link && (
                  <a
                    href={project.link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.projectLink}
                  >
                    {project.link.label}
                    <span className={styles.linkArrow} aria-hidden="true">&thinsp;&#8599;</span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
