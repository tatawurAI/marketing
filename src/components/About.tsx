'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Image from 'next/image';
import {
  Briefcase,
  Bot,
  Code2,
  Cpu,
  LayoutPanelTop,
  CircuitBoard,
  Factory,
  Cloud,
  Layers,
} from 'lucide-react';

const expertise = [
  { icon: Bot, label: 'AI/ML & Computer Vision' },
  { icon: Factory, label: 'Robotics & Autonomous Systems' },
  { icon: Cloud, label: 'Cloud Architecture & DevOps' },
  { icon: Code2, label: 'Full-Stack Development' },
  { icon: LayoutPanelTop, label: 'BIM & Computational Design' },
  { icon: CircuitBoard, label: 'Embedded Systems & IoT' },
  { icon: Layers, label: 'Microservices & Event-Driven Systems' },
  { icon: Briefcase, label: 'Technical Leadership & Strategy' },
];

export function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      id="about"
      className="relative py-24 md:py-32 bg-gradient-to-b from-white to-background-off overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-secondary/10 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div ref={ref} className="container-width px-4 sm:px-6 lg:px-8 relative">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent-700 rounded-full text-sm font-medium mb-6">
            Meet the Founder
          </span>
          <h2 className="text-neutral-dark mb-6">About Tarek</h2>
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-5 gap-12 items-start">
          {/* Profile section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="relative">
              {/* Profile image */}
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border border-neutral-light/50 shadow-2xl">
                <Image
                  src="/tarek-profile.jpeg"
                  alt="Tarek - Founder of Tatawur AI"
                  fill
                  className="object-cover object-top"
                  priority
                />

                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 via-transparent to-transparent" />
              </div>
            </div>
          </motion.div>

          {/* Bio section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 30 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-3 space-y-8"
          >
            {/* Intro */}
            <div className="prose prose-lg">
              <p className="text-neutral-dark/80 leading-relaxed text-lg">
                Tarek is uniquely positioned at the intersection of{' '}
                <span className="text-primary font-medium">software</span>,{' '}
                <span className="text-secondary font-medium">
                  artificial intelligence
                </span>
                , and the{' '}
                <span className="text-accent font-medium">
                  built environment
                </span>
                —with deep technical expertise and a proven track record of
                building novel products in uncharted territory.
              </p>
            </div>

            {/* Background */}
            <div className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl border border-primary/10">
              <h4 className="text-lg font-heading font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-primary" />
                Background
              </h4>
              <div className="space-y-4 text-neutral-dark/70">
                <p className="leading-relaxed">
                  As VP of Software Products at ICON, Tarek led a team of 30+
                  engineers developing the software platform behind over 200
                  robotically-built homes. His organization delivered
                  computational geometry engines that transformed architectural
                  models into executable construction plans, design automation
                  tools, and real-time operations software that scaled
                  construction technology from prototype to production.
                </p>
                <p className="leading-relaxed">
                  Prior to software leadership, Tarek worked as a structural
                  engineer at Arup and Walter P Moore, where he designed
                  systems for major projects and built BIM automation tools
                  that reduced design iteration time by 60%. This foundation in
                  construction engineering, combined with master's degrees in
                  AI, computer science, and structural engineering, enables him
                  to translate complex technical possibilities into practical
                  solutions that work in the field.
                </p>
              </div>
            </div>

            {/* Expertise */}
            <div>
              <h4 className="text-lg font-heading font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Cpu size={20} className="text-accent" />
                Technical Expertise
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {expertise.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={
                      isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }
                    }
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-neutral-light/30 hover:border-secondary/30 transition-colors group"
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
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
