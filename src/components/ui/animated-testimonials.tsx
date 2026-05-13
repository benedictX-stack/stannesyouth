import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  showAll = false,
}: {
  testimonials: Testimonial[];
  showAll?: boolean;
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = swipePower(offset.x, velocity.x);
    if (swipe < -swipeConfidenceThreshold) {
      handleNext();
    } else if (swipe > swipeConfidenceThreshold) {
      handlePrev();
    }
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  useEffect(() => {
    // Optional: Auto-play functionality if desired
    // const interval = setInterval(handleNext, 5000);
    // return () => clearInterval(interval);
  }, [testimonials.length]);

  if (showAll) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl mx-auto px-6">
        <AnimatePresence>
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
              className="group cursor-pointer flex flex-col items-center w-full max-w-[200px] lg:max-w-[240px] mx-auto"
            >
              <div className="relative overflow-hidden rounded-3xl aspect-[4/5] w-full bg-black border border-white/5 mb-4 shadow-xl">
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-500" />
              </div>
              
              <div className="text-center px-2 transform group-hover:-translate-y-1 transition-transform duration-500">
                <h3 className="text-cream font-heading text-xl lg:text-2xl italic tracking-tight mb-1">{testimonial.name}</h3>
                <p className="text-gold text-[10px] tracking-widest uppercase mt-1.5">{testimonial.designation}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-10">
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">
        {/* Images Side */}
        <div className="relative h-80 md:h-[400px] w-full">
          <AnimatePresence>
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{
                  opacity: 0,
                  scale: 0.9,
                  z: -100,
                  rotate: Math.random() * 20 - 10,
                }}
                animate={{
                  opacity: isActive(index) ? 1 : 0.4,
                  scale: isActive(index) ? 1 : 0.9,
                  z: isActive(index) ? 0 : -100,
                  rotate: isActive(index) ? 0 : (index % 2 === 0 ? 5 : -5),
                  zIndex: isActive(index)
                    ? 50
                    : testimonials.length + 2 - index,
                  y: isActive(index) ? [0, -40, 0] : 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.9,
                  z: 100,
                  rotate: Math.random() * 20 - 10,
                }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                }}
                drag={isActive(index) ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                className="absolute inset-0 origin-bottom flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <img
                  src={testimonial.src}
                  alt={testimonial.name}
                  draggable={false}
                  className="h-full w-[80%] md:w-full max-w-[320px] rounded-3xl object-cover object-center border border-white/10 shadow-2xl"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
        
        {/* Text Side */}
        <div className="flex justify-center flex-col h-full md:pl-8 text-center md:text-left">
          <div className="relative min-h-[160px] md:min-h-[200px] w-full flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-x-0 flex flex-col items-center md:items-start"
              >
                <h3 className="text-5xl md:text-6xl lg:text-7xl font-heading italic text-cream tracking-tighter leading-[1.05] mb-4">
                  {testimonials[active].name}
                </h3>
                <p className="text-gold text-sm md:text-base tracking-[0.3em] uppercase font-semibold">
                  {testimonials[active].designation}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
          
          <div className="flex justify-center md:justify-start gap-4 pt-6">
            <button
              onClick={handlePrev}
              className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group/button hover:bg-white/15 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5 text-cream group-hover/button:text-sunset group-hover/button:-translate-x-1 transition-all" />
            </button>
            <button
              onClick={handleNext}
              className="h-12 w-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group/button hover:bg-white/15 hover:border-white/20 transition-all duration-300 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5 text-cream group-hover/button:text-sunset group-hover/button:translate-x-1 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
