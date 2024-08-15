import Matter from 'matter-js';
import React, { useEffect } from 'react';

function JustBodies() {
    useEffect(() => {
        const engine = Matter.Engine.create();
        const world = engine.world;
        const runner = Matter.Runner.create(); 

        const lineSegments = [];
        const segmentCount = 10;
        const segmentLength = 20;

        // Create the segments
        for (let i = 0; i < segmentCount; i++) {
            const segment = Matter.Bodies.circle(100 + i * segmentLength, 100, 5, {
                frictionAir: 0.02,
                mass: 0.1,
                render: {
                    fillStyle: 'blue',
                    strokeStyle: 'black',
                    lineWidth: 1
                }
            });
            lineSegments.push(segment);
        }

        // Create the constraints
        const constraints = [];
        for (let i = 1; i < lineSegments.length; i++) {
            const constraint = Matter.Constraint.create({
                bodyA: lineSegments[i - 1],
                bodyB: lineSegments[i],
                length: segmentLength,
                stiffness: 0.9,
                damping: 0.1
            });
            constraints.push(constraint);
        }

        // Add segments and constraints to the world
        Matter.World.add(world, [...lineSegments, ...constraints]);

        // Create a renderer
        const render = Matter.Render.create({
            element: document.body,
            engine: engine,
            options: {
                width: 800,
                height: 600,
                wireframes: false
            }
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
    }, []);

    return null;
}

export default JustBodies;
