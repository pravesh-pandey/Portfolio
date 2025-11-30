import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import "./Hero.css";

export const Hero = () => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });

    const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

    return (
        <section className="hero" ref={ref}>
            <motion.div className="hero__content" style={{ y, opacity }}>
                <motion.h1
                    className="hero__title"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
                >
                    Creative Developer
                    <br />
                    <span className="hero__subtitle">& System Architect</span>
                </motion.h1>

                <motion.p
                    className="hero__description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 }}
                >
                    Building scalable systems and crafting digital experiences that perform at scale.
                    Focusing on performance, reliability, and minimalist aesthetics.
                </motion.p>
            </motion.div>

            <div className="hero__background">
                <div className="hero__glow" />
            </div>
        </section>
    );
};
