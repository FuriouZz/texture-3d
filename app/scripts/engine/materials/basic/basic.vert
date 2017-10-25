attribute vec3 aPosition;

uniform mat4 uMVP;

varying vec3 vPosition;

void main() {
  vPosition = aPosition;

  gl_Position = uMVP * vec4( aPosition, 1.0 );
}