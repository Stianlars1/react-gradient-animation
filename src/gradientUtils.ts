// List of valid global composite operations
import {RGB} from "./types";

const validBlendingModes: GlobalCompositeOperation[] = [
    "source-over",
    "source-in",
    "source-out",
    "source-atop",
    "destination-over",
    "destination-in",
    "destination-out",
    "destination-atop",
    "lighter",
    "copy",
    "xor",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
];

export const isValidBlendingMode = (
    mode: string
): mode is GlobalCompositeOperation => {
    return validBlendingModes.includes(mode as GlobalCompositeOperation);
};

export const debounce = (func: (...args: any[]) => void, wait: number) => {
    let timeout: number;
    return (...args: any[]) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

export const hexToRgb = (hex: string): RGB => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
        return {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        };
    } else {
        throw new Error("Invalid hex color format");
    }
};

export const getRandom = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const getRandomDirection = (): number => (Math.random() > 0.5 ? 1 : -1);
