import Matter from 'matter-js';
import React, { useEffect, useRef } from 'react';


// TODO: 
// figure out the right constraints to make it bendy/springboardy rather than just droopy
// also make a board that just bends under weight where each character adds weight, flying in from top.


function AppendDrooop({ }) {
    const containerRef = useRef(null);
    const textCanvasRef = useRef(null);
    const textRef = useRef('');
    const charDict = useRef([]);

    useEffect(() => {
        // Initialize Matter.js
        const engine = Matter.Engine.create();
        const world = engine.world;
        const runner = Matter.Runner.create();

        const render = Matter.Render.create({
            element: containerRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'lightgray'
            }
        });

        // Create the text canvas and append it to the container
        const textCanvas = document.createElement('canvas');
        textCanvas.width = window.innerWidth;
        textCanvas.height = window.innerHeight;
        textCanvas.style.position = 'absolute';
        textCanvas.style.top = '0';
        textCanvas.style.left = '0';
        containerRef.current.appendChild(textCanvas);
        textCanvasRef.current = textCanvas;

        const context = textCanvas.getContext('2d');
        context.font = '20px Arial';
        context.fillStyle = 'black';

        engine.gravity.y = 0.8;

        let currentX = 100; // Starting X position
        const segmentLength = 20;

        const renderText = () => {
            // Clear the text canvas before rendering new text
            context.clearRect(0, 0, textCanvas.width, textCanvas.height);

            // Render each character on the text canvas
            charDict.current.forEach((charObj) => {
                const { charBox, key } = charObj;
                const xPosition = charBox.position.x - 5;
                const yPosition = charBox.position.y + 5;

                context.fillText(key, xPosition, yPosition);
            });
        };

        const handleKeyDown = (event) => {
            const key = event.key;

            if (['Meta', 'Shift', 'Control', 'Alt'].includes(key)) {
                return;
            }

            console.log(`Key pressed: ${key}`);

            if (key === 'Backspace') {
                if (charDict.current.length > 0) {
                    const lastBox = charDict.current.pop();
                    Matter.World.remove(engine.world, lastBox.charBox);
                    currentX -= (lastBox.charWidth + segmentLength);
                    textRef.current = textRef.current.slice(0, -1);
                }
            } else {
                const charWidth = context.measureText(key).width;

                // Determine the y-position: y=100 for first 8 chars, then use the y of the last box
                    const yPosition = charDict.current.length < 8 
                        ? 100 
                        : charDict.current[charDict.current.length - 1].charBox.position.y;
                    
                    const xPosition = charDict.current.length < 8 
                        ? currentX 
                        : charDict.current[charDict.current.length - 1].charBox.position.x + charWidth + segmentLength;

                    const newCharBox = Matter.Bodies.rectangle(xPosition, yPosition, charWidth, 20, {
                    frictionAir: 0.05,
                    mass: 1,
                    isStatic: charDict.current.length < 8 ? true : false,
                    render: {
                        fillStyle: 'none'
                    }
                });

                currentX += charWidth + segmentLength;
                Matter.World.add(engine.world, newCharBox);

                if (charDict.current.length > 0) {
                    for (let i = 1; i <= 2; i++) {
                        if (charDict.current.length - i >= 0) {
                            const constraint = Matter.Constraint.create({
                                bodyA: newCharBox,
                                bodyB: charDict.current[charDict.current.length - i].charBox,
                                length: segmentLength * i,
                                stiffness: .01,
                                damping: 0.1,
                                render: {
                                    visible: false
                                }
                            });
                            Matter.World.add(engine.world, constraint);
                        }
                    }
                }

                charDict.current.push({ charBox: newCharBox, charWidth, key });
                textRef.current += key;
            }
            renderText();
        };

        window.addEventListener('keydown', handleKeyDown);

        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.05,
                render: {
                    visible: false
                }
            }
        });

        Matter.World.add(world, mouseConstraint);
        render.mouse = mouse;

        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);

        Matter.Events.on(engine, 'afterUpdate', () => {
            renderText(); // Ensure text is rendered after the Matter.js update
        });

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            Matter.Render.stop(render);
            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            textCanvas.remove();
            render.textures = {};
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'relative' }} />
    );
}

export default AppendDrooop;
