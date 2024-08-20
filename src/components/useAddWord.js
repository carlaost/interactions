import { useEffect, useRef } from 'react';
import Matter from 'matter-js';

function useAddWord(containerRef, engine, world, canvasContext, isInitialized) {
    const characters = useRef([]); // Array to store words and their boxes
    const wordBuffer = useRef(''); // Buffer to accumulate characters for a word
    const xOffset = useRef(100); // Tracks the x position for the next word
    const previewCanvasRef = useRef(null); // Reference to the dynamically created preview canvas
    const previewCanvasContext = useRef(null); // Context for the preview canvas

    useEffect(() => {
        if (!isInitialized || !canvasContext || !engine || !world || !containerRef.current) return;

        // Create the preview canvas and append it to the container
        const previewCanvas = document.createElement('canvas');
        previewCanvas.width = window.innerWidth;
        previewCanvas.height = window.innerHeight;
        previewCanvas.style.position = 'absolute';
        previewCanvas.style.top = '0';
        previewCanvas.style.left = '0';
        containerRef.current.appendChild(previewCanvas);

        previewCanvasRef.current = previewCanvas;
        previewCanvasContext.current = previewCanvas.getContext('2d');

        const handleKeyDown = (event) => {
            if (['Meta', 'Shift', 'Control', 'Alt', 'CapsLock', 'Tab'].includes(event.key)) {
                return;
            }

            if (event.key === 'Backspace') {
                handleBackspace();
            } else if (event.key === ' ') {
                const word = wordBuffer.current.trim();
                if (word.length > 0) {
                    addWordToCanvas(word);
                    wordBuffer.current = '';
                    clearPreviewCanvas(); // Clear the preview when the word is added
                }
            } else {
                wordBuffer.current += event.key;
                renderPreviewText(wordBuffer.current);
            }
        };

        const handleBackspace = () => {
            if (wordBuffer.current.length > 0) {
                // Remove the last character from the buffer
                wordBuffer.current = wordBuffer.current.slice(0, -1);
                // Re-render the preview text
                renderPreviewText(wordBuffer.current);
            }
        };

        const renderPreviewText = (text) => {
            const context = previewCanvasContext.current;
            context.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear the preview canvas

            const textWidth = context.measureText(text).width;
            const xPos = xOffset.current + textWidth / 2;
            const yPos = 50; // Fixed y position for simplicity

            context.font = "16px Arial";
            context.fillStyle = "black";
            context.fillText(text, xPos - textWidth / 2, yPos + 16 / 2);
        };

        const clearPreviewCanvas = () => {
            const context = previewCanvasContext.current;
            context.clearRect(0, 0, previewCanvas.width, previewCanvas.height); // Clear the preview canvas
        };

        const addWordToCanvas = (word) => {
            console.log(`Word to add: ${word}`);

            const wordWidth = canvasContext.measureText(word).width;
            const xPos = xOffset.current + wordWidth / 2;
            const yPos = 50; // Fixed y position for simplicity

            const wordBox = Matter.Bodies.rectangle(xPos, yPos, wordWidth, 16, {
                render: {
                    fillStyle: 'transparent', 
                    strokeStyle: 'black', 
                    lineWidth: 1, 
                }
            });

            Matter.World.add(world, wordBox);

            characters.current.push({ word, wordBox, wordWidth });

            xOffset.current += wordWidth + 10; // Add a small space between words
        };

        Matter.Events.on(engine, 'afterUpdate', () => {
            // Clear the main canvas before re-drawing
            canvasContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

            // Re-draw each word at its updated position
            characters.current.forEach(({ word, wordBox, wordWidth }) => {
                const { x, y } = wordBox.position;
                const angle = wordBox.angle;

                // Save the canvas state before applying transformations
                canvasContext.save();

                // Translate to the position of the wordBox
                canvasContext.translate(x, y);

                // Rotate the canvas context by the box's angle
                canvasContext.rotate(angle);

                // Draw the word, adjusting position so it's centered on the box
                canvasContext.fillText(word, -wordWidth / 2, 16 / 2);

                // Restore the canvas state to undo the transformations
                canvasContext.restore();
            });
        });

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            Matter.Events.off(engine, 'afterUpdate');

            // Clean up the preview canvas when the component unmounts
            if (previewCanvasRef.current) {
                previewCanvasRef.current.remove();
            }
        };
    }, [isInitialized, canvasContext, previewCanvasContext, engine, world, containerRef]);

}


export default useAddWord;
