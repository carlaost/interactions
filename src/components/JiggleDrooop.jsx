import Matter from 'matter-js';
import React, { useEffect, useRef } from 'react';

function JiggleDrooop({text}) {
    const containerRef = useRef(null); // Create a ref for the container
    const charactersRef = useRef([]);

    useEffect(() => {
        const engine = Matter.Engine.create();
        const world = engine.world;
        const runner = Matter.Runner.create();
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '20px Arial'; // Set font size and style


        engine.gravity.y = .8;

        const lineSegments = [];
        const segmentLength = 10;


        let currentX = 100; // Starting X position

        const charBodies = text.split('').map((char, index) => {
            const charWidth = context.measureText(char).width;

            // Create a rectangle body for each character
            const body = Matter.Bodies.rectangle(currentX, 100, charWidth, 20, {
                frictionAir: 0.05,
                mass: 1,
                isStatic: index < 8, // Fix the first few characters in space
                render: {
                    fillStyle: 'none' // We don't need Matter.js to render the body
                }
            });

            // Update position for the next character
            currentX += charWidth + segmentLength;

            return body;
        });

        // Replace the old lineSegments array
        Matter.World.add(world, charBodies);

        const constraints = []

        for (let i = 1; i < charBodies.length; i++) {
            // Link to the previous 1 to 3 bodies, if they exist
            for (let j = 1; j <= 10; j++) {
                if (i - j >= 0) { // Ensure there's a body to link to
                    const constraint = Matter.Constraint.create({
                        bodyA: charBodies[i],
                        bodyB: charBodies[i - j],
                        length: segmentLength * (j*2), // Increase the length based on the distance
                        stiffness: .5,
                        damping: .01,
                        render: {
                            visible: false
                        }
                    });
                    constraints.push(constraint);
                }
            }
        }
             

        // Add segments and constraints to the world
        Matter.World.add(world, [...lineSegments, ...constraints]);

        // Create a renderer
        const render = Matter.Render.create({
            element: containerRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'none'
            }
        });

        // Step 1: Create the mouse control
        const mouse = Matter.Mouse.create(render.canvas);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: .05, // Stiffness of the constraint (mouse movement)
                render: {
                    visible: false
                }
            }
        });

        // Step 2: Add the mouse control to the world
        Matter.World.add(world, mouseConstraint);

        // Step 3: Keep the mouse in sync with the renderer
        render.mouse = mouse;

        // Step 4: Add event listener for mouse leave
        const handleMouseLeave = () => {
            console.log("Mouse has left the render area"); // Add this line
            mouseConstraint.constraint.bodyB = null; // Release the dragged object
        };

        render.canvas.addEventListener('mouseleave', handleMouseLeave);

        Matter.Events.on(engine, 'afterUpdate', () => {
            charBodies.forEach((body, index) => {
                const element = charactersRef.current[index];
                
                if (element) {
                    const { x, y } = body.position;
                    let angle;
        
                    if (index < charBodies.length - 1) {
                        // Calculate angle to the next body
                        const nextBody = charBodies[index + 1];
                        angle = Math.atan2(nextBody.position.y - y, nextBody.position.x - x);
                    } else if (index > 0) {
                        // For the last body, calculate angle to the previous body
                        const prevBody = charBodies[index - 1];
                        angle = Math.atan2(y - prevBody.position.y, x - prevBody.position.x);
                    } else {
                        // If there's only one body, keep it horizontal
                        angle = 0;
                    }
        
                    const charWidth = body.bounds.max.x - body.bounds.min.x;
                    const charHeight = body.bounds.max.y - body.bounds.min.y;
        
                    // Apply the calculated angle to the rotation
                    element.style.transform = `translate(${x - charWidth / 2}px, ${y - charHeight / 2}px) rotate(${angle}rad)`;
                }
            });
        });
        
        


        Matter.Runner.run(runner, engine);
        Matter.Render.run(render);

        return () => {
            Matter.Render.stop(render);
            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    }, [text]);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {text.split('').map((char, index) => (
                <div
                    key={index}
                    ref={el => charactersRef.current[index] = el}
                    style={{
                        position: 'absolute',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        color: '#000',
                        pointerEvents: 'none',
                    }}
                >
                    {char}
                </div>
            ))}
        </div>
    );
}

export default JiggleDrooop;
