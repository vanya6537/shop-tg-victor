import React, { useRef, useEffect } from 'react';

interface LightningProps {
  hue?: number;
  xOffset?: number;
  speed?: number;
  intensity?: number;
  size?: number;
  smoothHue?: boolean;
  hueSmoothing?: number;
}

const Lightning: React.FC<LightningProps> = ({
  hue = 230,
  xOffset = 0,
  speed = 1,
  intensity = 1,
  size = 1,
  smoothHue = true,
  hueSmoothing = 10,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const latestPropsRef = useRef({ hue, xOffset, speed, intensity, size, smoothHue, hueSmoothing });
  latestPropsRef.current = { hue, xOffset, speed, intensity, size, smoothHue, hueSmoothing };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastWidth = 0;
    let lastHeight = 0;
    let needsResize = true;

    const resizeCanvasIfNeeded = () => {
      const dpr = Math.max(1, window.devicePixelRatio || 1);
      const nextWidth = Math.floor(canvas.clientWidth * dpr);
      const nextHeight = Math.floor(canvas.clientHeight * dpr);
      if (nextWidth <= 0 || nextHeight <= 0) return false;
      if (nextWidth === lastWidth && nextHeight === lastHeight) return false;
      lastWidth = nextWidth;
      lastHeight = nextHeight;
      canvas.width = nextWidth;
      canvas.height = nextHeight;
      return true;
    };

    const onResize = () => {
      needsResize = true;
    };

    const ro = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => onResize())
      : null;
    ro?.observe(canvas);
    window.addEventListener('resize', onResize);

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    const vertexShaderSource = `
      attribute vec2 aPosition;
      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
      }
    `;

    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      uniform float uHue;
      uniform float uXOffset;
      uniform float uSpeed;
      uniform float uIntensity;
      uniform float uSize;
      
      #define OCTAVE_COUNT 8

      // Convert HSV to RGB.
      vec3 hsv2rgb(vec3 c) {
          vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
          return c.z * mix(vec3(1.0), rgb, c.y);
      }

      float hash11(float p) {
          p = fract(p * .1031);
          p *= p + 33.33;
          p *= p + p;
          return fract(p);
      }

      float hash12(vec2 p) {
          vec3 p3 = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      mat2 rotate2d(float theta) {
          float c = cos(theta);
          float s = sin(theta);
          return mat2(c, -s, s, c);
      }

      float noise(vec2 p) {
          vec2 ip = floor(p);
          vec2 fp = fract(p);
          float a = hash12(ip);
          float b = hash12(ip + vec2(1.0, 0.0));
          float c = hash12(ip + vec2(0.0, 1.0));
          float d = hash12(ip + vec2(1.0, 1.0));
          
          vec2 t = smoothstep(0.0, 1.0, fp);
          return mix(mix(a, b, t.x), mix(c, d, t.x), t.y);
      }

      float fbm(vec2 p) {
          float value = 0.0;
          float amplitude = 0.5;
          for (int i = 0; i < OCTAVE_COUNT; ++i) {
              value += amplitude * noise(p);
              p *= rotate2d(0.45);
              p *= 2.0;
              amplitude *= 0.5;
          }
          return value;
      }

      void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
          // Normalized pixel coordinates.
          vec2 uv = fragCoord / iResolution.xy;
          uv = 2.0 * uv - 1.0;
          uv.x *= iResolution.x / iResolution.y;
          // Apply horizontal offset.
          uv.x += uXOffset;
          
          // Adjust uv based on size and animate with speed.
          uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
          
          float dist = abs(uv.x);
          // Compute base color using hue.
          vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
          // Compute color with intensity and speed affecting time.
          vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
          col = pow(col, vec3(1.0));
          fragColor = vec4(col, 1.0);
      }

      void main() {
          mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;

    const compileShader = (
      source: string,
      type: number
    ): WebGLShader | null => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(
      fragmentShaderSource,
      gl.FRAGMENT_SHADER
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      return;
    }
    gl.useProgram(program);

    const vertices = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    const iResolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const iTimeLocation = gl.getUniformLocation(program, 'iTime');
    const uHueLocation = gl.getUniformLocation(program, 'uHue');
    const uXOffsetLocation = gl.getUniformLocation(program, 'uXOffset');
    const uSpeedLocation = gl.getUniformLocation(program, 'uSpeed');
    const uIntensityLocation = gl.getUniformLocation(program, 'uIntensity');
    const uSizeLocation = gl.getUniformLocation(program, 'uSize');

    const startTime = performance.now();
    let lastFrameTime = startTime;
    let hueSmoothed = ((latestPropsRef.current.hue % 360) + 360) % 360;
    let rafId = 0;

    const render = () => {
      if (needsResize) {
        needsResize = false;
        if (resizeCanvasIfNeeded()) {
          gl.viewport(0, 0, canvas.width, canvas.height);
          if (iResolutionLocation) {
            gl.uniform2f(iResolutionLocation, canvas.width, canvas.height);
          }
        }
      }
      const currentTime = performance.now();

      const dt = Math.min(0.05, (currentTime - lastFrameTime) / 1000.0);
      lastFrameTime = currentTime;
      const p = latestPropsRef.current;

      if (iTimeLocation) {
        gl.uniform1f(iTimeLocation, (currentTime - startTime) / 1000.0);
      }

      const targetHue = ((p.hue % 360) + 360) % 360;
      if (p.smoothHue) {
        const diff = ((targetHue - hueSmoothed + 540) % 360) - 180;
        const k = 1 - Math.exp(-p.hueSmoothing * dt);
        hueSmoothed = (hueSmoothed + diff * k + 360) % 360;
      } else {
        hueSmoothed = targetHue;
      }

      if (uHueLocation) gl.uniform1f(uHueLocation, hueSmoothed);
      if (uXOffsetLocation) gl.uniform1f(uXOffsetLocation, p.xOffset);
      if (uSpeedLocation) gl.uniform1f(uSpeedLocation, p.speed);
      if (uIntensityLocation) gl.uniform1f(uIntensityLocation, p.intensity);
      if (uSizeLocation) gl.uniform1f(uSizeLocation, p.size);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(render);
    };

    // Initial size setup
    needsResize = true;
    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', onResize);
      ro?.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-full relative" />;
};

export default Lightning;
