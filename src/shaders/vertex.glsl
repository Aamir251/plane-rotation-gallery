
varying vec2 vUv;

uniform float progress;

varying vec3 newPosition;

uniform float uProgress;

void main()
{
    vUv = uv;

    newPosition = position;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);

    float dist = ( modelMatrix * vec4(position, 1.0)).y;

    // newPosition.x *= pow(abs(dist * 0.002), 1.6) + 1.2;
    modelPosition.z += cos(abs(newPosition.x) * 2. ) * 40.;

    vec4 viewPosition = viewMatrix * modelPosition;

    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;

}
