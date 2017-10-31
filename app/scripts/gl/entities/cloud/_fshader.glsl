precision highp sampler3D;

in vec3 vPosition;
in vec2 vTexCoord;
in vec3 vNoiseCoord;

out vec4 fragColor;

uniform vec3 uDiffuseColor;
uniform sampler3D tNoise;
uniform sampler2D tMask;
uniform float uTime;

void main( void ) {

  float noise = texture( tNoise, vNoiseCoord ).r;
  float mask  = texture( tMask , vTexCoord   ).r;

  float alpha = noise * mask;
  vec3 color  = uDiffuseColor * alpha;
  fragColor   = vec4(color, alpha * 1.0);

}