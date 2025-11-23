/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      keyframes: {
        gradientShift: {
          "0%": { backgroundPosition: "0% 0%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 0%" },
        },
        bgDrift: {
          "0%": { transform: "scale(1.08)" },
          "50%": { transform: "scale(1.14) translate3d(-18px, -12px, 0)" },
          "100%": { transform: "scale(1.08)" },
        },
        blobFloat1: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(20px,-30px,0)" },
        },
        blobFloat2: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(-25px,25px,0)" },
        },
        blobFloat3: {
          "0%,100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(15px,30px,0)" },
        },
        cardFloat: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "gradient-slow": {
          "0%": {
            backgroundPosition: "0% 50%",
          },
          "50%": {
            backgroundPosition: "100% 50%",
          },
          "100%": {
            backgroundPosition: "0% 50%",
          },
        },
        "blob-float": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px)",
          },
          "33%": {
            transform: "translateY(-30px) translateX(20px)",
          },
          "66%": {
            transform: "translateY(20px) translateX(-15px)",
          },
        },
        "image-float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        "float-slow": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)",
          },
          "33%": {
            transform: "translateY(-30px) translateX(20px) rotate(5deg)",
          },
          "66%": {
            transform: "translateY(20px) translateX(-15px) rotate(-5deg)",
          },
        },
        "float-medium": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)",
          },
          "33%": {
            transform: "translateY(-40px) translateX(-25px) rotate(-8deg)",
          },
          "66%": {
            transform: "translateY(25px) translateX(30px) rotate(8deg)",
          },
        },
        "float-fast": {
          "0%, 100%": {
            transform: "translateY(0px) translateX(0px) rotate(0deg)",
          },
          "33%": {
            transform: "translateY(-50px) translateX(35px) rotate(10deg)",
          },
          "66%": {
            transform: "translateY(30px) translateX(-40px) rotate(-10deg)",
          },
        },
        twinkle: {
          "0%, 100%": { opacity: 0.3, transform: "scale(0.8)" },
          "50%": { opacity: 1, transform: "scale(1)" },
        },
        "spin-slow": {
          "0%": {
            transform: "rotate(0deg)",
          },
          "100%": {
            transform: "rotate(360deg)",
          },
        },
        "bounce-soft": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-10px)",
          },
        },
        floatSoft: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(18px,-24px,0)" },
        },
        floatSoft2: {
          "0%, 100%": { transform: "translate3d(0,0,0)" },
          "50%": { transform: "translate3d(-22px,20px,0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: 0.4, transform: "scale(0.95)" },
          "50%": { opacity: 1, transform: "scale(1)" },
        },
        slideUpFade: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        timelineGlow: {
          "0%": { transform: "translateX(0%) scale(1)", opacity: 0.2 },
          "50%": { transform: "translateX(100%) scale(1.1)", opacity: 1 },
          "100%": { transform: "translateX(0%) scale(1)", opacity: 0.2 },
        },
        orbitSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        tiltHover: {
          "0%": { transform: "rotate3d(0, 0, 0, 0deg)" },
          "50%": { transform: "rotate3d(1, -1, 0, 4deg)" },
          "100%": { transform: "rotate3d(0, 0, 0, 0deg)" },
        },
        bubbleRise: {
          "0%": { transform: "translateY(0)", opacity: 0 },
          "30%": { opacity: 0.9 },
          "100%": { transform: "translateY(-120%)", opacity: 0 },
        },
        waveLine: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        borderShine: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        particleDrift: {
          "0%": { transform: "translate3d(0,0,0)", opacity: 0 },
          "20%": { opacity: 0.9 },
          "80%": { opacity: 0.7 },
          "100%": { transform: "translate3d(40px,-60px,0)", opacity: 0 },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        textGlow: {
          "0%, 100%": { textShadow: "0 0 20px rgba(129,230,217,0.5), 0 0 40px rgba(129,230,217,0.3)" },
          "50%": { textShadow: "0 0 30px rgba(129,230,217,0.8), 0 0 60px rgba(129,230,217,0.5), 0 0 80px rgba(129,230,217,0.3)" },
        },
        headingGlow: {
          "0%, 100%": {
            textShadow: "0 0 8px rgba(129,230,217,0.0)",
            opacity: 0.9,
          },
          "50%": {
            textShadow: "0 0 18px rgba(129,230,217,0.9)",
            opacity: 1,
          },
        },
        subtitleFade: {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        underlineSweep: {
          "0%": { transform: "scaleX(0)", opacity: 0 },
          "40%": { transform: "scaleX(1)", opacity: 1 },
          "100%": { transform: "scaleX(1)", opacity: 0.4 },
        },
        haloPulse: {
          "0%,100%": { opacity: 0.35, transform: "scale(1)" },
          "50%": { opacity: 0.7, transform: "scale(1.15)" },
        },
        constellationDrift: {
          "0%": { transform: "translate3d(-10px, 0, 0)", opacity: 0.2 },
          "50%": { transform: "translate3d(10px, -10px, 0)", opacity: 0.5 },
          "100%": { transform: "translate3d(-10px, 0, 0)", opacity: 0.2 },
        },
        symbolFloat: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        underlinePulse: {
          "0%": { transform: "scaleX(0.2)", opacity: 0.3 },
          "50%": { transform: "scaleX(1)", opacity: 1 },
          "100%": { transform: "scaleX(0.2)", opacity: 0.3 },
        },
        dustFloat: {
          "0%": { transform: "translateY(0)", opacity: 0 },
          "40%": { opacity: 0.7 },
          "100%": { transform: "translateY(-40px)", opacity: 0 },
        },
        auroraWave: {
          "0%": { transform: "translateX(-20%) skewX(-12deg)" },
          "50%": { transform: "translateX(10%) skewX(-8deg)" },
          "100%": { transform: "translateX(-20%) skewX(-12deg)" },
        },
        ringPulseSpin: {
          "0%": { transform: "scale(0.96) rotate(0deg)", opacity: 0.4 },
          "50%": { transform: "scale(1) rotate(180deg)", opacity: 0.9 },
          "100%": { transform: "scale(0.96) rotate(360deg)", opacity: 0.4 },
        },
        fogSlide: {
          "0%": { transform: "translateX(-10%)", opacity: 0.1 },
          "50%": { transform: "translateX(10%)", opacity: 0.25 },
          "100%": { transform: "translateX(-10%)", opacity: 0.1 },
        },
        bokehFloat: {
          "0%": { transform: "translateY(0) scale(0.9)", opacity: 0.2 },
          "50%": { transform: "translateY(-12px) scale(1.05)", opacity: 0.7 },
          "100%": { transform: "translateY(0) scale(0.9)", opacity: 0.2 },
        },
        cloudDriftSlow: {
          "0%": { transform: "translateX(-10%) translateY(0)" },
          "50%": { transform: "translateX(10%) translateY(-6px)" },
          "100%": { transform: "translateX(-10%) translateY(0)" },
        },
        cloudDriftFast: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(20%) translateY(4px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        sectionFadeUp: {
          "0%": { opacity: 0, transform: "translateY(24px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        sparkleFloat: {
          "0%,100%": { transform: "translateY(0)", opacity: 0.4 },
          "50%": { transform: "translateY(-12px)", opacity: 1 },
        },
        cardFloatSoft: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        barFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        pillDrift: {
          "0%,100%": { transform: "translateY(0) scale(1)" },
          "25%": { transform: "translateY(-6px) scale(1.05)" },
          "50%": { transform: "translateY(-10px) scale(1.1)" },
          "75%": { transform: "translateY(-6px) scale(1.05)" },
        },
        nodePulse: {
          "0%,100%": { transform: "scale(1)", opacity: 0.8 },
          "50%": { transform: "scale(1.3)", opacity: 1 },
        },
        cardEntrance: {
          "0%": { opacity: 0, transform: "translateY(30px) scale(0.95)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        gradientWave: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        symbolFloat: {
          "0%,100%": { transform: "translateY(0) rotate(0deg)" },
          "33%": { transform: "translateY(-8px) rotate(5deg)" },
          "66%": { transform: "translateY(-4px) rotate(-5deg)" },
        },
        timelineGlow: {
          "0%,100%": { boxShadow: "0 0 8px rgba(74,144,226,0.5)" },
          "50%": { boxShadow: "0 0 16px rgba(74,144,226,0.9), 0 0 24px rgba(74,144,226,0.6)" },
        },
        tinyCloud: {
          "0%": { transform: "translateX(-15%) translateY(0)" },
          "50%": { transform: "translateX(10%) translateY(-4px)" },
          "100%": { transform: "translateX(-15%) translateY(0)" },
        },
        cloudSlow: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(20px) translateY(-10px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
        cloudFast: {
          "0%": { transform: "translateX(0) translateY(0)" },
          "50%": { transform: "translateX(-15px) translateY(8px)" },
          "100%": { transform: "translateX(0) translateY(0)" },
        },
      },
      animation: {
        "gradient-slow": "gradientShift 25s ease-in-out infinite",
        "bg-drift": "bgDrift 28s ease-in-out infinite",
        "blob-1": "blobFloat1 18s ease-in-out infinite",
        "blob-2": "blobFloat2 22s ease-in-out infinite",
        "blob-3": "blobFloat3 26s ease-in-out infinite",
        "card-float": "cardFloat 10s ease-in-out infinite",
        "blob-float": "blob-float 20s ease-in-out infinite",
        "image-float": "image-float 4s ease-in-out infinite",
        "float-slow": "float-slow 18s ease-in-out infinite",
        "float-medium": "float-medium 15s ease-in-out infinite",
        "float-fast": "float-fast 12s ease-in-out infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
        "spin-slow": "spin-slow 40s linear infinite",
        "bounce-soft": "bounce-soft 2s ease-in-out infinite",
        "float-soft": "floatSoft 18s ease-in-out infinite",
        "float-soft2": "floatSoft2 20s ease-in-out infinite",
        "twinkle-soft": "twinkle 2.4s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2.4s ease-in-out infinite",
        "slide-up": "slideUpFade 0.8s ease-out forwards",
        "slide-up-fade": "slideUpFade 0.7s ease-out forwards",
        "timeline-glow": "timelineGlow 8s ease-in-out infinite",
        "orbit-slow": "orbitSlow 36s linear infinite",
        "tilt-hover": "tiltHover 10s ease-in-out infinite",
        "bubble-rise": "bubbleRise 6s ease-out infinite",
        "wave-line": "waveLine 6s linear infinite",
        "border-shine": "borderShine 5s linear infinite",
        "particle-drift": "particleDrift 10s ease-in-out infinite",
        "shimmer": "shimmer 3s linear infinite",
        "text-glow": "textGlow 3s ease-in-out infinite",
        "heading-glow": "headingGlow 4s ease-in-out infinite",
        "subtitle-fade": "subtitleFade 0.9s ease-out forwards",
        "underline-sweep": "underlineSweep 1.4s ease-out forwards",
        "halo-pulse": "haloPulse 6s ease-in-out infinite",
        constellation: "constellationDrift 12s ease-in-out infinite",
        "symbol-float": "symbolFloat 5s ease-in-out infinite",
        "underline-pulse": "underlinePulse 3s ease-in-out infinite",
        "dust-float": "dustFloat 6s ease-out infinite",
        aurora: "auroraWave 16s ease-in-out infinite",
        "ring-spin": "ringPulseSpin 14s ease-in-out infinite",
        "fog-soft": "fogSlide 18s ease-in-out infinite",
        "bokeh-soft": "bokehFloat 6s ease-in-out infinite",
        "cloud-slow": "cloudDriftSlow 40s ease-in-out infinite",
        "cloud-fast": "cloudDriftFast 28s ease-in-out infinite",
        "section-fade-up": "sectionFadeUp 0.9s ease-out forwards",
        "sparkle-float": "sparkleFloat 3s ease-in-out infinite",
        "card-float-soft": "cardFloatSoft 10s ease-in-out infinite",
        "bar-flow": "barFlow 5s linear infinite",
        "pill-drift": "pillDrift 4s ease-in-out infinite",
        "node-pulse": "nodePulse 2s ease-in-out infinite",
        "card-entrance": "cardEntrance 0.8s ease-out forwards",
        "gradient-wave": "gradientWave 8s ease-in-out infinite",
        "symbol-float": "symbolFloat 6s ease-in-out infinite",
        "timeline-glow": "timelineGlow 3s ease-in-out infinite",
        "tiny-cloud": "tinyCloud 18s ease-in-out infinite",
        "cloud-slow": "cloudSlow 20s ease-in-out infinite",
        "cloud-fast": "cloudFast 15s ease-in-out infinite",
        },
      backgroundSize: {
        "300%": "300%",
        "400%": "400%",
      },
    },
  },
  plugins: [],
};

