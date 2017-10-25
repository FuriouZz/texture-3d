in vec3  aPosition;
in vec2  aTexCoord;
in float aZ;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNoiseCoord;

uniform mat4 uMVP;
uniform float uTime;

void main() {
  vPosition   = aPosition;
  vTexCoord   = aTexCoord;
  vNoiseCoord = vec3(
    aTexCoord.x + uTime * 0.25,
    aTexCoord.y,
    aZ + uTime * 0.25
  );

  float z = 2.;

  vec3 transform = vec3(0.0);
  transform.z = (z * -0.5) + (aZ * z);
  transform.z = (z * -0.5) + (aZ * z);

  gl_Position = uMVP * vec4( aPosition + transform, 1.0 );
}