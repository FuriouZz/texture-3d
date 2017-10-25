attribute vec2 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uMVP;
uniform float uFlipY;

varying vec2 vUv;

void main( void ){

  vUv = aTexCoord.xy;

  // Flip Y
  vUv.y = (1.0 - uFlipY) + ((uFlipY - 0.5) * 2.0 * vUv.y);

  gl_Position = uMVP * vec4(aPosition, 0.0, 1.0);
}
