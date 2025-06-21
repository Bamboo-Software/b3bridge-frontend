import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TestimonialProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  className?: string;
  index?: number;
}

export function Testimonial({
  quote,
  author,
  role,
  avatar,
  className,
  index = 0,
}: TestimonialProps) {
  return (
    <motion.div
      className={cn(
        'rounded-lg border border-border bg-card/50 backdrop-blur-sm p-6 shadow-md flex flex-col',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="mb-4">
        <svg
          className="h-6 w-6 text-primary/60 dark:text-primary/70"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      <p className="text-foreground/80 mb-4 flex-grow">{quote}</p>
      <div className="flex items-center mt-auto">
        {avatar ? (
          <div className="mr-3 h-10 w-10 overflow-hidden rounded-full bg-primary/10 dark:bg-primary/20">
            <img
              src={avatar}
              alt={author}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="mr-3 h-10 w-10 flex items-center justify-center overflow-hidden rounded-full bg-primary/20 dark:bg-primary/30 text-primary dark:text-primary-foreground">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-foreground">{author}</p>
          {role && <p className="text-xs text-muted-foreground">{role}</p>}
        </div>
      </div>
    </motion.div>
  );
}

interface TestimonialGridProps {
  testimonials: TestimonialProps[];
  className?: string;
}

export function TestimonialGrid({ testimonials, className }: TestimonialGridProps) {
  return (
    <div className={cn('grid gap-6 md:grid-cols-2 lg:grid-cols-3', className)}>
      {testimonials.map((testimonial, index) => (
        <Testimonial key={index} {...testimonial} index={index} />
      ))}
    </div>
  );
}