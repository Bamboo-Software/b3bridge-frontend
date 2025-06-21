import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { cn } from '@/lib/utils';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
  index?: number;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  index = 0,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
    >
      <Card 
        className={cn(
          'overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm h-full', 
          className
        )}
      >
        <CardHeader className="pb-2">
          <div className="mb-2 inline-flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            {icon}
          </div>
          <CardTitle className="bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-foreground/70 text-base">
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}

interface FeatureGridProps {
  features: Omit<FeatureCardProps, 'index'>[];
  className?: string;
}

export function FeatureGrid({ features, className }: FeatureGridProps) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {features.map((feature, index) => (
        <FeatureCard key={index} {...feature} index={index} />
      ))}
    </div>
  );
}