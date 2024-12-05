import { useState, useEffect } from "react";
import { useMediaQuery } from "react-responsive";

export const useResponsive = () => {
    const isMobile = useMediaQuery({ maxWidth: 767 });
    const isTablet = useMediaQuery({ minWidth: 768, maxWidth: 1023 });
    const isDesktop = useMediaQuery({ minWidth: 1024 });

    return { isMobile, isTablet, isDesktop };
};

export const useOrientation = () => {
    const [orientation, setOrientation] = useState(window.innerWidth < window.innerHeight ? 'portrait' : 'landscape');

    useEffect(() => {
        const handleResize = () => {
            setOrientation(window.innerWidth < window.innerHeight ? 'portrait' : 'landscape');
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return { orientation };
};