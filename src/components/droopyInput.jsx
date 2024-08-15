import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

function TextInput() {
    const [text, setText] = useState('');
    const [placeholder, setPlaceholder] = useState('type something...');
    const inputRef = useRef(null);
    const intervalRef = useRef(null);

    const handleChange = (event) => {
        const value = event.target.value;
        setText(value);

        if (intervalRef.current) {
            clearInterval(intervalRef.current); // Stop placeholder cycling when typing starts
            intervalRef.current = null;
        }

        if (value.length === 0) {
            let placeholderIndex = 0;
            const placeholders = ['type something.', 'type something..', 'type something...'];

            intervalRef.current = setInterval(() => {
                setPlaceholder(placeholders[placeholderIndex]);
                placeholderIndex = (placeholderIndex + 1) % placeholders.length;
            }, 500);
        }
    };

    useEffect(() => {
        inputRef.current.focus(); // Focus the input field on mount

        let placeholderIndex = 0;
        const placeholders = ['type something.', 'type something..', 'type something...'];

        intervalRef.current = setInterval(() => {
            setPlaceholder(placeholders[placeholderIndex]);
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
        }, 500); // Cycle every 500ms

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current); // Clean up on unmount
            }
        };
    }, []);

    // Calculate curve based on the length of the text
    const char = text.length;
    const weight = char > 8 ? char - 8 : 0;
    const [offset, setOffset] = useState(Math.pow(weight, 2)); // Initialize offset state

    // Update offset dynamically whenever weight changes
    useEffect(() => {
        setOffset(Math.pow(weight, 2)); // Adjust the offset dynamically based on weight
    }, [weight]);

    useEffect(() => {
        const interval = setInterval(() => {
            setOffset(prevOffset => {
                return prevOffset - (prevOffset * 0.01); // Exponentially reduce the offset
            });
        }, 100); // Adjust interval to control the rate of reduction
    
        return () => clearInterval(interval); // Cleanup interval on unmount
    }, [weight]); // This effect should reset whenever `weight` changes
    
    

    // Control points for the cubic Bézier curve
    const curveStartX = 100; // Where the curve begins on the x-axis
    const curveStartY = 150; // Y position of the curve start (kept constant)
    const curveEndX = 590; // The end of the curve (right edge)
    const curveEndY = 150 + Math.pow(weight, 2); // The right edge moves downwards with weight

    // Control points are calculated to create a smooth downward curve
    const controlPointX1 = curveStartX + 200; // Slightly after the curve start
    const controlPointY1 = curveStartY; // Keep this aligned with the start to ensure the start is straight
    const controlPointX2 = curveEndX - 50; // Close to the end of the curve
    const controlPointY2 = curveEndY; // Move down with the curve's end

    const pathData = { 
        curveStartX, 
        curveStartY, 
        controlPointX1, 
        controlPointY1, 
        controlPointX2, 
        controlPointY2, 
        curveEndX, 
        curveEndY 
    };

    // Path data string for SVG
    const pathD = `M10 150 L${curveStartX} ${curveStartY} C ${controlPointX1} ${controlPointY1}, ${controlPointX2} ${controlPointY2}, ${curveEndX} ${curveEndY}`;
    const pathRight = getOscillatedPath(pathData, offset); // Small amplitude oscillation to the right
    const pathLeft = getOscillatedPath(pathData, -offset);  // Small amplitude oscillation to the left

    return(
        <div style={{ position: 'relative', width: '600px', height: '200px' }}>
            <input 
                ref={inputRef} // Attach the ref to the input
                placeholder={placeholder} // Use the dynamic placeholder
                style={{
                    fontSize: '2em',
                    fontWeight: 'bold',
                    width: '600px',
                    border: 'none',
                    position: 'absolute',
                    top: '120px', // Adjust to align with the curve's start
                    left: '7px', // Adjust to align with the curve's start
                    backgroundColor: 'transparent', // To blend in with the background
                    outline: 'none',
                    color: 'transparent', // Make the font color transparent
                }} 
                type="text"
                value={text}
                onChange={handleChange}
                autoComplete="off" // Disable autocomplete
                spellCheck="false" // Disable spell check
            />

            <motion.svg width="600" height="800">
                <motion.path 
                    id="curve" 
                    d={pathD} 
                    fill="transparent" 
                    stroke="transparent" 
                    animate={{
                        d: [
                            pathLeft,
                            pathRight,
                        ]
                    }}
                    transition={{
                        duration: 1,
                        ease: "easeInOut",
                        repeat: Infinity,
                        repeatType: "mirror",
                    }}
                    />
                <text fontSize='2em' fontWeight='bold' fill="currentColor">
                    <textPath href="#curve" startOffset="0%" textAnchor="left">
                        {text}
                    </textPath>
                </text>
            </motion.svg>
        </div>
    )
}

function getOscillatedPath(pathData, amplitude = 10) {
    const offset = () => Math.random() * amplitude - amplitude / 2; // Generates a small random offset
    const { curveStartX, curveStartY, controlPointX1, controlPointY1, controlPointX2, controlPointY2, curveEndX, curveEndY } = pathData;

    const newControlPointX1 = controlPointX1 + offset();
    const newControlPointX2 = controlPointX2 + offset();
    const newCurveEndY = curveEndY + offset();

    return `M10 150 L${curveStartX} ${curveStartY} C ${newControlPointX1} ${controlPointY1}, ${newControlPointX2} ${controlPointY2}, ${curveEndX} ${newCurveEndY}`;
}

export default TextInput;
