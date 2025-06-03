import { getRandom, getRandomDirection, isValidBlendingMode, } from "./gradientUtils";
export class Particle {
    constructor(color, shape, options, opacity) {
        this.color = color;
        this.shape = shape;
        this.options = options;
        this.rgba = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity.center})`;
        this.rgbaEdge = `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${opacity.edge})`;
        this.size = Math.abs(getRandom(options.size.min, options.size.max));
        this.direction = getRandomDirection();
        this.vx =
            getRandom(options.speed.x.min, options.speed.x.max) * this.direction;
        this.vy =
            getRandom(options.speed.y.min, options.speed.y.max) * this.direction;
        this.x = getRandom(0, options.c.w);
        this.y = getRandom(0, options.c.h);
        this.pulseDirection = 1;
    }
    update(canvasWidth, canvasHeight) {
        if (this.options.size.pulse !== 0) {
            this.size += this.options.size.pulse * this.pulseDirection;
            if (this.size > this.options.size.max ||
                this.size < this.options.size.min) {
                this.pulseDirection *= -1;
            }
        }
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvasWidth) {
            this.vx *= -1;
            this.x = Math.max(0, Math.min(this.x, canvasWidth));
        }
        if (this.y < 0 || this.y > canvasHeight) {
            this.vy *= -1;
            this.y = Math.max(0, Math.min(this.y, canvasHeight));
        }
    }
    draw(ctx, blending) {
        ctx.beginPath();
        const validBlending = isValidBlendingMode(blending)
            ? blending
            : "source-over";
        if (validBlending !== "source-over") {
            ctx.globalCompositeOperation = validBlending;
        }
        const gradient = ctx.createRadialGradient(this.x, this.y, 0.01, this.x, this.y, this.size / 2);
        gradient.addColorStop(0, this.rgba);
        gradient.addColorStop(1, this.rgbaEdge);
        ctx.fillStyle = gradient;
        switch (this.shape) {
            case "c":
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2, false);
                break;
            case "s":
                ctx.rect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size);
                break;
            case "t":
                const height = (Math.sqrt(3) / 2) * this.size;
                ctx.moveTo(this.x, this.y - (2 / 3) * height);
                ctx.lineTo(this.x - this.size / 2, this.y + height / 3);
                ctx.lineTo(this.x + this.size / 2, this.y + height / 3);
                break;
            default:
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2, false);
        }
        ctx.closePath();
        ctx.fill();
        ctx.globalCompositeOperation = "source-over";
    }
}
