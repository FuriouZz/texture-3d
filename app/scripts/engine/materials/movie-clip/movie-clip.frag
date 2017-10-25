varying vec2 vUv;

uniform sampler2D uSprite;
uniform float uOffset[4];
uniform float uAlpha;
uniform vec3 uTeintColor;
uniform float uFlipY;

void main( void ) {

  vec2 uv = vUv;

  vec2 spriteCoord = vec2(0.0);
  spriteCoord.x    = mix(uOffset[0], uOffset[2], (uv.x * 0.5) / 0.5);
  spriteCoord.y    = mix(uOffset[1], uOffset[3], (uv.y * 0.5) / 0.5);

  spriteCoord.y = (1.0 - uFlipY) + ((uFlipY - 0.5) * 2.0 * spriteCoord.y);

  vec4 sprite = texture2D(uSprite, spriteCoord);

  float alpha = uAlpha * sprite.a;

  vec4 color = vec4(sprite.rgb * alpha, alpha);
  color.rgb  = color.rgb * uTeintColor.rgb;

  gl_FragColor = color;

}
