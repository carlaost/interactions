import { useEffect } from 'react';
import Matter from 'matter-js';

function useMouseInteraction(engine, world, containerRef, isInitialized) {
    useEffect(() => {
        if (!isInitialized || !engine || !world || !containerRef.current) return;

        // Step 1: Create the mouse control using the containerRef instead of render.canvas
        const mouse = Matter.Mouse.create(containerRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2, // Increase stiffness for better control
                render: {
                    visible: true, // Set to true temporarily to debug visibility
                },
            },
        });

        // Step 2: Add the mouse control to the world
        Matter.World.add(world, mouseConstraint);

        // Ensure that the mouse constraint interacts with all bodies
        mouseConstraint.collisionFilter.mask = 0xFFFFFFFF;

        // Step 4: Add event listener for mouse down
        Matter.Events.on(mouseConstraint, 'mousedown', function(event) {
            console.log('Mouse down:', event);
            console.log('Target body:', mouseConstraint.body);
        });

        // Log the setup for debugging
        console.log('Mouse constraint setup:', mouseConstraint);

        return () => {
            // Cleanup mouse interaction on unmount
            Matter.World.remove(world, mouseConstraint);
        };
    }, [isInitialized, engine, world, containerRef]);
}

export default useMouseInteraction;
