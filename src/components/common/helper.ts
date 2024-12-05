export const adjustColumnsPerRow = (columnsPerRow: number, isDesktop: boolean, isTablet: boolean, isMobile: boolean) => {
    if (columnsPerRow === 6) {
        if (isDesktop) {
            return 4;
        } else if (isTablet) {
            return 2;
        } else if (isMobile) {
            return 1;
        }
    }
    else if (columnsPerRow === 2) {
        if (isDesktop) {
            return 2;
        } else if (isTablet) {
            return 1;
        } else if (isMobile) {
            return 1;
        }
    }
    else {
        if (isDesktop) {
            return 2;
        } else if (isTablet) {
            return 1;
        } else if (isMobile) {
            return 1;
        }
    }
    return columnsPerRow;
};
