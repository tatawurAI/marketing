'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { 
  GraduationCap, 
  Briefcase, 
  Building, 
  Bot, 
  Code2, 
  Cpu,
  LayoutPanelTop,
  CircuitBoard,
  Factory
} from 'lucide-react'

const education = [
  { degree: 'M.S. in Computer Science', school: 'University of Pennsylvania' },
  { degree: 'M.S. in Structural Engineering', school: 'University of Texas at Austin' },
  { degree: 'B.S. in Architectural Engineering', school: 'University of Texas at Austin' },
]

const expertise = [
  { icon: Factory, label: 'Construction technology and robotics software' },
  { icon: Bot, label: 'AI/ML applications in AEC' },
  { icon: Code2, label: 'Software architecture and platform development' },
  { icon: Briefcase, label: 'Team building and technical leadership' },
  { icon: LayoutPanelTop, label: 'BIM and computational design' },
  { icon: CircuitBoard, label: 'Embedded systems and IoT integration' },
]

export function About() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="relative py-24 md:py-32 bg-gradient-to-b from-white to-background-off overflow-hidden">
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
          <h2 className="text-neutral-dark mb-6">
            About Tarek
          </h2>
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

              {/* Floating badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="absolute -bottom-6 -right-6 md:right-6 bg-white p-4 rounded-2xl shadow-xl border border-neutral-light/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary-600 flex items-center justify-center">
                    <Building size={24} className="text-white" />
                  </div>
                  <div>
                    <div className="text-lg font-heading font-bold text-primary">Former VP</div>
                    <div className="text-xs text-neutral-dark/60">ICON (Unicorn)</div>
                  </div>
                </div>
              </motion.div>
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
                Tarek brings a unique combination of structural engineering expertise and 
                software leadership to help AEC firms leverage technology for competitive advantage.
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
                  Most recently, Tarek served as <span className="text-primary font-medium">VP of Software Products at ICON</span>, 
                  a construction technology unicorn pioneering 3D-printed housing at scale. During his five-year 
                  tenure, he grew from the company&apos;s second software engineer to leading a cross-functional 
                  team of <span className="text-secondary font-medium">30+ engineers, designers, and product managers</span>.
                </p>
                <p className="leading-relaxed">
                  Under his leadership, the software organization developed the platforms that power ICON&apos;s 
                  robotic construction systems, successfully delivering over <span className="text-accent font-medium">200 homes</span>.
                </p>
                <p className="leading-relaxed">
                  Prior to his software career, Tarek worked as a structural engineer at internationally 
                  recognized firms including <span className="font-medium">Arup</span> and <span className="font-medium">Walter P Moore</span>, 
                  giving him firsthand experience with the workflows, challenges, and opportunities in 
                  traditional AEC practice.
                </p>
              </div>
            </div>

            {/* Education */}
            <div>
              <h4 className="text-lg font-heading font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <GraduationCap size={20} className="text-secondary" />
                Education
              </h4>
              <div className="grid sm:grid-cols-3 gap-4">
                {education.map((edu, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="p-4 bg-white rounded-xl border border-neutral-light/50 shadow-sm"
                  >
                    <div className="text-sm font-medium text-neutral-dark mb-1">{edu.degree}</div>
                    <div className="text-xs text-neutral-dark/60">{edu.school}</div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Expertise */}
            <div>
              <h4 className="text-lg font-heading font-semibold text-neutral-dark mb-4 flex items-center gap-2">
                <Cpu size={20} className="text-accent" />
                Expertise
              </h4>
              <div className="grid sm:grid-cols-2 gap-3">
                {expertise.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                    transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-white/80 rounded-xl border border-neutral-light/30 hover:border-secondary/30 transition-colors group"
                  >
                    <item.icon size={18} className="text-primary/60 group-hover:text-secondary transition-colors flex-shrink-0" />
                    <span className="text-sm text-neutral-dark/70">{item.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
