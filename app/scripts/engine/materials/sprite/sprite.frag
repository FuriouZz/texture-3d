varying vec2 vUv;

uniform sampler2D uSprite;
uniform float uAlpha;
uniform vec3 uTeintColor;

void main( void ) {

  vec2 uv = vUv;

  vec4 sprite = texture2D(uSprite, uv);

  float alpha = uAlpha * sprite.a;

  vec4 color = vec4(sprite.rgb * alpha, alpha);
  color.rgb  = color.rgb * uTeintColor.rgb;

  gl_FragColor = color;

}
