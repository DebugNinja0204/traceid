import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export const FadeIn: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  transition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const SlideUp: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  transition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={transition}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerContainer: React.FC<HTMLMotionProps<'div'> & { staggerDelay?: number }> = ({
  children,
  staggerDelay = 0.05,
  ...props
}) => {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit="hidden"
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const StaggerItem: React.FC<HTMLMotionProps<'div'>> = ({
  children,
  ...props
}) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
};