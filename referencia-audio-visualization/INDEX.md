# Academic Reference Index — 3D Furniture Modeling from Audio

Papers collected for the project: *Parametric 3D furniture modeling with real-time audio signal visualization*  
Folder: `referencia-audio-visualization/`  
Date collected: 2026-05-26  
Total: 11 papers downloaded | 11 PDFs | ~38 MB

---

## Topic 1 — Audio Visualization (3D / Real-Time)

### 1. An Audio-Driven System For Real-Time Music Visualisation
- **Authors:** Max Graf, Harold Chijioke Opara, Mathieu Barthet
- **Year:** 2021
- **ArXiv:** https://arxiv.org/abs/2106.10134
- **PDF:** https://arxiv.org/pdf/2106.10134
- **Local file:** `2021_graf_audio-driven-music-visualisation.pdf` (3.7 MB)
- **Relevance:** Directly addresses the core challenge of mapping audio features to real-time 3D visual elements — mirrors how this project maps FFT/waveform/spectrogram to geometric displacement of furniture segments.

---

### 2. SoundPlot: An Open-Source Framework for Birdsong Acoustic Analysis and Neural Synthesis with Interactive 3D Visualization
- **Authors:** Naqcho Ali Mehdi, Mohammad Adeel, Aizaz Ali Larik
- **Year:** 2026
- **ArXiv:** https://arxiv.org/abs/2601.12752
- **PDF:** https://arxiv.org/pdf/2601.12752
- **Local file:** `2026_mehdi_soundplot-3d-audio-visualization.pdf` (780 KB)
- **Relevance:** Implements interactive 3D audio visualization using Three.js and WebGL at 60 FPS — same technology stack used in this project — with mel spectrogram feature extraction and real-time rendering.

---

### 3. Seeing Beyond Sound: Visualization and Abstraction in Audio Data Representation
- **Authors:** Ashlae Blum'e
- **Year:** 2025
- **ArXiv:** https://arxiv.org/abs/2511.20658
- **PDF:** https://arxiv.org/pdf/2511.20658
- **Local file:** `2025_blume_seeing-beyond-sound-visualization.pdf` (4.1 MB)
- **Relevance:** Explores how adding dimensionality and interactivity to audio visualization tools improves analytical and creative output — supports the design rationale of this project's waveform/FFT/spectrogram modes.

---

## Topic 2 — Music Visualization Systems

### 4. A Preliminary Model for the Design of Music Visualizations
- **Authors:** Swaroop Panda, Shatarupa Thakurta Roy
- **Year:** 2021
- **ArXiv:** https://arxiv.org/abs/2104.04922
- **PDF:** https://arxiv.org/pdf/2104.04922
- **Local file:** `2021_panda_music-visualization-model.pdf` (140 KB)
- **Relevance:** Proposes a formal framework for transforming auditory information into visual representations using Visualization Stimulus and Data Property concepts — provides theoretical grounding for the audio texture modes in this project.

---

## Topic 3 — Procedural / Parametric 3D Generation

### 5. Proc3D: Procedural 3D Generation and Parametric Editing of 3D Shapes with Large Language Models
- **Authors:** Fadlullah Raji, Stefano Petrangeli, Matheus Gadelha, Yu Shen, Uttaran Bhattacharya, Gang Wu
- **Year:** 2026
- **ArXiv:** https://arxiv.org/abs/2601.12234
- **PDF:** https://arxiv.org/pdf/2601.12234
- **Local file:** `2026_raji_proc3d-procedural-parametric-3d.pdf` (8.0 MB)
- **Relevance:** Introduces procedural compact graphs (PCG) for real-time parametric editing of 3D shapes — directly relevant to the parametric geometry system used for furniture modeling in this project.

---

### 6. Experiments on Generative AI-Powered Parametric Modeling and BIM for Architectural Design
- **Authors:** Jaechang Ko, John Ajibefun, Wei Yan
- **Year:** 2023
- **ArXiv:** https://arxiv.org/abs/2308.00227
- **PDF:** https://arxiv.org/pdf/2308.00227
- **Local file:** `2023_ko_generative-ai-parametric-modeling-bim.pdf` (4.7 MB)
- **Relevance:** Demonstrates AI-assisted parametric 3D design for architectural objects — contextualizes the use of parametric sliders and AI-assisted development reported in this project.

---

## Topic 4 — GLSL Shaders / Procedural Textures

### 7. A Tool for the Procedural Generation of Shaders using Interactive Evolutionary Algorithms
- **Authors:** Elio Sasso, Daniele Loiacono, Pier Luca Lanzi
- **Year:** 2023
- **ArXiv:** https://arxiv.org/abs/2312.17587
- **PDF:** https://arxiv.org/pdf/2312.17587
- **Local file:** `2023_sasso_procedural-shader-generation.pdf` (2.7 MB)
- **Relevance:** Covers procedural GLSL shader generation with graph-based representations — relevant to the custom GLSL fragment/vertex shaders (`audio-texture-shader.ts`) implementing the four audio visualization patterns.

---

### 8. AI Co-Artist: A LLM-Powered Framework for Interactive GLSL Shader Animation Evolution
- **Authors:** Kamer Ali Yuksel, Hassan Sawaf
- **Year:** 2025
- **ArXiv:** https://arxiv.org/abs/2512.08951
- **PDF:** https://arxiv.org/pdf/2512.08951
- **Local file:** `2025_yuksel_ai-coartist-glsl-shader-animation.pdf` (7.7 MB)
- **Relevance:** Combines WebGL-based real-time shader rendering with audio processing modules (Tone.js) and AI assistance for shader generation — directly mirrors this project's architecture of GLSL shaders for audio patterns developed with Claude Code.

---

## Topic 5 — Indigenous / Cultural Heritage 3D Digital Preservation

### 9. Cultural Heritage 3D Reconstruction with Diffusion Networks
- **Authors:** Pablo Jaramillo, Ivan Sipiran
- **Year:** 2024
- **ArXiv:** https://arxiv.org/abs/2410.10927
- **PDF:** https://arxiv.org/pdf/2410.10927
- **Local file:** `2024_jaramillo_cultural-heritage-3d-reconstruction.pdf` (3.3 MB)
- **Relevance:** Applies generative AI to restore 3D cultural heritage objects — contextualizes the use of 3D digital modeling for preserving indigenous artifact designs (Banco Mehinaku, Banco Wauja) from the Upper Xingu peoples.

---

### 10. Gaussian Heritage: 3D Digitization of Cultural Heritage with Integrated Object Segmentation
- **Authors:** Mahtab Dahaghin, Myrna Castillo, Kourosh Riahidehkordi, Matteo Toso, Alessio Del Bue
- **Year:** 2024
- **ArXiv:** https://arxiv.org/abs/2409.19039
- **PDF:** https://arxiv.org/pdf/2409.19039
- **Local file:** `2024_dahaghin_gaussian-heritage-3d-digitization.pdf` (1.5 MB)
- **Relevance:** Presents a pipeline for creating accurate digital replicas of physical cultural artifacts from smartphone photos — supports the argument for web-based 3D digitization of indigenous furniture designs as accessible preservation tools.

---

### 11. 3D Data Long-Term Preservation in Cultural Heritage
- **Authors:** Nicola Amico, Achille Felicetti
- **Year:** 2024
- **ArXiv:** https://arxiv.org/abs/2409.04507
- **PDF:** https://arxiv.org/pdf/2409.04507
- **Local file:** `2024_amico_3d-data-preservation-cultural-heritage.pdf` (1.1 MB)
- **Relevance:** Addresses sustainable long-term preservation of 3D cultural heritage data using FAIR principles and open formats — directly supports the project's choice to export models in open formats (STL, OBJ) for long-term accessibility and 3D printing.

---

## Download Summary

| # | File | Size | Status |
|---|------|------|--------|
| 1 | `2021_graf_audio-driven-music-visualisation.pdf` | 3.7 MB | Downloaded |
| 2 | `2021_panda_music-visualization-model.pdf` | 140 KB | Downloaded |
| 3 | `2023_ko_generative-ai-parametric-modeling-bim.pdf` | 4.7 MB | Downloaded |
| 4 | `2023_sasso_procedural-shader-generation.pdf` | 2.7 MB | Downloaded |
| 5 | `2024_amico_3d-data-preservation-cultural-heritage.pdf` | 1.1 MB | Downloaded |
| 6 | `2024_dahaghin_gaussian-heritage-3d-digitization.pdf` | 1.5 MB | Downloaded |
| 7 | `2024_jaramillo_cultural-heritage-3d-reconstruction.pdf` | 3.3 MB | Downloaded |
| 8 | `2025_blume_seeing-beyond-sound-visualization.pdf` | 4.1 MB | Downloaded |
| 9 | `2025_yuksel_ai-coartist-glsl-shader-animation.pdf` | 7.7 MB | Downloaded |
| 10 | `2026_mehdi_soundplot-3d-audio-visualization.pdf` | 780 KB | Downloaded |
| 11 | `2026_raji_proc3d-procedural-parametric-3d.pdf` | 8.0 MB | Downloaded |

**Total: 11 papers found | 11 PDFs downloaded | ~38 MB**  
All papers sourced from ArXiv (open access). All files verified as valid PDFs.
