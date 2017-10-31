in vec3 aPosition;
in vec2 aTexCoord;
in vec3 aNormal;
in vec2 iDepth;

out vec3 vPosition;
out vec2 vTexCoord;
out vec3 vNoiseCoord;

uniform mat4 uMVP;
uniform mat4 uModelMatrix;
uniform vec3 uCameraPosition;
uniform float uTime;

void main() {

  vPosition   = aPosition;
  vTexCoord   = aTexCoord;

  float z = 2.;

  vec3 transform = vec3(0.0);
  transform.x = cos( iDepth.x + iDepth.y ) * 0.5;
  transform.y = sin( iDepth.x + iDepth.y ) * 0.75;
  transform.z = (z * -0.5) + (iDepth.x * z);

  vec3 worldPosition = (uModelMatrix * vec4(aPosition, 1.0)).xyz;
  vec3 worldNormal   = (uModelMatrix * vec4(aNormal  , 0.0)).xyz;
  vec3 viewDir = normalize( uCameraPosition - worldPosition );

  vNoiseCoord = vec3(
    aTexCoord.x,// + uTime * 0.25,
    aTexCoord.y,
    iDepth.x + dot( aNormal, viewDir ) * 0.5 + uTime * 0.075
    // iDepth.x + uTime * 0.25//abs(cos(uTime * 0.35))
  );

  gl_Position = uMVP * vec4( aPosition + transform, 1.0 );
}