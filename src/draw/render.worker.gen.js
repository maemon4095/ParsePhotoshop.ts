var F=Object.defineProperty;var G=(e,t)=>{for(var r in t)F(e,r,{get:t[r],enumerable:!0})};var N=`#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

in vec2 blender_vertex_position_in_pixel;

uniform vec2 blender_srcOffset;
uniform sampler2D blender_dstImage;
uniform sampler2D blender_srcImage;
uniform vec4 blender_srcArea;

out highp vec2 blender_dstCoord;
out highp vec2 blender_srcCoord;

void main() {
    highp vec2 dstSize = vec2(textureSize(blender_dstImage, 0));
    highp vec2 srcSize = vec2(textureSize(blender_srcImage, 0));
    vec2 normalized = blender_vertex_position_in_pixel / dstSize;
        
    gl_Position = vec4(normalized * 2.0 - 1.0, 0.0, 1.0);
    blender_dstCoord = normalized;
    blender_srcCoord = (blender_vertex_position_in_pixel - blender_srcOffset) / srcSize;
}`,I=N;function L(e,t,r){let n=e.createShader(t);if(n===null)throw new Error("Failed to load shader");if(e.shaderSource(n,r),e.compileShader(n),!e.getShaderParameter(n,e.COMPILE_STATUS)){let a=e.getShaderInfoLog(n);throw e.deleteShader(n),new Error("Failed to load shader: "+a)}return n}function C(e){e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR)}function k(e){let t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),C(e),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,e.canvas.width,e.canvas.height,0,e.RGBA,e.UNSIGNED_BYTE,null);let r=e.createFramebuffer();return e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t,0),[t,r]}function P(e,t,r,n,a,c){let o=r,f=r+a,p=n,b=n+c;e.bindBuffer(e.ARRAY_BUFFER,t),e.bufferData(e.ARRAY_BUFFER,new Float32Array([o,p,f,p,o,b,o,b,f,p,f,b]),e.STATIC_DRAW)}function U(e,t,r){e.useProgram(t);for(let[n,a]of Object.entries(r)){let c=e.getUniformLocation(t,n);a[m](e,c)}}var g=class{#t;#e;#i;#u;#s;#n;#o;#r;#a;constructor(t,r){let n=new OffscreenCanvas(t,r);this.#t=n,this.#u=new Map,this.#e=null,this.#i=null,this.#s=null,this.#n=null,this.#r=null,this.#o=null,this.#a=null,this.#c()}get width(){return this.#t.width}get height(){return this.#t.height}#c(){let r=this.#t.getContext("webgl2");if(r===null)throw new Error("Failed to initialize WebGL.");this.#e=r;let n=L(r,r.VERTEX_SHADER,I);this.#i=n;let a=r.createTexture();r.bindTexture(r.TEXTURE_2D,a),C(r);let[c,o]=k(r),[f,p]=k(r);this.#s=a,this.#n=c,this.#o=o,this.#r=f,this.#a=p}#d(t){let r=this.#u.get(t);if(r!==void 0)return r;let n=t.sourceWithPrelude,a=this.#e,c=L(a,a.FRAGMENT_SHADER,n),o=a.createProgram();if(a.attachShader(o,this.#i),a.attachShader(o,c),a.linkProgram(o),!a.getProgramParameter(o,a.LINK_STATUS)){let f=a.getProgramInfoLog(o);throw new Error(`Failed to compile WebGL program. 

`+f)}return this.#u.set(t,o),o}#f(){let t=this.#n,r=this.#o;this.#n=this.#r,this.#o=this.#a,this.#r=t,this.#a=r}#l(t,r,n,a,c){let o=this.#e;U(o,a,c),o.viewport(0,0,o.canvas.width,o.canvas.height);let f=o.createBuffer();P(o,f,0,0,o.canvas.width,o.canvas.height);let p=o.getAttribLocation(a,"blender_vertex_position_in_pixel");o.enableVertexAttribArray(p),o.bindBuffer(o.ARRAY_BUFFER,f),o.vertexAttribPointer(p,2,o.FLOAT,!1,0,0),o.bindTexture(o.TEXTURE_2D,this.#n),o.texImage2D(o.TEXTURE_2D,0,o.RGBA,o.canvas.width,o.canvas.height,0,o.RGBA,o.UNSIGNED_BYTE,null),o.bindFramebuffer(o.FRAMEBUFFER,this.#o),o.clearColor(0,0,0,0),o.clear(o.COLOR_BUFFER_BIT);let b=o.getUniformLocation(a,"blender_srcOffset"),O=o.getUniformLocation(a,"blender_srcArea"),M=o.getUniformLocation(a,"blender_srcImage"),B=o.getUniformLocation(a,"blender_dstImage");o.uniform2f(b,t,r),o.uniform4f(O,n.x,n.y,n.width,n.height),o.uniform1i(B,0),o.activeTexture(o.TEXTURE0),o.bindTexture(o.TEXTURE_2D,this.#r),o.uniform1i(M,1),o.activeTexture(o.TEXTURE1),o.bindTexture(o.TEXTURE_2D,this.#s),o.drawArrays(o.TRIANGLES,0,6),o.deleteBuffer(f),this.#f()}blend(t,r,n,a){this.#e===null&&this.#c();let c=this.#e;c.bindTexture(c.TEXTURE_2D,this.#s),c.texImage2D(c.TEXTURE_2D,0,c.RGBA,c.RGBA,c.UNSIGNED_BYTE,t);let o=this.#d(a.src);this.#l(r,n,{x:0,y:0,width:t.width,height:t.height},o,a.args)}createImageData(){let t=this.width,r=this.height,n=this.#e,a=new Uint8ClampedArray(t*r*4);return n!==null&&(n.bindFramebuffer(n.FRAMEBUFFER,this.#a),n.readPixels(0,0,this.width,this.height,n.RGBA,n.UNSIGNED_BYTE,a)),new ImageData(a,t,r)}clear(){this.#e===null&&this.#c();let t=this.#e;t.bindTexture(t.TEXTURE_2D,this.#r),t.clearColor(0,0,0,0),t.clear(t.COLOR_BUFFER_BIT)}cleanUp(){let t=this.#e;if(t!==null){for(let[r,n]of this.#u)t.deleteProgram(n);this.#u.clear(),t.deleteShader(this.#i),this.#i=null,t.deleteFramebuffer(this.#a),t.deleteFramebuffer(this.#o),this.#a=null,this.#o=null,t.deleteTexture(this.#s),t.deleteTexture(this.#r),t.deleteTexture(this.#n),this.#s=null,this.#r=null,this.#n=null,this.#e=null}}};var m=Symbol();var w={};G(w,{float:()=>V,int:()=>K,matrix:()=>z,uint:()=>j});function K(...e){return{[m](t,r){if(e.length===1){let n=e[0];if(n instanceof Int32Array||n instanceof Array){t.uniform1iv(r,n);return}t.uniform1i(r,n);return}switch(e.length){case 2:t.uniform2i(r,e[0],e[1]);break;case 3:t.uniform3i(r,e[0],e[1],e[2]);break;case 4:t.uniform4i(r,e[0],e[1],e[2],e[3]);break}}}}function V(...e){return{[m](t,r){if(e.length===1){let n=e[0];if(n instanceof Float32Array||n instanceof Array){t.uniform1fv(r,n);return}t.uniform1f(r,n);return}switch(e.length){case 2:t.uniform2f(r,e[0],e[1]);break;case 3:t.uniform3f(r,e[0],e[1],e[2]);break;case 4:t.uniform4f(r,e[0],e[1],e[2],e[3]);break}}}}function j(...e){return{[m](t,r){if(e.length===1){let n=e[0];if(n instanceof Uint32Array||n instanceof Array){t.uniform1uiv(r,n);return}t.uniform1ui(r,n);return}switch(e.length){case 2:t.uniform2ui(r,e[0],e[1]);break;case 3:t.uniform3ui(r,e[0],e[1],e[2]);break;case 4:t.uniform4ui(r,e[0],e[1],e[2],e[3]);break}}}}function z(e,t,r){return{[m](n,a){switch(e){case 2:switch(t){case 2:n.uniformMatrix2fv(a,!1,r);break;case 3:n.uniformMatrix2x3fv(a,!1,r);break;case 4:n.uniformMatrix2x4fv(a,!1,r);break}break;case 3:switch(t){case 2:n.uniformMatrix3x2fv(a,!1,r);break;case 3:n.uniformMatrix3fv(a,!1,r);break;case 4:n.uniformMatrix3x4fv(a,!1,r);break}break;case 4:switch(t){case 2:n.uniformMatrix4x2fv(a,!1,r);break;case 3:n.uniformMatrix4x3fv(a,!1,r);break;case 4:n.uniformMatrix4fv(a,!1,r);break}break}}}}var y=class e{#t;#e;constructor(t){this.#t=t,this.#e=W+t}get source(){return this.#t}get sourceWithPrelude(){return this.#e}withDefine(t){let r=this.#t;for(let[n,a]of Object.entries(t))r=`#define ${n} ${a}
`+r;return new e(r)}},W=`#version 300 es
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
`;var X=new y(`
uniform sampler2D blender_srcImage;
uniform sampler2D blender_dstImage;
uniform vec4 blender_srcArea;
uniform ivec2 u_porterDuff;

in vec2 blender_dstCoord;
in vec2 blender_srcCoord;

out vec4 fragColor;

vec4 porterDuff(float fa, float fb, vec4 below, vec4 above);
float getPorterDuffArg(int f, float ba, float aa);
void main() {
    vec2 dstSize = vec2(textureSize(blender_dstImage, 0));
    vec2 srcSize = vec2(textureSize(blender_srcImage, 0));
    vec4 srcCoordBounds = vec4(blender_srcArea.xy / srcSize, (blender_srcArea.xy + blender_srcArea.zw) / srcSize);
    bool outside = any(bvec4(lessThan(blender_srcCoord, srcCoordBounds.xy), greaterThan(blender_srcCoord, srcCoordBounds.zw)));
    vec4 dst = texture(blender_dstImage, blender_dstCoord);
    vec4 src = texture(blender_srcImage, blender_srcCoord);

    if (outside) {
        fragColor = dst;
        return;
    }

    float fa = getPorterDuffArg(u_porterDuff.x, dst.a, src.a);
    float fb = getPorterDuffArg(u_porterDuff.y, dst.a, src.a);
    fragColor = porterDuff(fa, fb, dst, src);
}

vec3 blend(vec3 src, vec3 dst);
vec4 porterDuff(float fa, float fb, vec4 below, vec4 above) {
    float aa = above.a;
    float ab = below.a;
    vec3 ca = above.rgb;
    vec3 cb = below.rgb;

    float ao = aa * fa + ab * fb;
    vec3 cm = (1.0 - ab) * ca + ab * blend(ca, cb);
    vec3 co = aa * fa * cm + ab * fb * cb;

    return step(0.0, ao) * vec4(co / ao, ao);
}

float getPorterDuffArg(int f, float ba, float aa) {
    switch(f) {
        case -1: return ba;
        case -2: return aa;
        case -3: return 1.0 - ba;
        case -4: return 1.0 - aa;
        default: return float(f);
    }
}

float multiply(float a, float b) {
    return b * a;
}
float screen(float a, float b) {
    return b + a - b * a;
}
float hardLight(float a, float b) {
    if (a <= 0.5) {
        return multiply(b, 2.0 * a);
    } else {
        return screen(b, 2.0 * a - 1.0);
    }
}


float lum(vec3 c) {
    return 0.3 * c.r + 0.59 * c.g + 0.11 * c.b;
}

vec3 clipColor(vec3 c) {
    float l = lum(c);
    float n = min(c.r, min(c.g, c.b));
    float x = max(c.r, max(c.g, c.b));
    if (n < 0.0) {
        c = l + (((c - l) * l) / (l - n));
    }
    if (x > 1.0) {
        c = l + (((c - l) * (1.0 - l)) / (x - l));
    }
    return c;
}


vec3 setLum(vec3 c, float l) {
    float d = l - lum(c);
    return clipColor(c + d);
}

float sat(vec3 c) {
    return max(c.r, max(c.g, c.b)) - min(c.r, min(c.g, c.b));
}

vec3 setSat(vec3 c, float s) {
    #define SAT(min, mid, max) if (c.max > c.min) { c.mid = (c.mid - c.min) * s / (c.max - c.min); c.max = s; } else { c.mid = c.max = 0.0; } c.min = 0.0; return c;

    if(c.r > c.g) {
        if(c.b > c.r) { // b > r > g
            SAT(b, r, g);
        } else if(c.b > c.g) { // r >= b > g
            SAT(r, b, g);
        } else { // r >= g >= b
            SAT(r, g, b);
        }
    } else { // g >= r
        if (c.b > c.g) { // b > g >= r
            SAT(b, g, r);
        } else if (c.b > c.r) { // g >= b > r
            SAT(g, b, r);
        } else { // g >= r >= b
            SAT(g, r, b);
        }
    }   
}

#if (METHOD == 1) // normal
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return src;
}
#endif

#if (METHOD == 2) // multiply
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return multiply(src, dst);
}
#endif

#if (METHOD == 3) // screen
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return screen(src, dst);
}
#endif

#if (METHOD == 4) // overlay
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return hardLight(dst, src);
}
#endif

#if (METHOD == 5) // darken
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return min(dst, src);
}
#endif

#if (METHOD == 6) // lighten
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return max(dst, src);
}
#endif

#if (METHOD == 7) // colorDodge
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    if (dst == 0.0) {
        return 0.0;
    }
    if (src == 1.0) {
        return 1.0;
    }
    return min(1.0, dst / (1.0 - src));
}
#endif

#if (METHOD == 8) // colorBurn
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    if (dst == 1.0) {
        return 1.0;
    }
    if (src == 0.0) {
        return 0.0;
    }
    return 1.0 - min(1.0, (1.0 - dst) / src);
}
#endif

#if (METHOD == 9) // hardLight
#define CHANNEL_BLEND true
float blendCh(float src, float dst) {
    return hardLight(src, dst);
}
#endif

#if (METHOD == 10) // softLight
#define CHANNEL_BLEND true
float blendCh(float a, float b) {
    if (a <= 0.5) {
        return b - (1.0 - 2.0 * a) * b * (1.0 - b);
    } else {
        const d = b <= 0.25 ? ((16.0 * b - 12.0) * b + 4.0) * b : sqrt(b);
        return b + (2.0 * a - 1) * (d - b);
    }
}
#endif

#if (METHOD == 11)  // difference
#define CHANNEL_BLEND true
float blendCh(float a, float b) {
    return abs(b - a);
}
#endif

#if (METHOD == 12) // exclusion
#define CHANNEL_BLEND true
float blendCh(float a, float b) {
    return b + a - 2 * b * a;
}
#endif

#if (METHOD == 13) // hue 
vec3 blend(vec3 a, vec3 b) {
    return setLum(setSat(a, sat(b)), lum(b));   
}
#endif

#if (METHOD == 14) // saturation 
vec3 blend(vec3 a, vec3 b) {
    return setLum(setSat(b, sat(a)), lum(b));
}
#endif

#if (METHOD == 15) // color 
vec3 blend(vec3 a, vec3 b) {
    return setLum(a, lum(b));
}
#endif

#if (METHOD == 16) // luminosity 
vec3 blend(vec3 a, vec3 b) {
    return setLum(b, lum(a));
}
#endif

#ifdef CHANNEL_BLEND
vec3 blend(vec3 a, vec3 b) {
    return vec3(
        blendCh(a.r, b.r),
        blendCh(a.g, b.g),
        blendCh(a.b, b.b)
    );
}
#endif
`),u=X;var De=Symbol(),s=class e{static porterDuff=(()=>{function t(r,n){return new e(r,n)}return Object.defineProperty(t,"dstAlpha",{value:-1}),Object.defineProperty(t,"srcAlpha",{value:-2}),Object.defineProperty(t,"dstAlphaComplement",{value:-3}),Object.defineProperty(t,"srcAlphaComplement",{value:-4}),Object.freeze(t),t})();static clear=e.porterDuff(0,0);static copy=e.porterDuff(1,0);static destination=e.porterDuff(0,1);static sourceOver=e.porterDuff(1,e.porterDuff.srcAlphaComplement);static destinationOver=e.porterDuff(e.porterDuff.dstAlphaComplement,1);static sourceIn=e.porterDuff(e.porterDuff.dstAlpha,0);static destinationIn=e.porterDuff(0,e.porterDuff.srcAlpha);static sourceOut=e.porterDuff(e.porterDuff.dstAlphaComplement,0);static destinationOut=e.porterDuff(0,e.porterDuff.srcAlphaComplement);static sourceAtop=e.porterDuff(e.porterDuff.dstAlpha,e.porterDuff.srcAlphaComplement);static destinationAtop=e.porterDuff(e.porterDuff.dstAlphaComplement,e.porterDuff.srcAlpha);static xor=e.porterDuff(e.porterDuff.dstAlphaComplement,e.porterDuff.srcAlphaComplement);static lighter=e.porterDuff(1,1);#t;#e;constructor(t,r){this.#t=t,this.#e=r}get fa(){return this.#t}get fb(){return this.#e}},i=class e{static normal=new e(u.withDefine({METHOD:"1"}),s.sourceOver);static multiply=new e(u.withDefine({METHOD:"2"}),s.sourceOver);static screen=new e(u.withDefine({METHOD:"3"}),s.sourceOver);static overlay=new e(u.withDefine({METHOD:"4"}),s.sourceOver);static darken=new e(u.withDefine({METHOD:"5"}),s.sourceOver);static lighten=new e(u.withDefine({METHOD:"6"}),s.sourceOver);static colorDodge=new e(u.withDefine({METHOD:"7"}),s.sourceOver);static colorBurn=new e(u.withDefine({METHOD:"8"}),s.sourceOver);static hardLight=new e(u.withDefine({METHOD:"9"}),s.sourceOver);static softLight=new e(u.withDefine({METHOD:"10"}),s.sourceOver);static difference=new e(u.withDefine({METHOD:"11"}),s.sourceOver);static exclusion=new e(u.withDefine({METHOD:"12"}),s.sourceOver);static hue=new e(u.withDefine({METHOD:"13"}),s.sourceOver);static saturation=new e(u.withDefine({METHOD:"14"}),s.sourceOver);static color=new e(u.withDefine({METHOD:"15"}),s.sourceOver);static luminosity=new e(u.withDefine({METHOD:"16"}),s.sourceOver);src;args;constructor(t,r){this.src=t,this.args={u_porterDuff:w.int(r.fa,r.fb)}}withCompositeMethod(t){return new e(this.src,t)}};var Do=Symbol();function oe(e){switch(e){case 0:throw new Error("Unknown blend mode.");case 1:throw new Error("Invalid blend mode.");case 2:return i.normal;case 4:return i.darken;case 5:return i.multiply;case 6:return i.colorBurn;case 9:return i.lighten;case 10:return i.screen;case 11:return i.colorDodge;case 14:return i.overlay;case 15:return i.softLight;case 16:return i.hardLight;case 22:return i.exclusion;case 21:return i.difference;case 25:return i.hue;case 26:return i.saturation;case 27:return i.color;case 28:return i.luminosity;default:return}}function ae(e){let t=e;for(;t.type!=="Photoshop";){if(!t.visible)return!1;t=t.parent}return!0}function T(e,t,r,n){if(!ae(t)||t.imageData===null)return;let a=oe(t.blendMode);a===void 0&&(console.warn("Unsupported blend mode was detected and treated as normal blend mode."),a=i.normal),t.clippingMode===1&&(a=a.withCompositeMethod(s.sourceAtop)),e.blend(t.imageData,t.left+r,t.top+n,a)}var D;onmessage=e=>{switch(e.data.type){case"init":{D=new g(e.data.width,e.data.height);break}case"blend":{T(D,e.data.layer,0,0);break}case"complete":{let t=D.createImageData();D.cleanUp(),postMessage({type:"done",data:t})}}};
