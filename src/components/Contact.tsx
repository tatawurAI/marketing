'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import { Mail, MapPin, Linkedin, Send } from 'lucide-react';
import styles from './Contact.module.scss';

const projectTypes = [
  'Software Strategy',
  'AI/Automation Implementation',
  'Construction Technology',
  'Technical Leadership',
  'Other',
];

export function Contact() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    projectType: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Build email body
    const emailBody = `
Name: ${formData.name}
Email: ${formData.email}
Company: ${formData.company || 'Not provided'}
Phone: ${formData.phone || 'Not provided'}
Project Type: ${formData.projectType || 'Not specified'}

Message:
${formData.message}
    `.trim();

    // Build subject line
    const subject = formData.projectType
      ? `New Inquiry: ${formData.projectType} - ${formData.name}`
      : `New Inquiry from ${formData.name}`;

    // Create mailto link and open it
    const mailtoLink = `mailto:tarek@tatawur.ai?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(emailBody)}`;
    window.location.href = mailtoLink;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <section id="contact" className={styles.section}>
      {/* Background decoration */}
      <div className={styles.backgroundDecoration}>
        <div className={styles.glow} />
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
          <span className={styles.badge}>Get In Touch</span>
          <h2 className={styles.title}>
            Let&apos;s Build the Future Together
          </h2>
          <p className={styles.description}>
            Reach out to discuss how Tatawur AI can help transform your
            workflows
          </p>
        </motion.div>

        <div className={styles.contentGrid}>
          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={styles.formCard}>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.formRow}>
                  {/* Name */}
                  <div className={styles.formGroup}>
                    <label htmlFor="name" className={styles.label}>
                      Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email */}
                  <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                      Email <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div className={styles.formRow}>
                  {/* Company */}
                  <div className={styles.formGroup}>
                    <label htmlFor="company" className={styles.label}>
                      Company
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="Your company"
                    />
                  </div>

                  {/* Phone */}
                  <div className={styles.formGroup}>
                    <label htmlFor="phone" className={styles.label}>
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={styles.input}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                {/* Project Type */}
                <div className={styles.formGroup}>
                  <label htmlFor="projectType" className={styles.label}>
                    Project Type
                  </label>
                  <select
                    id="projectType"
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className={styles.select}
                  >
                    <option value="">Select a project type</option>
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message */}
                <div className={styles.formGroup}>
                  <label htmlFor="message" className={styles.label}>
                    Message <span className={styles.required}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className={styles.textarea}
                    placeholder="Tell us about your project or how we can help..."
                  />
                </div>

                {/* Submit button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={styles.submitButton}
                >
                  <Send size={18} />
                  Send Message
                </motion.button>

                <p className={styles.formNote}>
                  Clicking send will open your email client with the message
                  pre-filled
                </p>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
