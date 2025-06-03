import React, { useEffect, useRef } from "react";
import { Particle } from "./particles";
import { debounce, hexToRgb, isValidBlendingMode } from "./gradientUtils";
const GradientBackground = ({ count = 12, size = { min: 1000, max: 1200, pulse: 0.1 }, speed = {
    x: { min: 0.6, max: 3 },
    y: { min: 0.6, max: 3 }
}, colors = {
    background: "transparent",
    particles: ["#ff681c", "#87ddfe", "#231efe"],
}, blending = "overlay", opacity = { center: 0.45, edge: 0 }, skew = -1.5, shapes: initialShapes = ["c"], className = "", translateYcorrection = true, style = {}, onLoaded, }) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const configRef = useRef({
        count,
        size,
        speed,
        colors,
        blending,
        opacity,
        skew,
        shapes: initialShapes,
        c: { w: 0, h: 0 },
    });
    // Utility to detect mobile devices
    const isMobile = () => {
        if (typeof window === "undefined")
            return false;
        return /Mobi|Android/i.test(window.navigator.userAgent);
    };
    // Compute styles before render
    const computedStyles = React.useMemo(() => {
        const defaultWidth = 1920;
        const canvasWidth = configRef.current.c.w ||
            (typeof window !== "undefined" ? window.innerWidth : defaultWidth);
        const translateY = translateYcorrection
            ? `translateY(-${Math.ceil(Math.tan((Math.abs(skew) * Math.PI) / 180) * (canvasWidth / 2))}px)`
            : "";
        const skewValue = `skewY(${skew}deg) ${translateY}`;
        return Object.assign({ transform: skewValue, WebkitTransform: skewValue, position: "absolute", top: "0", left: "0", width: "100%", height: "100%", zIndex: -1, pointerEvents: "none", backgroundColor: colors.background }, style);
    }, [skew, translateYcorrection, colors.background, style]);
    const initParticles = () => {
        const { count, colors, shapes, opacity } = configRef.current;
        particlesRef.current = [];
        for (let i = 0; i < count; i++) {
            const color = hexToRgb(colors.particles[i % colors.particles.length]);
            const shape = shapes[i % shapes.length];
            particlesRef.current.push(new Particle(color, shape, configRef.current, opacity));
        }
    };
    const animate = (ctx, canvasWidth, canvasHeight) => {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        particlesRef.current.forEach((particle) => {
            particle.update(canvasWidth, canvasHeight);
            particle.draw(ctx, configRef.current.blending);
        });
        animationRef.current = window.requestAnimationFrame(() => animate(ctx, canvasWidth, canvasHeight));
    };
    const adjustCanvasSize = (canvas, ctx) => {
        const parent = canvas.parentElement;
        if (!parent)
            return;
        const dpr = window.devicePixelRatio || 1;
        configRef.current.c.w = parent.clientWidth;
        configRef.current.c.h = parent.clientHeight;
        canvas.width = configRef.current.c.w * dpr;
        canvas.height = configRef.current.c.h * dpr;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
    };
    const handleResize = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext("2d");
            if (!ctx)
                return;
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
            }
            adjustCanvasSize(canvas, ctx);
            initParticles();
            const { c } = configRef.current;
            animate(ctx, c.w, c.h);
        }
    };
    useEffect(() => {
        // Adjust particle count and speed for mobile devices
        if (isMobile()) {
            configRef.current.count = Math.floor(count / 2);
            configRef.current.speed = {
                x: { min: speed.x.min * 0.5, max: speed.x.max * 0.5 },
                y: { min: speed.y.min * 0.5, max: speed.y.max * 0.5 },
            };
        }
        else {
            configRef.current.count = count;
            configRef.current.speed = speed;
        }
        configRef.current = Object.assign(Object.assign({}, configRef.current), { size,
            colors,
            blending,
            opacity,
            skew, shapes: initialShapes });
        const canvas = canvasRef.current;
        if (!canvas)
            return;
        const ctx = canvas.getContext("2d");
        if (!ctx)
            return;
        adjustCanvasSize(canvas, ctx);
        ctx.globalCompositeOperation = isValidBlendingMode(blending)
            ? blending
            : "source-over";
        initParticles();
        animate(ctx, configRef.current.c.w, configRef.current.c.h);
        const debouncedHandleResize = debounce(handleResize, 200);
        window.addEventListener("resize", debouncedHandleResize);
        const handleVisibilityChange = () => {
            if (!document.hidden) {
                handleResize();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        if (onLoaded) {
            onLoaded();
        }
        return () => {
            window.removeEventListener("resize", debouncedHandleResize);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (animationRef.current) {
                window.cancelAnimationFrame(animationRef.current);
            }
        };
    }, [
        count,
        size,
        speed,
        colors,
        blending,
        opacity,
        skew,
        initialShapes,
        translateYcorrection,
        onLoaded,
    ]);
    return (React.createElement("canvas", { ref: canvasRef, className: className, style: computedStyles }));
};
export { GradientBackground };
