
varying vec2 vUv;
uniform sampler2D uTexture;
varying float vTime;


void main()
{
    // vec4 textureColor = vec4(vUv.x, 1.0, 1.0, 1.0);
    vec4 textureColor = texture2D(uTexture, vUv + sin(vUv * vTime * 40.) * 0.01 ); 

    gl_FragColor = textureColor;
}

