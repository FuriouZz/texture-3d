uniform vec3 uDiffuseColor;
uniform vec3 uTeintColor;
uniform float uAlpha;

varying vec3 vPosition;

void main() {

  vec4 color = vec4(uDiffuseColor * uAlpha, uAlpha);
  color.rgb  = color.rgb * uTeintColor.rgb;

  gl_FragColor = color;

}