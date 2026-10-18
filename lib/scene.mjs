// Original WebGL wire sculpture. No external library, texture or model download.
export function createScene(canvas) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
  if (!gl) return { setMotion() {}, setPointer() {} };
  const vertex = 'attribute vec3 position; uniform float time; uniform float aspect; uniform float mode; uniform vec2 pointer; varying float brightness; void main(){vec3 p=position; float a=time*.12+pointer.x*.16; float b=.72+pointer.y*.12; if(mode<.5){p=vec3(p.x*cos(a)-p.z*sin(a),p.y,p.x*sin(a)+p.z*cos(a));p=vec3(p.x,p.y*cos(b)-p.z*sin(b),p.y*sin(b)+p.z*cos(b));}else{p.xy+=pointer*.07;}p.z-=5.6;float f=1.8; gl_Position=vec4(p.x*f/aspect,p.y*f,-1.002002*p.z-.2002002,-p.z);gl_PointSize=1.5;brightness=mode>.5?(.45+.25*sin(position.x*5.+time*.3)):(.5+.4*(p.z+8.)/5.); }';
  const fragment = 'precision mediump float; uniform vec4 color; uniform float mode; varying float brightness; void main(){if(mode>.5&&length(gl_PointCoord-.5)>.5)discard;gl_FragColor=vec4(color.rgb,color.a*brightness);}';
  const compile = (type, text) => { const s = gl.createShader(type); gl.shaderSource(s, text); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { gl.deleteShader(s); return null; } return s; };
  const vs = compile(gl.VERTEX_SHADER, vertex), fs = compile(gl.FRAGMENT_SHADER, fragment);
  if (!vs || !fs) return { setMotion() {}, setPointer() {} };
  const program = gl.createProgram(); gl.attachShader(program, vs); gl.attachShader(program, fs); gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return { setMotion() {}, setPointer() {} };
  gl.useProgram(program); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const pos = gl.getAttribLocation(program, 'position'); gl.enableVertexAttribArray(pos);
  const uniforms = Object.fromEntries(['time', 'aspect', 'color', 'mode', 'pointer'].map(x => [x, gl.getUniformLocation(program, x)]));
  const points = [], lines = []; const rings = 100, sides = 8;
  for (let i = 0; i < rings; i++) { const u = i / rings * Math.PI * 2;
    for (let j = 0; j < sides; j++) { const v = j / sides * Math.PI * 2, radius = 2.03 + .15 * Math.cos(v) + .12 * Math.cos(u * 3);
      points.push(radius * Math.cos(u), radius * Math.sin(u), .32 * Math.sin(u * 3) + .15 * Math.sin(v));
      const a = i * sides + j; lines.push(a, ((i + 1) % rings) * sides + j, a, i * sides + (j + 1) % sides);
    }
  }
  const mesh = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, mesh); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(points), gl.STATIC_DRAW);
  const index = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(lines), gl.STATIC_DRAW);
  let seed = 24; const random = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const stars = []; for (let i = 0; i < 130; i++) stars.push((random() - .5) * 10, (random() - .5) * 9, -random() * 3);
  const starBuffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stars), gl.STATIC_DRAW);
  let frame = 0, motion = false, visible = true, lost = false, t = 0, last = 0, pointer = [0, 0];
  const draw = () => {
    if (lost) return;
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); gl.useProgram(program);
    gl.uniform1f(uniforms.aspect, canvas.width / canvas.height); gl.uniform1f(uniforms.time, t); gl.uniform2f(uniforms.pointer, pointer[0], pointer[1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, starBuffer); gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0); gl.uniform1f(uniforms.mode, 1); gl.uniform4f(uniforms.color, .75, .64, .88, .38); gl.drawArrays(gl.POINTS, 0, stars.length / 3);
    gl.bindBuffer(gl.ARRAY_BUFFER, mesh); gl.vertexAttribPointer(pos, 3, gl.FLOAT, false, 0, 0); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); gl.uniform1f(uniforms.mode, 0); gl.uniform4f(uniforms.color, 1, .22, .34, .42); gl.drawElements(gl.LINES, lines.length, gl.UNSIGNED_SHORT, 0);
    canvas.dataset.renderer = 'webgl';
  };
  const tick = now => { frame = 0; if (!motion || !visible || document.hidden || lost) return; if (now - last > 33) { t += Math.min((now - last) / 1000, .05); last = now; draw(); } frame = requestAnimationFrame(tick); };
  const schedule = () => { if (!frame && motion && visible && !document.hidden && !lost) { last = performance.now(); frame = requestAnimationFrame(tick); } };
  const resize = () => { const r = canvas.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 1.5); canvas.width = Math.max(1, Math.round(r.width * d)); canvas.height = Math.max(1, Math.round(r.height * d)); gl.viewport(0, 0, canvas.width, canvas.height); draw(); };
  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) schedule(); else { cancelAnimationFrame(frame); frame = 0; } }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (document.hidden) { cancelAnimationFrame(frame); frame = 0; } else schedule(); });
  canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); lost = true; cancelAnimationFrame(frame); frame = 0; canvas.dataset.renderer = 'fallback'; });
  resize();
  return {
    setMotion(value) { motion = Boolean(value); if (motion) schedule(); else { cancelAnimationFrame(frame); frame = 0; pointer = [0, 0]; draw(); } },
    setPointer(x, y) { if (motion) pointer = [x, y]; }
  };
}
