import React from 'react';
import { motion } from 'framer-motion';

function SimpleAnimation() {
    return (
        <motion.svg
            width="800"
            height="800"
            viewBox="0 0 400 400"
            xmlns="http://www.w3.org/2000/svg"
        >
            <motion.path
                d="M 10 80 C 40 10, 65 10, 95 80 S 150 150, 180 80"
                fill="transparent"
                stroke="blue"
                strokeWidth="4"
                animate={{
                    d: [
                        'M 10 150 L 100 150 C 300 150 370 700 380 800',
                        'M 10 150 L 100 150 C 300 150 300 700 300 800',
                    ]
                }}
                transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse",
                }}
            />
        </motion.svg>
    );
}

export default SimpleAnimation;