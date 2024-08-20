import React, { useRef, useEffect, useState } from 'react';
import Matter from 'matter-js';
import useAddChar from './useAddChar';
import useAddWord from './useAddWord';
import useDrag from './useDrag';
import useMousePosition from './useMousePosition';


function CreateWorld() {
    const containerRef = useRef(null);
    const engineRef = useRef(null);
    const worldRef = useRef(null);
    const canvasContextRef = useRef(null);
    const renderRef = useRef(null);

    const [isInitialized, setIsInitialized] = useState(false); // Track initialization
    
    const mousePositionRef = useMousePosition(isInitialized);

    useEffect(() => {
        // Create the Matter.js engine and world
        const engine = Matter.Engine.create();
        const world = engine.world;
        engineRef.current = engine;
        worldRef.current = world;

        // Create the canvas and context for text rendering
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.style.position = 'absolute'; // Position it absolutely
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.zIndex = '1'; // Ensure it's behind the physics canvas
        containerRef.current.appendChild(canvas); // Attach it to the DOM

        const context = canvas.getContext('2d');
        context.font = "16px Arial"; // Set the font size and family
        context.fillStyle = "black"; // Set the text color
        canvasContextRef.current = context; // Store the context in the ref

        // Setup the Matter.js render
        const render = Matter.Render.create({
            element: containerRef.current,
            engine: engine,
            options: {
                width: window.innerWidth,
                height: window.innerHeight,
                wireframes: false,
                background: 'none', // Transparent background
            }
        });

        renderRef.current = render;


        engine.gravity.y = 0.1;

        const ground = Matter.Bodies.rectangle((window.innerWidth / 2), window.innerHeight, window.innerWidth, 60, { isStatic: true });

        Matter.World.add(world, [ground]);
        Matter.Render.run(render);

        const runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);

        // Set initialization to complete
        setIsInitialized(true);

        // Cleanup function
        return () => {
            Matter.Render.stop(render);
            Matter.World.clear(world);
            Matter.Engine.clear(engine);
            render.canvas.remove();
            canvas.remove(); // Also remove the text canvas on cleanup
            render.textures = {};
        };
    }, []);


    // useAddChar(containerRef, engineRef.current, worldRef.current, canvasContextRef.current, isInitialized);
    useAddWord(containerRef, engineRef.current, worldRef.current, canvasContextRef.current, isInitialized, mousePositionRef);
    useDrag(engineRef.current, worldRef.current, containerRef, isInitialized);


    return <div ref={containerRef} style={{ position: 'relative' }}></div>;
}

export default CreateWorld;
