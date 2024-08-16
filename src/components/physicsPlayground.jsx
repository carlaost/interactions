import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

function PhysicsPlayground() {
    const containerRef = useRef(null); // Create a ref for the container

    useEffect(() => {
        // Step 1: Create an engine
        const engine = Matter.Engine.create();
        const runner = Matter.Runner.create(); // Create a runner

        // Step 2: Create a world
        const world = engine.world;

        // Step 3: Create a renderer
        const render = Matter.Render.create({
            element: containerRef.current, // Render to the container ref
            engine: engine, // Attach the engine to the renderer
            options: {
                width: 800, // Width of the rendering area
                height: 600, // Height of the rendering area
                wireframes: false, // Use wireframes to keep it simple for now
                showCollisions: true, // Show collision points
                showVelocity: true, // Show velocity vectors
                background: '#f0f0f0' // Light background for better visibility
            }
        });

        // Step 4: Create a simple box
        const box = Matter.Bodies.rectangle(400, 50, 80, 80);
        const ground = Matter.Bodies.rectangle(400, 580, 810, 60, { isStatic: true }); // Static ground
        const circle = Matter.Bodies.circle(200, 50, 40, { render: { fillStyle: 'blue' } }); // A circle with a radius of 40 and blue color
        const polygon = Matter.Bodies.polygon(600, 50, 3, 50); // A triangle with a radius of 50


        // Step 5: Add the box to the world
        Matter.World.add(engine.world, [box, ground, circle, polygon]);
        // Applying a force to the box after creation
        // Creating a constraint (like a rod) between the box and the circle
        const constraint = Matter.Constraint.create({
            bodyA: box,
            bodyB: circle,
            length: 200, // Length of the constraint
            stiffness: 0.0000001, // How stiff the constraint is (0 = elastic, 1 = rigid)
            damping: 0.05, // Some damping to reduce oscillations

        });

        // Add the constraint to the world
        Matter.World.add(engine.world, constraint);


        Matter.Body.applyForce(box, { x: 0, y: 0 }, { x: 0.1, y: -0.1 }); // Apply a rightward force
        Matter.Body.applyForce(circle, { x: 0, y: 0 }, { x: -0.05, y: 0 }); 
        Matter.Body.applyForce(polygon, { x: 0, y: 0 }, { x: -0.05, y: -0.05 }); 

        // Handle click event to add new box
        const handleClick = (event) => {
            const rect = containerRef.current.getBoundingClientRect();
            const mouseX = event.clientX - rect.left;
            const mouseY = event.clientY - rect.top;

            const newBox = Matter.Bodies.rectangle(mouseX, mouseY, 80, 80);
            Matter.World.add(engine.world, newBox);
        };

        // Collision event listener
        Matter.Events.on(engine, 'collisionStart', (event) => {
            const pairs = event.pairs;

            pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                console.log('Collision detected between:', bodyA, bodyB);
                // You can add more logic here, such as changing body properties
            });
        });


        // Attach the click event listener to the container
        containerRef.current.addEventListener('click', handleClick);

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

        // Step 6: Run the engine using the Runner
        Matter.Runner.run(runner, engine); // This is the correct way to run the engine with a runner

        // Step 7: Run the renderer
        Matter.Render.run(render);

        // Cleanup on unmount
        return () => {
            containerRef.current.removeEventListener('click', handleClick);
            Matter.Render.stop(render);
            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    }, []);

    return <div ref={containerRef} />; // Attach the ref to the div
}

export default PhysicsPlayground;
