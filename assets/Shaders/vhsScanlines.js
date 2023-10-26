const vhsScanlines = {

	name: 'vhsScanlines',

	uniforms: {

		"tDiffuse": { type: "t", value: null },
		"time": { type: "f", value: 0.0 },
		"nIntensity": { type: "f", value: 0.35 },
		"sIntensity": { type: "f", value: 1.4 },
		"sCount": { type: "f", value: 800 },
		"grayscale": { type: "i", value: 0 }

	},

	vertexShader: /* glsl */`

		varying vec2 vUv;
		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,

	fragmentShader: /* glsl */`

		uniform float time;
		uniform bool grayscale;
		uniform float nIntensity;
		uniform float sIntensity;
		uniform float sCount;
		uniform sampler2D tDiffuse;
		varying vec2 vUv;

		void main() {

			vec4 cTextureScreen = texture2D(tDiffuse, vUv);
  			float x = vUv.x * vUv.y * time *  1000.0;
  			x = mod(x, 13.0) * mod(x, 123.0);
  			float dx = mod(x, 0.01);
  			vec3 cResult = cTextureScreen.rgb + cTextureScreen.rgb * clamp(0.1 + dx * 100.0, 0.0, 1.0);
  			vec2 sc = vec2(sin(vUv.y * sCount), cos(vUv.y * sCount));
  			cResult += cTextureScreen.rgb * vec3(sc.x, sc.y, sc.x) * sIntensity;
  			cResult = cTextureScreen.rgb + clamp(nIntensity, 0.0, 1.0) * (cResult - cTextureScreen.rgb);
  			if (grayscale) {
    			cResult = vec3(cResult.r * 0.3 + cResult.g * 0.59 + cResult.b * 0.11);
  			}
  			gl_FragColor = vec4(cResult, cTextureScreen.a);

		}`

};

export { vhsScanlines };