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
    <section
      id="about"
      className="relative py-24 md:py-32 bg-background-off overflow-hidden"
    >
      {/* Subtle background accent */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-secondary/5 to-transparent rounded-full blur-3xl" />

      <div ref={ref} className="container-width px-4 sm:px-6 lg:px-8 relative">
        {/* Header with inline profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-12"
        >
          <div>
            <span className="inline-block text-secondary font-medium text-sm tracking-wide uppercase mb-1">
              About
            </span>
            <h2 className="text-neutral-dark">Meet Tarek</h2>
          </div>
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden ring-4 ring-white shadow-lg flex-shrink-0">
            <Image
              src="/tarek-profile.jpeg"
              alt="Tarek - Founder of Tatawur AI"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
        </motion.div>

        {/* Two column layout: Text | Expertise */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Bio content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-5"
          >
            <p className="text-lg text-neutral-dark leading-relaxed">
              Tarek is uniquely positioned at the intersection of{' '}
              <span className="text-primary font-semibold">software</span>,{' '}
              <span className="text-secondary font-semibold">AI</span>, and the{' '}
              <span className="text-accent font-semibold">
                built environment
              </span>
              —with deep technical expertise and a proven track record of
              building novel products in uncharted territory.
            </p>

            <p className="text-neutral-dark/75">
              As VP of Software Products at ICON, Tarek led a team of 30+
              engineers developing the software platform behind over 200
              robotically-built homes—delivering computational geometry
              engines, design automation tools, and real-time operations
              software that scaled construction technology from prototype to
              production.
            </p>

            <p className="text-neutral-dark/75">
              Prior to software leadership, he worked as an engineer at Arup
              and Walter P Moore, building BIM automation tools that reduced
              design iteration time by over 50%. This foundation, combined with
              graduate degrees in AI, computer science, and structural
              engineering, enables him to translate complex technical
              possibilities into practical solutions.
            </p>
          </motion.div>

          {/* Expertise cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-sm text-neutral-dark/50 uppercase tracking-wide font-medium mb-4">
              Technical Expertise
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {expertise.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={
                    isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                  }
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border border-neutral-light/30 hover:border-secondary/30 transition-colors group"
                >
                  <item.icon
                    size={18}
                    className="text-primary/60 group-hover:text-secondary transition-colors flex-shrink-0"
                  />
                  <span className="text-sm text-neutral-dark/70">
                    {item.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
