import { useEffect, useRef } from 'react';

function useMousePosition(isInitialized) {
    const mousePositionRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        // if (!isInitialized) return;

        const handleMouseMove = (event) => {
            mousePositionRef.current = {
                x: event.clientX,
                y: event.clientY,
            };
        };

        window.addEventListener('mousemove', handleMouseMove);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isInitialized]);

    return mousePositionRef;
}

export default useMousePosition;
