import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  isLast?: boolean;
  index: number;
}

const TimelineItem = ({ title, description, icon, isLast = false, index }: TimelineItemProps) => {
  return (
    <motion.div 
      className="flex gap-4"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="flex flex-col items-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20 text-primary dark:bg-primary/30 dark:text-primary-foreground z-10">
          {icon || (
            <span className="text-lg font-semibold">{index + 1}</span>
          )}
        </div>
        {!isLast && (
          <div className="h-full w-px bg-gradient-to-b from-primary/50 to-primary/5 dark:from-primary/70 dark:to-primary/10 mt-2"></div>
        )}
      </div>
      <div className={cn("pb-8", isLast ? "" : "")}>
        <h3 className="text-xl font-semibold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400 dark:from-primary dark:to-cyan-300">
          {title}
        </h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
};

interface TimelineProps {
  items: Array<{
    title: string;
    description: string;
    icon?: React.ReactNode;
  }>;
  className?: string;
}

export function Timeline({ items, className }: TimelineProps) {
  return (
    <div className={cn("relative py-4", className)}>
      {items.map((item, index) => (
        <TimelineItem
          key={index}
          title={item.title}
          description={item.description}
          icon={item.icon}
          isLast={index === items.length - 1}
          index={index}
        />
      ))}
    </div>
  );
}