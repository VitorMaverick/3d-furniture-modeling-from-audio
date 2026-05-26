// Shader uniforms para textura baseada em análise de áudio
// Inspirado em: Forma de onda, Espectro FFT (0-5kHz) e Espectrograma STFT

export const audioVertexShader = `
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Shader de fragmento que simula padrões de análise de áudio
export const audioFragmentShader = `
  uniform float uTime;
  uniform vec3 uBaseColor;
  uniform float uWaveIntensity;
  uniform float uFFTIntensity;
  uniform float uSpectrogramIntensity;
  uniform int uPatternType; // 0: waveform, 1: FFT, 2: spectrogram, 3: combined
  
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vNormal;
  
  // Função de ruído para variação
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }
  
  // Simula forma de onda (domínio do tempo)
  float waveformPattern(vec2 uv, float time) {
    float wave = 0.0;
    
    // Múltiplas frequências como na forma de onda real
    wave += sin(uv.x * 20.0 + time * 2.0) * 0.5;
    wave += sin(uv.x * 45.0 + time * 3.5) * 0.3;
    wave += sin(uv.x * 80.0 + time * 1.5) * 0.2;
    wave += noise(uv * 10.0 + time) * 0.4;
    
    // Variação de amplitude (como silêncios e picos no áudio)
    float envelope = sin(uv.x * 3.14159 * 2.0 + time * 0.5) * 0.5 + 0.5;
    envelope *= smoothstep(0.0, 0.1, uv.x) * smoothstep(1.0, 0.9, uv.x);
    
    wave *= envelope;
    
    // Cria linhas horizontais baseadas na forma de onda
    float lineY = abs(uv.y - 0.5 - wave * 0.15);
    float line = smoothstep(0.02, 0.0, lineY);
    
    return line + abs(wave) * 0.3;
  }
  
  // Simula espectro FFT (picos nas baixas frequências, decaimento nas altas)
  float fftPattern(vec2 uv, float time) {
    float fft = 0.0;
    
    // Picos fortes nas baixas frequências (como no gráfico FFT fornecido)
    float lowFreq = exp(-uv.x * 3.0) * 0.8;
    lowFreq *= sin(uv.x * 50.0 + time) * 0.5 + 0.5;
    
    // Picos característicos
    float peak1 = exp(-pow((uv.x - 0.05) * 20.0, 2.0)) * 0.9;
    float peak2 = exp(-pow((uv.x - 0.1) * 15.0, 2.0)) * 0.7;
    float peak3 = exp(-pow((uv.x - 0.15) * 10.0, 2.0)) * 0.5;
    
    fft = lowFreq + peak1 + peak2 + peak3;
    
    // Barras verticais (como visualização de espectro)
    float bars = step(0.5, fract(uv.x * 30.0 + time * 0.2));
    float barHeight = fft * (1.0 - uv.y);
    
    return bars * step(1.0 - uv.y, fft * 0.8 + noise(vec2(uv.x * 10.0, time)) * 0.2);
  }
  
  // Simula espectrograma STFT (frequência x tempo com intensidade em cor)
  float spectrogramPattern(vec2 uv, float time) {
    // Cores do espectrograma: roxo escuro -> rosa -> amarelo
    float freq = 0.0;
    
    // Banda de baixas frequências (mais intensa, como no espectrograma fornecido)
    float lowBand = smoothstep(0.0, 0.3, 1.0 - uv.y) * 0.8;
    lowBand *= noise(vec2(uv.x * 20.0 + time * 2.0, uv.y * 5.0)) * 0.5 + 0.5;
    
    // Banda média 
    float midBand = smoothstep(0.3, 0.6, 1.0 - uv.y) * smoothstep(0.6, 0.3, 1.0 - uv.y) * 0.5;
    midBand *= noise(vec2(uv.x * 30.0 + time, uv.y * 10.0)) * 0.6 + 0.4;
    
    // Banda alta (harmônicos e ruído)
    float highBand = smoothstep(0.6, 1.0, 1.0 - uv.y) * 0.3;
    highBand *= noise(vec2(uv.x * 50.0 + time * 0.5, uv.y * 20.0));
    
    freq = lowBand + midBand + highBand;
    
    // Variação temporal (pulsos de intensidade)
    float pulse = sin(uv.x * 10.0 + time * 3.0) * 0.2 + 0.8;
    
    return freq * pulse;
  }
  
  // Paleta de cores do espectrograma (roxo -> rosa -> amarelo)
  vec3 spectrogramColorPalette(float t) {
    vec3 purple = vec3(0.15, 0.05, 0.25);
    vec3 magenta = vec3(0.6, 0.1, 0.4);
    vec3 orange = vec3(0.9, 0.4, 0.2);
    vec3 yellow = vec3(1.0, 0.9, 0.5);
    
    if (t < 0.33) {
      return mix(purple, magenta, t * 3.0);
    } else if (t < 0.66) {
      return mix(magenta, orange, (t - 0.33) * 3.0);
    } else {
      return mix(orange, yellow, (t - 0.66) * 3.0);
    }
  }
  
  // Paleta de cores da forma de onda (azul)
  vec3 waveformColorPalette(float t) {
    vec3 darkBlue = vec3(0.1, 0.2, 0.4);
    vec3 blue = vec3(0.3, 0.5, 0.9);
    vec3 lightBlue = vec3(0.6, 0.8, 1.0);
    
    return mix(darkBlue, mix(blue, lightBlue, t), t);
  }
  
  // Paleta de cores do FFT (vermelho)
  vec3 fftColorPalette(float t) {
    vec3 darkRed = vec3(0.3, 0.05, 0.05);
    vec3 red = vec3(0.9, 0.2, 0.2);
    vec3 lightRed = vec3(1.0, 0.5, 0.5);
    
    return mix(darkRed, mix(red, lightRed, t), t);
  }
  
  void main() {
    vec2 uv = vUv;
    vec3 color = uBaseColor;
    float pattern = 0.0;
    
    if (uPatternType == 0) {
      // Padrão de forma de onda
      pattern = waveformPattern(uv, uTime) * uWaveIntensity;
      color = mix(uBaseColor, waveformColorPalette(pattern), pattern * 0.7);
    } 
    else if (uPatternType == 1) {
      // Padrão FFT
      pattern = fftPattern(uv, uTime) * uFFTIntensity;
      color = mix(uBaseColor, fftColorPalette(pattern), pattern * 0.8);
    }
    else if (uPatternType == 2) {
      // Padrão espectrograma
      pattern = spectrogramPattern(uv, uTime) * uSpectrogramIntensity;
      color = mix(uBaseColor, spectrogramColorPalette(pattern), pattern * 0.9);
    }
    else {
      // Combinado
      float wave = waveformPattern(uv, uTime) * uWaveIntensity;
      float fft = fftPattern(uv * 0.5 + 0.25, uTime) * uFFTIntensity;
      float spec = spectrogramPattern(uv, uTime * 0.5) * uSpectrogramIntensity;
      
      pattern = (wave + fft + spec) / 3.0;
      
      vec3 waveColor = waveformColorPalette(wave);
      vec3 fftColor = fftColorPalette(fft);
      vec3 specColor = spectrogramColorPalette(spec);
      
      color = mix(uBaseColor, (waveColor + fftColor + specColor) / 3.0, pattern * 0.8);
    }
    
    // Iluminação básica
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diffuse = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;
    
    color *= (ambient + diffuse * 0.7);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

// Dados simulados baseados nas imagens fornecidas
export const audioData = {
  // Dados da forma de onda (normalizado -1 a 1)
  waveform: {
    // Seções de alta intensidade e silêncio (baseado na imagem)
    sections: [
      { start: 0, end: 0.25, intensity: 0.8 },
      { start: 0.25, end: 0.35, intensity: 0.3 },
      { start: 0.35, end: 0.65, intensity: 0.5 },
      { start: 0.65, end: 0.75, intensity: 0.2 },
      { start: 0.75, end: 0.85, intensity: 0.1 },
      { start: 0.85, end: 1.0, intensity: 0.4 },
    ]
  },
  
  // Picos do FFT (frequência, magnitude)
  fft: {
    peaks: [
      { freq: 100, magnitude: 0.00035 },
      { freq: 200, magnitude: 0.00025 },
      { freq: 350, magnitude: 0.00018 },
      { freq: 500, magnitude: 0.00012 },
      { freq: 1000, magnitude: 0.00005 },
    ],
    maxFreq: 5000
  },
  
  // Características do espectrograma
  spectrogram: {
    duration: 1056, // segundos
    maxFreq: 5000,
    // Bandas de frequência com intensidades típicas
    bands: [
      { freqRange: [0, 500], avgIntensity: -20 },
      { freqRange: [500, 1000], avgIntensity: -40 },
      { freqRange: [1000, 2000], avgIntensity: -50 },
      { freqRange: [2000, 5000], avgIntensity: -60 },
    ]
  }
};
