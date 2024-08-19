import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

function useAddChar(containerRef, engine, world, canvasContext, isInitialized) {
    const characters = useRef([]); // Array to store characters and their boxes

    useEffect(() => {
        if (!isInitialized || !canvasContext || !engine || !world) return;

        const handleKeyDown = (event) => {
            if (['Meta', 'Shift', 'Control', 'Alt', 'CapsLock', 'Tab'].includes(event.key)) {
                return;
            }

            console.log(`Key pressed: ${event.key}`);

            // Measure the width of the character using the provided canvas context
            const charWidth = canvasContext.measureText(event.key).width;
            console.log(`Width: ${charWidth}`);

            const xPos = window.innerWidth / 2;
            const yPos = 50;
        
            const charBox = Matter.Bodies.rectangle(xPos, yPos, charWidth, 16, {
                render: {
                    fillStyle: 'transparent', // No fill color
                    strokeStyle: 'black', // Outline color
                    lineWidth: 1, // Outline width
                }
            });

            Matter.World.add(world, charBox); // Add the character box to the world

            // Add the character and its box to the array
            characters.current.push({ char: event.key, charBox, charWidth });

            // Draw the text at the initial position
            canvasContext.fillText(event.key, (xPos - (charWidth / 2)), (yPos + (16 / 2)));
        };

        window.addEventListener('keydown', handleKeyDown);

        // Update the text position after every physics update
        Matter.Events.on(engine, 'afterUpdate', () => {
            // Clear the canvas before re-drawing
            canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Re-draw each character at its updated position
            characters.current.forEach(({ char, charBox, charWidth }) => {
                const { x, y } = charBox.position;
                const angle = charBox.angle;

                // Save the canvas state before applying transformations
                canvasContext.save();

                // Translate to the position of the charBox
                canvasContext.translate(x, y);

                // Rotate the canvas context by the box's angle
                canvasContext.rotate(angle);

                // Draw the text, adjusting position so it's centered on the box
                canvasContext.fillText(char, -charWidth / 2, 16 / 2);

                // Restore the canvas state to undo the transformations
                canvasContext.restore();
            });
        });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            Matter.Events.off(engine, 'afterUpdate'); // Remove the event listener
        };
    }, [isInitialized, canvasContext, engine, world]);

}

export default useAddChar;
