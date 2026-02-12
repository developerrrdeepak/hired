import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export const FadeIn = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: "easeOut" }}
    className={className}
  >
    {children}
  </motion.div>
);

export const SlideIn = ({ children, direction = "left", delay = 0, className = "" }: { children: ReactNode, direction?: "left" | "right" | "up" | "down", delay?: number, className?: string }) => {
    const variants = {
        hidden: { 
            opacity: 0, 
            x: direction === "left" ? -20 : direction === "right" ? 20 : 0, 
            y: direction === "up" ? 20 : direction === "down" ? -20 : 0 
        },
        visible: { opacity: 1, x: 0, y: 0 }
    };

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={variants}
            transition={{ duration: 0.4, delay, ease: "easeOut" }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

export const StaggerContainer = ({ children, className = "", staggerDelay = 0.1 }: { children: ReactNode, className?: string, staggerDelay?: number }) => (
    <motion.div
        initial="hidden"
        animate="visible"
        variants={{
            visible: { transition: { staggerChildren: staggerDelay } }
        }}
        className={className}
    >
        {children}
    </motion.div>
);

export const ScaleIn = ({ children, delay = 0, className = "" }: { children: ReactNode, delay?: number, className?: string }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay }}
        className={className}
    >
        {children}
    </motion.div>
);

export const Bounce = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
    <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export const Pulse = ({ children, className = "" }: { children: ReactNode, className?: string }) => (
    <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={className}
    >
        {children}
    </motion.div>
);


