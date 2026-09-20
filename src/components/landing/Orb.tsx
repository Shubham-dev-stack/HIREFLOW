import React, { useEffect, useRef, useState } from 'react';
import { Renderer, Program, Mesh, Triangle } from 'ogl';
import './Orb.css';

interface OrbProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  backgroundColor?: string;
  className?: string;
}

const vert = `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const frag = `
  precision highp float;
  uniform float iTime;
  uniform vec2 iResolution;
  uniform float uHue;
  uniform float uHoverIntensity;
  uniform float uHover;
  uniform vec3 uBgColor;
  varying vec2 vUv;

  vec3 rgb2hsv(vec3 c) {
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
    vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
  }

  vec3 hsv2rgb(vec3 c) {
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
  }

  // Simplex-inspired 3D noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
                i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
              + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
              + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z.xxxx);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vec2 st = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.x, iResolution.y);
    float d = length(st);

    // Dynamic rotation and turbulence
    float t = iTime * 0.35 + uHover * uHoverIntensity * 1.5;
    vec3 p = vec3(st * 1.8, t);
    float n1 = snoise(p);
    float n2 = snoise(p * 2.0 + vec3(n1 * 0.8));

    // Orb sphere shape with glowing halo
    float radius = 0.72;
    float edge = smoothstep(radius + 0.35, radius - 0.15, d + n2 * 0.15);
    float innerGlow = smoothstep(radius, 0.0, d) * 0.8;
    float rim = smoothstep(radius - 0.2, radius + 0.1, d) * smoothstep(radius + 0.4, radius, d);

    // Emerald-based hue calculation
    float targetHue = uHue / 360.0;
    vec3 primaryColor = hsv2rgb(vec3(targetHue + n1 * 0.05, 0.85, 0.95));
    vec3 secondaryColor = hsv2rgb(vec3(targetHue + 0.15 + n2 * 0.08, 0.65, 0.65));
    vec3 coreColor = hsv2rgb(vec3(targetHue - 0.08, 0.95, 1.0));

    vec3 finalColor = mix(primaryColor, secondaryColor, n1 * 0.5 + 0.5);
    finalColor = mix(finalColor, coreColor, innerGlow * 0.6);
    finalColor += rim * primaryColor * 1.2;

    float alpha = edge * (0.85 + uHover * 0.15);
    vec3 blended = mix(uBgColor, finalColor, alpha);

    gl_FragColor = vec4(blended, alpha);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  return [r || 0.03, g || 0.04, b || 0.05];
}

export const Orb: React.FC<OrbProps> = ({
  hue = 150,
  hoverIntensity = 0.45,
  rotateOnHover = true,
  backgroundColor = '#07090C',
  className = ''
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(0);
  const targetHoverRef = useRef(0);

  const [isLowPowerOrMobile, setIsLowPowerOrMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const isMobileWidth = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = navigator.maxTouchPoints > 1 && window.innerWidth < 1024;
    return isMobileWidth || Boolean(prefersReducedMotion) || isTouch;
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsLowPowerOrMobile(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isLowPowerOrMobile) return;
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer;
    try {
      renderer = new Renderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      return;
    }

    const gl = renderer.gl;
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const bgRgb = hexToRgb(backgroundColor);

    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: [gl.canvas.width, gl.canvas.height] },
        uHue: { value: hue },
        uHoverIntensity: { value: hoverIntensity },
        uHover: { value: 0 },
        uBgColor: { value: bgRgb }
      },
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width, height);
      program.uniforms.iResolution.value = [gl.canvas.width, gl.canvas.height];
    }

    window.addEventListener('resize', resize);
    resize();

    let animationId: number;
    let lastTime = performance.now();

    function update(time: number) {
      animationId = requestAnimationFrame(update);
      const dt = (time - lastTime) * 0.001;
      lastTime = time;

      // Smooth hover lerp
      hoverRef.current += (targetHoverRef.current - hoverRef.current) * 0.08;

      program.uniforms.iTime.value = time * 0.001;
      program.uniforms.uHover.value = hoverRef.current;
      program.uniforms.uHue.value = hue;
      program.uniforms.uHoverIntensity.value = hoverIntensity;

      renderer.render({ scene: mesh });
    }

    animationId = requestAnimationFrame(update);

    const handleMouseEnter = () => {
      if (rotateOnHover) targetHoverRef.current = 1.0;
    };
    const handleMouseLeave = () => {
      if (rotateOnHover) targetHoverRef.current = 0.0;
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      if (gl.canvas && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
    };
  }, [hue, hoverIntensity, rotateOnHover, backgroundColor, isLowPowerOrMobile]);

  if (isLowPowerOrMobile) {
    return (
      <div 
        className={`orb-container ${className} flex items-center justify-center pointer-events-none`}
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.28) 0%, rgba(5, 150, 105, 0.12) 40%, rgba(7, 9, 12, 0) 70%)',
          filter: 'blur(30px)',
          borderRadius: '50%'
        }}
      />
    );
  }

  return <div ref={containerRef} className={`orb-container ${className}`} />;
};

export default Orb;
