# Axios Z

Galeria 3D interativa com profundidade e camadas, feita para rodar 100% no navegador, sem backend. Permite manipular imagens em camadas, ângulos, espaçamentos e animação de câmera, ideal para visualização, inspiração e gravação de tela.

## Demonstração
Abra o `index.html` no navegador ou rode um servidor local (ex: `python3 -m http.server`).

## Funcionalidades
- **Visualização 3D com profundidade** usando Three.js
- **Câmera animada** com efeito de voo pelo eixo Z
- **Imagens em camadas** com espaçamento ajustável nos eixos Z e X
- **Rotação 3D** (X, Y, Z) das imagens via sliders
- **Animações suaves** de entrada (GSAP)
- **Adicionar/remover imagens** por URL
- **Controle de cor de fundo**
- **Loop da animação**
- **Controle de velocidade**
- **Controle de escala das imagens**
- **Painel de controle minimalista** (toggle com Alt)
- **Atalhos de teclado**:
  - `Alt`: mostrar/ocultar botão do painel
  - `C`: abrir/fechar painel
  - `Espaço`: pausar/continuar animação
  - `A`/`S`: diminuir/aumentar velocidade
  - `R`: resetar configurações
  - `X`: restart da animação

## Tecnologias Utilizadas
- [Three.js](https://threejs.org/) — renderização 3D
- [GSAP](https://gsap.com/) — animações
- HTML5, CSS3 (moderno, responsivo)
- JavaScript puro (ES6+)

## Estrutura do Projeto
```
Axios-Z/
├── index.html
├── style.css
├── script.js
└── README.md
```

## Como rodar localmente
1. Clone o repositório:
   ```
   git clone https://github.com/Alex-luna/Axios-Z.git
   ```
2. Entre na pasta do projeto:
   ```
   cd Axios-Z
   ```
3. Abra o arquivo `index.html` no navegador
   - ou rode um servidor local:
     ```
     python3 -m http.server
     ```

## Licença
MIT
