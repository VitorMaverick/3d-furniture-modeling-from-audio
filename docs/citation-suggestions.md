# Citation Enrichment Report

**Artigo analisado:** `docs/artigo-academico.md`  
**Referências disponíveis:** 11 papers (INDEX.md)  
**Data de análise:** 26 de maio de 2026  

---

## Summary

- **Total de oportunidades de citação encontradas:** 31
- **Papers com matches STRONG:** 8 (Graf 2021, Mehdi 2026, Blume 2025, Panda 2021, Raji 2026, Sasso 2023, Yuksel 2025, Amico 2024)
- **Papers com matches MEDIUM:** 3 (Ko 2023, Jaramillo 2024, Dahaghin 2024)
- **Gaps (claims sem cobertura pelas 11 referências):** 7

---

## Citation Suggestions by Paper

---

### Graf, Opara e Barthet (2021) — An Audio-Driven System For Real-Time Music Visualisation

> Relevância declarada no INDEX: mapeia audio features para elementos visuais 3D em tempo real — espelha como o projeto mapeia FFT/waveform/spectrogram para deslocamento geométrico dos segmentos.

---

**[STRONG]** Seção 1 — Introdução  
> "O projeto nasceu da necessidade de explorar como representações de áudio — como a transformada de Fourier (FFT) e o espectrograma (STFT) — podem ser utilizadas não apenas como ferramentas analíticas, mas como elementos estéticos e interativos dentro de modelos 3D."  
→ **Cite como:** (GRAF; OPARA; BARTHET, 2021) — o artigo aborda exatamente esse problema de transformar features de áudio (FFT, STFT) em elementos visuais interativos em tempo real.  
→ **Sugestão de reformulação:** "O projeto nasceu da necessidade de explorar como representações de áudio — como a transformada de Fourier (FFT) e o espectrograma (STFT) — podem ser utilizadas não apenas como ferramentas analíticas, mas como elementos estéticos e interativos dentro de modelos 3D (GRAF; OPARA; BARTHET, 2021)."

---

**[STRONG]** Seção 4.2 — Mapeamento de Intensidade para Geometria 3D  
> "O princípio fundamental é: cada segmento é empurrado radialmente para fora do centro do móvel por uma quantidade proporcional à intensidade do sinal naquele ponto."  
→ **Cite como:** (GRAF; OPARA; BARTHET, 2021) — o sistema descrito pelos autores utiliza exatamente o mesmo princípio de mapear intensidades de features de áudio para deslocamentos em elementos visuais.  
→ **Sugestão de reformulação:** "O princípio fundamental — alinhado à abordagem de mapeamento audio-para-geometria proposta por Graf, Opara e Barthet (2021) — é: cada segmento é empurrado radialmente para fora do centro do móvel por uma quantidade proporcional à intensidade do sinal naquele ponto."

---

**[STRONG]** Seção 4.4 — Sistema de Animação  
> "A animação em tempo real opera apenas no modo Waveform, utilizando o hook `useFrame` do `@react-three/fiber`, que é chamado a cada quadro renderizado pelo motor Three.js."  
→ **Cite como:** (GRAF; OPARA; BARTHET, 2021) — o paper trata especificamente de sistemas de visualização musical em tempo real, incluindo considerações sobre renderização por quadro.  
→ **Sugestão de reformulação:** "A animação em tempo real opera apenas no modo Waveform — em consonância com princípios de visualização musical em tempo real descritos por Graf, Opara e Barthet (2021) —, utilizando o hook `useFrame` do `@react-three/fiber`, que é chamado a cada quadro renderizado pelo motor Three.js."

---

**[STRONG]** Seção 2.3 — Os Modos de Textura de Áudio  
> "Modo Onda (Waveform): Simula como uma onda sonora parece em um osciloscópio — linhas que sobem e descem. No modo animado, os segmentos do móvel pulsam e se movem como se o som estivesse 'dentro' da madeira."  
→ **Cite como:** (GRAF; OPARA; BARTHET, 2021) — o paper fundamenta a prática de mapear formas de onda para representações visuais animadas como forma de comunicar conteúdo musical.  
→ **Sugestão de reformulação:** "Modo Onda (Waveform): Simula como uma onda sonora parece em um osciloscópio — linhas que sobem e descem (GRAF; OPARA; BARTHET, 2021). No modo animado, os segmentos do móvel pulsam e se movem como se o som estivesse 'dentro' da madeira."

---

### Mehdi, Adeel e Larik (2026) — SoundPlot: 3D Audio Visualization

> Relevância declarada no INDEX: implementa visualização 3D de áudio com Three.js e WebGL a 60 FPS — mesmo stack tecnológico — com mel spectrogram e renderização em tempo real.

---

**[STRONG]** Seção 3.1 — Tecnologias Utilizadas  
> "O Three.js foi escolhido por ser a biblioteca JavaScript mais madura para renderização 3D no navegador, com ampla documentação e comunidade ativa."  
→ **Cite como:** (MEHDI; ADEEL; LARIK, 2026) — o trabalho de Mehdi et al. emprega Three.js e WebGL para visualização 3D interativa de áudio a 60 FPS, validando essa escolha tecnológica para o domínio específico de visualização de áudio.  
→ **Sugestão de reformulação:** "O Three.js foi escolhido por ser a biblioteca JavaScript mais madura para renderização 3D no navegador, com ampla documentação e comunidade ativa — escolha também adotada em projetos recentes de visualização de áudio em tempo real (MEHDI; ADEEL; LARIK, 2026)."

---

**[STRONG]** Seção 4.1.3 — Espectrograma — STFT  
> "O espectrograma combina as duas representações anteriores em uma 'imagem' bidimensional: o eixo horizontal representa o tempo, o eixo vertical representa a frequência, e a cor/intensidade em cada ponto indica quão forte aquela frequência estava presente naquele momento."  
→ **Cite como:** (MEHDI; ADEEL; LARIK, 2026) — o SoundPlot utiliza mel spectrogram (derivado da STFT) como representação central, com o mesmo esquema de eixos tempo × frequência mapeados em intensidade visual.  
→ **Sugestão de reformulação:** "O espectrograma combina as duas representações anteriores em uma 'imagem' bidimensional: o eixo horizontal representa o tempo, o eixo vertical representa a frequência, e a cor/intensidade em cada ponto indica quão forte aquela frequência estava presente naquele momento (MEHDI; ADEEL; LARIK, 2026)."

---

**[STRONG]** Seção 4.1 — Representações Matemáticas de Áudio Simuladas  
> "É importante destacar que a aplicação não processa áudio real. Em vez disso, ela simula matematicamente como três representações clássicas de sinais sonoros se parecem visualmente, usando funções matemáticas como seno, exponencial e produto escalar."  
→ **Cite como:** (MEHDI; ADEEL; LARIK, 2026) — o paper fornece base comparativa: enquanto o SoundPlot processa áudio real com STFT, este projeto simula matematicamente as mesmas representações; a citação contextualiza a diferença de abordagem.  
→ **Sugestão de reformulação:** "É importante destacar que a aplicação não processa áudio real — diferentemente de sistemas como o SoundPlot (MEHDI; ADEEL; LARIK, 2026), que extrai espectrogramas de gravações reais. Em vez disso, ela simula matematicamente como três representações clássicas de sinais sonoros se parecem visualmente, usando funções matemáticas como seno, exponencial e produto escalar."

---

### Blume (2025) — Seeing Beyond Sound: Visualization and Abstraction

> Relevância declarada no INDEX: explora como adicionar dimensionalidade e interatividade a ferramentas de visualização de áudio melhora saídas analíticas e criativas.

---

**[STRONG]** Seção 1 — Introdução  
> "A intersecção entre tecnologia digital e patrimônio cultural é um campo crescente de pesquisa e desenvolvimento. Ao mesmo tempo, a visualização interativa de sinais de áudio por meio de representações visuais tridimensionais abre novas possibilidades para artistas, educadores e desenvolvedores."  
→ **Cite como:** (BLUME, 2025) — o paper argumenta que adicionar dimensionalidade e interatividade a visualizações de áudio amplia possibilidades criativas e analíticas.  
→ **Sugestão de reformulação:** "A visualização interativa de sinais de áudio por meio de representações visuais tridimensionais abre novas possibilidades para artistas, educadores e desenvolvedores (BLUME, 2025)."

---

**[STRONG]** Seção 2.3 — Os Modos de Textura de Áudio  
> "Modo Espectrograma (STFT): Combina tempo e frequência em uma só imagem. É como uma 'radiografia' do som, mostrando como as frequências mudam ao longo do tempo."  
→ **Cite como:** (BLUME, 2025) — o paper discute como a visualização multidimensional (tempo × frequência) enriquece a compreensão do sinal sonoro.  
→ **Sugestão de reformulação:** "Modo Espectrograma (STFT): Combina tempo e frequência em uma só imagem — um recurso que, segundo Blume (2025), expande significativamente a capacidade analítica e criativa de ferramentas de visualização de áudio."

---

**[STRONG]** Seção 4 — Introdução da seção  
> "Esta seção descreve os algoritmos centrais do sistema, que traduzem conceitos de processamento de sinais em deformações geométricas e paletas de cores tridimensionais."  
→ **Cite como:** (BLUME, 2025) — o trabalho fundamenta teoricamente a prática de abstrair representações de áudio em formas visuais, incluindo variações de cor e dimensão.  
→ **Sugestão de reformulação:** "Esta seção descreve os algoritmos centrais do sistema, que traduzem conceitos de processamento de sinais em deformações geométricas e paletas de cores tridimensionais — prática explorada conceitualmente por Blume (2025) no contexto de visualização e abstração de dados de áudio."

---

### Panda e Roy (2021) — A Preliminary Model for the Design of Music Visualizations

> Relevância declarada no INDEX: propõe framework formal para transformar informação auditiva em representações visuais com Visualization Stimulus e Data Property.

---

**[STRONG]** Seção 4.3 — Sistema de Paletas de Cores  
> "Cada modo de áudio possui uma paleta de cores específica, inspirada em como esses sinais são tipicamente visualizados em ferramentas científicas."  
→ **Cite como:** (PANDA; ROY, 2021) — o paper propõe formalmente como propriedades de dados de áudio (frequência, amplitude) devem guiar escolhas visuais (cor, intensidade), fundamentando a decisão de ter paletas distintas por modo.  
→ **Sugestão de reformulação:** "Cada modo de áudio possui uma paleta de cores específica, inspirada em como esses sinais são tipicamente visualizados em ferramentas científicas — decisão alinhada ao modelo de design de visualizações musicais proposto por Panda e Roy (2021), que relaciona propriedades do dado auditivo a estímulos visuais correspondentes."

---

**[STRONG]** Seção 4.1 — Representações Matemáticas de Áudio Simuladas (introdução)  
> "ela simula matematicamente como três representações clássicas de sinais sonoros se parecem visualmente"  
→ **Cite como:** (PANDA; ROY, 2021) — o modelo formal de Panda e Roy classifica exatamente essas três representações (waveform, FFT, spectrogram) como modos distintos de transformação de dados auditivos em estímulos visuais.  
→ **Sugestão de reformulação:** "ela simula matematicamente como três representações clássicas de sinais sonoros se parecem visualmente — representações que Panda e Roy (2021) classificam como modalidades distintas de transformação audio-visual, cada uma com propriedades perceptivas específicas."

---

**[MEDIUM]** Seção 2.3 — Os Modos de Textura de Áudio  
> "Modo Combinado: Mistura os três padrões anteriores em um único visual."  
→ **Cite como:** (PANDA; ROY, 2021) — o framework dos autores inclui discussão sobre composição de estímulos visuais múltiplos, contextualizando a escolha de um modo combinado.  
→ **Sugestão de reformulação:** "Modo Combinado: Mistura os três padrões anteriores em um único visual, compondo estímulos de diferentes representações de áudio (PANDA; ROY, 2021)."

---

### Raji et al. (2026) — Proc3D: Procedural 3D Generation and Parametric Editing

> Relevância declarada no INDEX: introduz compact graphs procedurais para edição paramétrica em tempo real de formas 3D.

---

**[STRONG]** Seção 3 — Arquitetura Técnica (título e abertura)  
> (implícito no título da seção e na descrição do sistema como "modelagem 3D paramétrica")  

**[STRONG]** Seção 1.1 — Objetivos  
> "Desenvolver uma aplicação web interativa para modelagem 3D de móveis com visualização de sinais de áudio."  
→ **Cite como:** (RAJI et al., 2026) — o Proc3D aborda diretamente geração e edição paramétrica de formas 3D em tempo real, validando a abordagem paramétrica adotada neste projeto.  
→ **Sugestão de reformulação:** "Desenvolver uma aplicação web interativa para modelagem 3D paramétrica de móveis com visualização de sinais de áudio, explorando abordagens similares às propostas por Raji et al. (2026) para geração e edição paramétrica de geometrias 3D."

---

**[STRONG]** Seção 3.3 — Gerenciamento de Estado  
> "A interface `FurnitureParams`, com aproximadamente 40 parâmetros distribuídos entre configurações de cada móvel e controles de visualização."  
→ **Cite como:** (RAJI et al., 2026) — o Proc3D propõe representação compacta de parâmetros geométricos para edição interativa, contextualizando o design da interface paramétrica com 40 parâmetros.  
→ **Sugestão de reformulação:** "A interface `FurnitureParams`, com aproximadamente 40 parâmetros distribuídos entre configurações de cada móvel e controles de visualização — estrutura que se alinha à proposta de edição paramétrica compacta descrita em Raji et al. (2026)."

---

**[STRONG]** Seção 2.4 — O que o Usuário Pode Fazer?  
> "Controles de dimensão: sliders para ajustar largura, altura, profundidade."  
→ **Cite como:** (RAJI et al., 2026) — o Proc3D demonstra a eficácia de interfaces de edição paramétrica em tempo real para modelagem 3D interativa.  
→ **Sugestão de reformulação:** "Controles de dimensão: sliders para ajustar largura, altura, profundidade — uma abordagem de edição paramétrica em tempo real validada por trabalhos recentes como o Proc3D (RAJI et al., 2026)."

---

### Ko, Ajibefun e Yan (2023) — Generative AI-Powered Parametric Modeling and BIM

> Relevância declarada no INDEX: demonstra design paramétrico 3D assistido por IA para objetos arquitetônicos.

---

**[MEDIUM]** Seção 5.1 — Contexto e Ferramentas Utilizadas  
> "O desenvolvimento deste projeto foi realizado com auxílio do Claude Code (Anthropic), uma ferramenta de IA integrada ao terminal de linha de comando que permite interagir com o código-fonte de forma contextual e executar tarefas de engenharia de software de forma autônoma ou assistida."  
→ **Cite como:** (KO; AJIBEFUN; YAN, 2023) — o paper demonstra o uso de IA generativa para modelagem paramétrica 3D, contextualizando a prática de desenvolvimento paramétrico assistido por IA.  
→ **Sugestão de reformulação:** "O desenvolvimento deste projeto foi realizado com auxílio do Claude Code (Anthropic) — abordagem que se insere em uma tendência crescente de uso de IA generativa para apoio à modelagem paramétrica (KO; AJIBEFUN; YAN, 2023) —, uma ferramenta integrada ao terminal de linha de comando."

---

**[MEDIUM]** Seção 10 — Conclusão  
> "Do ponto de vista do processo, o desenvolvimento assistido por IA se mostrou uma ferramenta de produtividade significativa, especialmente em tarefas de diagnóstico e correção de erros, configuração de infraestrutura e gestão de repositório."  
→ **Cite como:** (KO; AJIBEFUN; YAN, 2023) — o paper relata experiências práticas com IA generativa em projetos de modelagem paramétrica, reportando benefícios similares de produtividade.  
→ **Sugestão de reformulação:** "Do ponto de vista do processo, o desenvolvimento assistido por IA se mostrou uma ferramenta de produtividade significativa (KO; AJIBEFUN; YAN, 2023), especialmente em tarefas de diagnóstico e correção de erros, configuração de infraestrutura e gestão de repositório."

---

### Sasso, Loiacono e Lanzi (2023) — Procedural Shader Generation with IEA

> Relevância declarada no INDEX: aborda geração procedural de shaders GLSL com representações em grafo — relevante ao `audio-texture-shader.ts`.

---

**[STRONG]** Seção 3.5 — Material com Shader de Áudio  
> "Os shaders GLSL são strings armazenadas em `lib/audio-texture-shader.ts`. O vertex shader é um passthrough simples; o fragment shader implementa os quatro padrões de áudio como funções GLSL separadas e os combina condicionalmente baseado em `uPatternType`."  
→ **Cite como:** (SASSO; LOIACONO; LANZI, 2023) — o paper aborda diretamente a organização de shaders GLSL procedurais como funções separadas que geram padrões visuais distintos, validando a arquitetura modular adotada no fragment shader.  
→ **Sugestão de reformulação:** "Os shaders GLSL são strings armazenadas em `lib/audio-texture-shader.ts`. O vertex shader é um passthrough simples; o fragment shader implementa os quatro padrões de áudio como funções GLSL separadas e os combina condicionalmente — arquitetura modular consistente com a abordagem de geração procedural de shaders descrita em Sasso, Loiacono e Lanzi (2023) — baseado em `uPatternType`."

---

**[STRONG]** Seção 3.5 — Material com Shader de Áudio  
> "O componente `AudioShaderMaterial` (`audio-material.tsx`) aplica o material correto dependendo do modo de textura."  
→ **Cite como:** (SASSO; LOIACONO; LANZI, 2023) — o paper trata de seleção e composição de shaders procedurais por tipo de padrão visual desejado.  
→ **Sugestão de reformulação:** "O componente `AudioShaderMaterial` (`audio-material.tsx`) aplica o material correto dependendo do modo de textura — abordagem de seleção condicional de shader procedural explorada por Sasso, Loiacono e Lanzi (2023)."

---

### Yuksel e Sawaf (2025) — AI Co-Artist: LLM-Powered GLSL Shader Animation

> Relevância declarada no INDEX: combina renderização WebGL em tempo real com módulos de processamento de áudio e assistência de IA para geração de shaders — espelha diretamente a arquitetura deste projeto.

---

**[STRONG]** Seção 3.5 — Material com Shader de Áudio  
> (O parágrafo completo sobre shaderMaterial com uTime, uBaseColor, uPatternType)  
> "Os shaders GLSL são strings armazenadas em `lib/audio-texture-shader.ts`."  
→ **Cite como:** (YUKSEL; SAWAF, 2025) — o AI Co-Artist combina exatamente renderização WebGL em tempo real com shaders GLSL para animação de padrões de áudio, desenvolvido com assistência de IA — arquitetura quase idêntica à deste projeto.  
→ **Sugestão de reformulação:** "Os shaders GLSL são strings armazenadas em `lib/audio-texture-shader.ts` — abordagem que converge com o sistema AI Co-Artist (YUKSEL; SAWAF, 2025), que também combina shaders GLSL para padrões de áudio com renderização WebGL em tempo real assistida por IA."

---

**[STRONG]** Seção 5 — Desenvolvimento Assistido por Inteligência Artificial (abertura)  
> "O desenvolvimento deste projeto foi realizado com auxílio do Claude Code (Anthropic)..."  
→ **Cite como:** (YUKSEL; SAWAF, 2025) — o paper é o único das 11 referências que combina explicitamente desenvolvimento de shaders GLSL de áudio com assistência de IA (LLM), tornando-o um par direto deste projeto.  
→ **Sugestão de reformulação:** "O desenvolvimento deste projeto foi realizado com auxílio do Claude Code (Anthropic) — seguindo uma tendência documentada de uso de LLMs para desenvolvimento de shaders e sistemas de visualização de áudio (YUKSEL; SAWAF, 2025) —, uma ferramenta de IA integrada ao terminal de linha de comando."

---

**[STRONG]** Seção 4.3 — Sistema de Paletas de Cores  
> "Espectrograma: Mapa de calor (roxo → amarelo), referenciando o padrão de cores do matplotlib."  
→ **Cite como:** (YUKSEL; SAWAF, 2025) — o AI Co-Artist implementa paletas de cores para visualização de áudio em GLSL, validando a escolha de mapas de calor específicos por tipo de representação.  
→ **Sugestão de reformulação:** "Espectrograma: Mapa de calor (roxo → amarelo), referenciando o padrão de cores do matplotlib — uma escolha de paleta consistente com o uso de gradientes espectrais em sistemas de visualização de áudio em tempo real (YUKSEL; SAWAF, 2025)."

---

### Jaramillo e Sipiran (2024) — Cultural Heritage 3D Reconstruction with Diffusion Networks

> Relevância declarada no INDEX: aplica IA generativa para restaurar objetos 3D de patrimônio cultural — contextualiza o uso de modelagem 3D para preservar artefatos indígenas.

---

**[MEDIUM]** Seção 1 — Introdução  
> "A intersecção entre tecnologia digital e patrimônio cultural é um campo crescente de pesquisa e desenvolvimento."  
→ **Cite como:** (JARAMILLO; SIPIRAN, 2024) — o paper exemplifica essa intersecção com aplicações concretas de reconstrução 3D de patrimônio cultural usando IA.  
→ **Sugestão de reformulação:** "A intersecção entre tecnologia digital e patrimônio cultural é um campo crescente de pesquisa e desenvolvimento (JARAMILLO; SIPIRAN, 2024)."

---

**[MEDIUM]** Seção 2.2 — Os Cinco Móveis  
> "Banco Mehinaku: Inspirado nos bancos artesanais do povo Mehinaku, povo indígena do Alto Xingu (Mato Grosso)." / "Banco Wauja: Inspirado nos bancos do povo Waujá, também do Alto Xingu."  
→ **Cite como:** (JARAMILLO; SIPIRAN, 2024) — o paper contextualiza a relevância de preservar e recriar digitalmente artefatos culturais de povos tradicionais, validando a escolha de modelar peças de mobiliário indígena.  
→ **Sugestão de reformulação:** "Banco Mehinaku: Inspirado nos bancos artesanais do povo Mehinaku, povo indígena do Alto Xingu (Mato Grosso) — um exemplo de como artefatos de patrimônio cultural indígena podem ser preservados por meio da modelagem 3D digital (JARAMILLO; SIPIRAN, 2024)."

---

### Dahaghin et al. (2024) — Gaussian Heritage: 3D Digitization of Cultural Heritage

> Relevância declarada no INDEX: apresenta pipeline para criar réplicas digitais precisas de artefatos físicos a partir de fotos — apoia o argumento de digitalização 3D de móveis indígenas como ferramenta de preservação acessível.

---

**[MEDIUM]** Seção 10 — Conclusão  
> "Este artigo apresentou o desenvolvimento de uma aplicação web interativa que une modelagem 3D paramétrica, visualização de sinais de áudio e referências ao design cultural indígena brasileiro."  
→ **Cite como:** (DAHAGHIN et al., 2024) — o paper apresenta pipeline de digitalização 3D de patrimônio cultural como ferramenta acessível, contextualizando a contribuição deste projeto.  
→ **Sugestão de reformulação:** "Este artigo apresentou o desenvolvimento de uma aplicação web interativa que une modelagem 3D paramétrica, visualização de sinais de áudio e referências ao design cultural indígena brasileiro — contribuindo para o campo de digitalização e preservação digital de patrimônio cultural (DAHAGHIN et al., 2024)."

---

**[MEDIUM]** Seção 9 — Trabalhos Futuros  
> "Áudio real: Substituir as funções matemáticas simuladas por análise de um arquivo de áudio real (Web Audio API)."  
→ **Cite como:** (DAHAGHIN et al., 2024) — o paper descreve técnicas de captura e processamento de dados reais para representações digitais de alta fidelidade, contextualizando o gap entre a simulação atual e o objetivo de processar dados reais.  
→ **Sugestão de reformulação:** "Áudio real: Substituir as funções matemáticas simuladas por análise de um arquivo de áudio real (Web Audio API) — avanço que aproximaria o sistema de abordagens de alta fidelidade na representação de dados reais para objetos digitais (DAHAGHIN et al., 2024)."

---

### Amico e Felicetti (2024) — 3D Data Long-Term Preservation in Cultural Heritage

> Relevância declarada no INDEX: trata de preservação sustentável de dados 3D de patrimônio cultural com princípios FAIR e formatos abertos — apoia diretamente a escolha de exportar em STL e OBJ.

---

**[STRONG]** Seção 2.4 — O que o Usuário Pode Fazer?  
> "Exportação: Download do modelo em formato STL (para impressão 3D) ou OBJ (para uso em software 3D como Blender)."  
→ **Cite como:** (AMICO; FELICETTI, 2024) — o paper defende explicitamente o uso de formatos 3D abertos (como STL e OBJ) para garantir acessibilidade e preservação a longo prazo de dados de patrimônio cultural.  
→ **Sugestão de reformulação:** "Exportação: Download do modelo em formato STL (para impressão 3D) ou OBJ (para uso em software 3D como Blender) — formatos abertos que, segundo Amico e Felicetti (2024), são recomendados para garantir a preservação e interoperabilidade a longo prazo de dados 3D de patrimônio cultural."

---

**[STRONG]** Seção 9 — Trabalhos Futuros  
> "Performance em dispositivos móveis: A renderização de 1.600+ segmentos em dispositivos com GPU integrada pode ser otimizada com `InstancedMesh` do Three.js, que renderiza múltiplas cópias da mesma geometria em uma única chamada à GPU."  
→ **Cite como:** (AMICO; FELICETTI, 2024) — o paper discute desafios técnicos de acessibilidade e sustentabilidade em sistemas de visualização 3D de patrimônio cultural, contextualizando a necessidade de otimização para dispositivos de menor capacidade.  
→ **Sugestão de reformulação:** "Performance em dispositivos móveis: A renderização de 1.600+ segmentos em dispositivos com GPU integrada pode ser otimizada — uma preocupação de acessibilidade e sustentabilidade da experiência digital, alinhada aos princípios discutidos por Amico e Felicetti (2024) para preservação de dados 3D de patrimônio cultural."

---

**[STRONG]** Seção 10 — Conclusão  
> "O deploy gratuito na Vercel demonstrou que a publicação de projetos acadêmicos e experimentais na internet está ao alcance de qualquer estudante, sem custo financeiro e com configuração mínima."  
→ **Cite como:** (AMICO; FELICETTI, 2024) — o paper enfatiza a importância de soluções acessíveis e de baixo custo para preservação e acesso a dados 3D de patrimônio cultural.  
→ **Sugestão de reformulação:** "O deploy gratuito na Vercel demonstrou que a publicação de projetos acadêmicos e experimentais na internet está ao alcance de qualquer estudante — em linha com o argumento de Amico e Felicetti (2024) sobre a necessidade de infraestruturas acessíveis para preservação e difusão de dados 3D de patrimônio cultural."

---

## Gaps — Claims Needing Additional References

As seguintes afirmações no artigo fazem claims relevantes que **não são cobertas por nenhum dos 11 papers disponíveis** e precisam de referências adicionais:

---

**Gap 1 — Three.js como biblioteca de renderização 3D para web**  
> Seção 3.1: "O Three.js foi escolhido por ser a biblioteca JavaScript mais madura para renderização 3D no navegador, com ampla documentação e comunidade ativa."  
→ **Necessidade:** Referência técnica primária ao Three.js. O artigo já cita Danchilla (2013) nas Referências, mas esta obra tem 13 anos. Uma citação ao próprio repositório ou documentação oficial do Three.js (three.js.org) ou um artigo mais recente que valide seu uso atual seria ideal.  
→ **Busca sugerida:** "Three.js WebGL rendering performance 2020–2025" ou documentação oficial.

---

**Gap 2 — FFT como algoritmo de decomposição de frequências**  
> Seção 4.1.2: "A FFT (Fast Fourier Transform) decompõe um sinal sonoro em suas frequências constituintes."  
→ **Necessidade:** O artigo cita Cooley e Tukey (1965) nas Referências mas não inline no texto. Esta citação deveria aparecer inline nesta passagem para dar crédito formal ao algoritmo.  
→ **Ação:** Inserir `(COOLEY; TUKEY, 1965)` diretamente após a definição de FFT nesta seção.

---

**Gap 3 — STFT (Short-Time Fourier Transform) para espectrograma**  
> Seção 4.1.3: "O espectrograma combina as duas representações anteriores em uma 'imagem' bidimensional..."  
→ **Necessidade:** Referência ao fundamento matemático da STFT. O artigo cita Oppenheim e Schafer (2009) nas Referências mas não inline. Inserir `(OPPENHEIM; SCHAFER, 2009)` nesta seção tornaria a citação funcional.  
→ **Ação:** Inserir `(OPPENHEIM; SCHAFER, 2009)` na definição formal da STFT.

---

**Gap 4 — Decaimento exponencial de espectros de áudio**  
> Seção 4.1.2: "O uso da função exponencial `exp(-k * x)` é matematicamente preciso: espectros de áudio reais tipicamente apresentam decaimento exponencial da energia com o aumento da frequência."  
→ **Necessidade:** Esta é uma afirmação técnica forte sobre o comportamento de espectros de áudio reais que requer suporte bibliográfico explícito (além do que Cooley & Tukey e Oppenheim & Schafer fornecem). Nenhum dos 11 papers aborda especificamente esse fenômeno físico-matemático.  
→ **Busca sugerida:** Livros de processamento de sinais de áudio, psicoacústica, ou o próprio Oppenheim & Schafer (já listado).

---

**Gap 5 — React Context API como padrão de gerenciamento de estado**  
> Seção 3.3: "O estado global da aplicação é gerenciado por meio do padrão React Context API..."  
→ **Necessidade:** A documentação oficial do React ou um artigo sobre arquitetura de aplicações React. Nenhum dos 11 papers cobre gerenciamento de estado em React.  
→ **Busca sugerida:** Documentação oficial React (react.dev) ou artigo sobre arquitetura de componentes React.

---

**Gap 6 — Povos Mehinaku e Wauja — referência cultural**  
> Seção 2.2: "Banco Mehinaku: Inspirado nos bancos artesanais do povo Mehinaku, povo indígena do Alto Xingu (Mato Grosso)" e "Banco Wauja: Inspirado nos bancos do povo Waujá, também do Alto Xingu."  
→ **Necessidade:** O artigo já cita Cabral (2019) nas Referências mas não inline no texto. Mais importante: uma referência etnográfica ou antropológica específica aos povos Mehinaku e Wauja e seus artefatos seria essencial para uma afirmação de inspiração cultural explícita. Nenhum dos 11 papers cobre cultura indígena brasileira.  
→ **Ação prioritária:** Inserir `(CABRAL, 2019)` inline nas descrições dos bancos. Buscar referências adicionais etnográficas.

---

**Gap 7 — WebGL como tecnologia de renderização GPU no browser**  
> Seção 3.4 (implícito): O artigo menciona "WebGL do navegador" como contexto de renderização do Three.js.  
→ **Necessidade:** Uma referência técnica ao WebGL (Khronos Group ou artigo relacionado) contextualizaria a afirmação de renderização GPU no navegador.  
→ **Busca sugerida:** Khronos WebGL specification ou artigo de survey sobre WebGL para visualização científica.

---

## Article Sections Ranking by Citation Density

### Seções mais enriquecidas (alta densidade de oportunidades)

| Ranking | Seção | Oportunidades Mapeadas | Observação |
|---------|-------|----------------------|------------|
| 1 | Seção 4 — Algoritmos de Visualização de Áudio | 9 oportunidades | Núcleo técnico; suportado por Graf, Mehdi, Blume, Panda, Yuksel |
| 2 | Seção 3 — Arquitetura Técnica | 6 oportunidades | Stack tecnológico; suportado por Mehdi, Raji, Sasso, Yuksel |
| 3 | Seção 1 — Introdução | 4 oportunidades | Claims contextuais; suportado por Graf, Blume, Jaramillo |
| 4 | Seção 5 — Desenvolvimento com IA | 3 oportunidades | Suportado por Ko, Yuksel |
| 5 | Seção 10 — Conclusão | 3 oportunidades | Suportado por Ko, Dahaghin, Amico |

### Seções mais nuas (poucos apoios bibliográficos disponíveis)

| Ranking | Seção | Problema | Ação Recomendada |
|---------|-------|----------|-----------------|
| 1 | Seção 6 — Deploy na Vercel | 0 oportunidades nos 11 papers | Buscar referências sobre CDN, edge computing ou JAMstack |
| 2 | Seção 7 — Análise de Custos | 0 oportunidades | Buscar artigos sobre cloud hosting para projetos acadêmicos |
| 3 | Seção 8 — Resultados e Validação | 0 oportunidades nos 11 papers | Claims de QA e TypeScript sem suporte bibliográfico |
| 4 | Seção 2 — Visão para Todos os Públicos | 2 oportunidades (parcial) | Citações inline de Cabral (2019) ausentes |

---

## Resumo de Ações Prioritárias

1. **Ação imediata — citações já nas Referências mas não inline:** Inserir `(COOLEY; TUKEY, 1965)` na Seção 4.1.2, `(OPPENHEIM; SCHAFER, 2009)` na Seção 4.1.3, e `(CABRAL, 2019)` nas descrições dos bancos indígenas na Seção 2.2.

2. **Seção 4 — Enriquecimento prioritário:** Esta seção tem o maior potencial de citações. Adicionar Graf (2021), Mehdi (2026), Panda (2021) e Yuksel (2025) elevaria significativamente a densidade bibliográfica do núcleo técnico.

3. **Seção 1 — Introdução:** Blume (2025) e Jaramillo (2024) podem ser inseridos na abertura para fundamentar os dois eixos do trabalho (visualização de áudio + patrimônio cultural).

4. **Seção 3.5 — Shaders:** Sasso (2023) e Yuksel (2025) devem ser citados na discussão sobre shaders GLSL, que atualmente não tem nenhuma referência inline.

5. **Gaps prioritários a buscar:** FFT inline (já existe nas Referências), referência etnográfica Mehinaku/Wauja inline, e referência a Three.js mais recente que Danchilla (2013).
