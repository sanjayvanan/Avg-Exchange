// src/components/StepsSection.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { IoPersonAdd, IoWallet, IoRocketSharp } from 'react-icons/io5';
import { stepsStyles as s } from './HomeStyles';

const steps = [
  {
    id: "01",
    icon: <IoPersonAdd />,
    title: "Create Account",
    desc: "Sign up in seconds. Verify your identity and secure your account with 2FA instantly.",
    // Theme: Cyan/Green
    colors: {
      shadow: "hover:shadow-cyan-500/20",
      border: "hover:border-cyan-500/50",
      iconBg: "bg-cyan-500/10",
      iconText: "text-cyan-400",
      iconHover: "group-hover:bg-cyan-500 group-hover:text-black",
      glow: "bg-cyan-500",
      titleHover: "group-hover:text-cyan-400",
      bar: "bg-gradient-to-r from-cyan-500 to-[#00D68F]"
    }
  },
  {
    id: "02",
    icon: <IoWallet />,
    title: "Fund Wallet",
    desc: "Connect your bank or transfer crypto. We support 50+ fiat currencies globally.",
    // Theme: Purple/Pink
    colors: {
      shadow: "hover:shadow-purple-500/20",
      border: "hover:border-purple-500/50",
      iconBg: "bg-purple-500/10",
      iconText: "text-purple-400",
      iconHover: "group-hover:bg-purple-500 group-hover:text-white",
      glow: "bg-purple-500",
      titleHover: "group-hover:text-purple-400",
      bar: "bg-gradient-to-r from-purple-500 to-pink-500"
    }
  },
  {
    id: "03",
    icon: <IoRocketSharp />,
    title: "Start Trading",
    desc: "Buy, sell, and swap assets. Access advanced charts and execute trades with zero latency.",
    // Theme: Orange/Amber
    colors: {
      shadow: "hover:shadow-orange-500/20",
      border: "hover:border-orange-500/50",
      iconBg: "bg-orange-500/10",
      iconText: "text-orange-400",
      iconHover: "group-hover:bg-orange-500 group-hover:text-black",
      glow: "bg-orange-500",
      titleHover: "group-hover:text-orange-400",
      bar: "bg-gradient-to-r from-orange-500 to-yellow-500"
    }
  }
];

const StepsSection = () => {
  return (
    <section className={s.section}>
      <div className={s.glowLeft} />
      <div className={s.glowRight} />

      <div className={s.container}>
        
        <motion.div 
          className={s.header}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className={s.title}>
            Start Trading in <span className={s.highlight}>3 Steps</span>
          </h2>
          <p className={s.subtitle}>
            Join the revolution. We've streamlined the process so you can focus on your portfolio.
          </p>
        </motion.div>

        <div className={s.grid}>
          {/* Connector Line */}
          <div className={s.connectorContainer}>
            <div className={s.connectorLine} />
          </div>

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              // Combine base classes with dynamic color themes
              className={`${s.stepCard} ${step.colors.shadow} ${step.colors.border}`}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
            >
              
              {/* Massive Glowing Number Backdrop */}
              <div className={`${s.numberBox} ${step.colors.glow}`} />
              
              {/* Visible Number Text */}
              <div className={s.numberText}>{step.id}</div>

              {/* Icon */}
              <div className={`${s.iconWrapper} ${step.colors.iconBg} ${step.colors.iconText} ${step.colors.iconHover}`}>
                {step.icon}
              </div>

              {/* Content */}
              <div className={s.content}>
                <h3 className={`${s.stepTitle} ${step.colors.titleHover}`}>{step.title}</h3>
                <p className={s.stepDesc}>{step.desc}</p>
              </div>

              {/* Bottom Colored Bar */}
              <div className={`${s.bottomBar} ${step.colors.bar}`} />

            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StepsSection;