# MURRINHA — O Gazeador
### Game Design Document — v1.0

> Um jogo de plataforma 16-bits sobre gazear aula no centro de Campina Grande,
> nos anos em que a Praça da Bandeira era o centro do universo.
> Inspiração: Super Mario World (SNES) + *Curtindo a Vida Adoidado*.

---

## 1. Visão geral

| | |
|---|---|
| **Título** | MURRINHA — O Gazeador |
| **Gênero** | Plataforma 2D side-scroll, 16-bits, com mapa-múndi |
| **Plataforma** | Browser (mobile-first) + PWA instalável (tela cheia) |
| **Orientação** | Paisagem (landscape) |
| **Resolução interna** | 320×180 pixels, escalada com `image-rendering: pixelated` |
| **Tecnologia** | HTML5 Canvas + JavaScript puro (zero dependências), Web Audio API |
| **Arte** | Pixel art 100% desenhada em código |
| **Áudio** | Chiptune gerado em código (Web Audio) |
| **Idioma** | Português (humor nordestino) |
| **Público** | O autor, seus amigos de infância, e quem gazeou aula nos anos 90 |

### Premissa
Murrinha, aluno do CAD (Colégio Alfredo Dantas), decide que hoje **não vai
assistir aula**. Ele precisa gazear o dia inteiro no centro de Campina Grande —
escapando de Vanita (a diretora), dos pombos da praça, de Ratinho, do Cacimba,
do palhaço Carrapeta e de todos os perigos do centro — até chegar a hora certa
de pegar o ônibus lotado e voltar pra casa como se nada tivesse acontecido.
Os pais **jamais** podem saber.

---

## 2. Mecânicas centrais

### Movimento (estilo Mario World)
- **Andar / Correr** — botão B segura para correr (velocidade ~1.6×)
- **Pulo variável** — segurar A pula mais alto; física com aceleração/atrito
- **Pisão** — pular na cabeça de certos inimigos os derrota (trombadinhas)
- Inimigos "de autoridade" (Vanita, Bené, fiscal) **não podem ser pisados** —
  encostar neles = pego = perde vida

### Vidas e game over
- Murrinha começa com **3 vidas**
- Levar dano (pego, cagada de pombo, carro, etc.) = perde 1 vida e volta ao
  **checkpoint** da fase (placa de "PARADA" no meio da fase)
- Game over = tela **"SUSPENSO! Seus pais foram chamados na diretoria."**
  e a fase recomeça

### Coletáveis e power-ups
| Item | Efeito |
|---|---|
| **Ficha telefônica** 🪙 | Moeda do jogo. 100 fichas = +1 vida |
| **Nota de dinheiro** 💵 | Vale 10 fichas de uma vez |
| **Chocolate (Brasileiras)** 🍫 | +1 vida (escondido nas fases) |
| **Maçã do lanche** 🍎 | Segura 1 susto no lugar do Murrinha (o "cogumelo" do jogo) |
| **Pipoca do Galego** 🍿 | Velocidade turbo por 8 segundos |
| **Ticket estudantil** 🎫 | 3 por fase, escondidos (estilo moedas-dragão). Colecionável de 100% |

### Progressão
- **Mapa-múndi** do centro de Campina Grande, estilo Super Mario World:
  Murrinha anda entre os locais por caminhos que se abrem ao vencer fases
- **Seleção livre**: toda fase já vencida (ou destravada) pode ser rejogada
  a qualquer momento — o jogo é um álbum de memórias, não uma prisão linear
- Progresso salvo em `localStorage` (fases vencidas, tickets, recorde de fichas)

### Controles
| Ação | Teclado | Touch (mobile) |
|---|---|---|
| Andar | ← → / A D | D-pad virtual (esquerda da tela) |
| Pular | Z / Espaço / ↑ | Botão **A** (direita) |
| Correr / Ação | X / Shift | Botão **B** (direita) |
| Pausar | Enter / Esc | Botão ⏸ (canto superior) |

---

## 3. Personagens

### Murrinha (jogador)
Aluno do CAD, 14 anos, astuto e carismático — o Ferris Bueller da Paraíba.
**Visual:** camisa branca gola V com golas/punhos vermelhos, 2 listras
vermelhas horizontais no tórax, "CAD" em vermelho na barriga, bermuda azul,
tênis branco, caderno debaixo do braço.

### Antagonistas / obstáculos
| Personagem | Comportamento no jogo |
|---|---|
| **Vanita** (diretora do CAD) | Algoz principal. Patrulha corredores; se vê Murrinha, acelera na direção dele. Intocável — encostou, pegou. |
| **Bené** (expetor das DAMAS) | Bigode + cabo de vassoura. Patrulha a frente das DAMAS varrendo o chão com o cabo (área de perigo baixa — exige pulo no tempo certo). |
| **Ratinho** (batedor de carteiras) | Persegue Murrinha em trechos de perseguição — corre atrás querendo o tênis. Mais rápido que andar, mais lento que correr. |
| **Trombadinhas** | Inimigos comuns (o "goomba" do jogo). Andam em grupo, podem ser pisados. Encostar = perdem-se fichas espalhadas pelo chão (estilo Sonic) na fase do ônibus. |
| **Cacimba** | No Playtime. Dança pelo salão em padrões; se encostar em Murrinha, começa a dançar coladinho e "hipnotiza" (perde vida). Solta beijos teleguiados lentos que devem ser desviados. |
| **Carrapeta** (palhaço) | Assovia "fiu-fiu": ondas sonoras circulares que se expandem. Ser tocado pela onda = Murrinha fica paralisado 2s (vulnerável). |
| **Pombos** | Empoleirados; quando Murrinha se aproxima, voam em linha soltando cagadas (projéteis em queda). |
| **Fiscal das Brasileiras** | Guarda com cone de visão (lanterna). Fase stealth: andar agachado atrás das araras de roupa. |
| **Tavinho Miranda** | Ombreiras + boné virado. Anda rápido de um lado pro outro; se te encosta, te "prende em conversa" (rouba segundos do timer). |

### Aliados / neutros
| Personagem | Papel |
|---|---|
| **Galego da Pipoca** | Vende pipoca turbo. Loiro encaracolado, camisa de botão. Ponto de dica/checkpoint social. |
| **Cego da Ficha** | Vende fichas telefônicas. Percebe tudo sem ver (estilo Demolidor) — dá dicas proféticas nas cutscenes. Vende a **ficha dourada** (invencibilidade 8s) por 30 fichas comuns. |
| **Gordo do Calçadão** | Neutro-obstáculo: anda devagar ocupando MUITO espaço da calçada. É plataforma móvel — dá pra subir nele e pegar itens altos. |
| **Alunos das DAMAS** | NPCs de cenário (camisa azul clara, listras azul escuras, "DAMAS" na barriga). |

---

## 4. Mundo — Mapa-múndi

Vista de cima do centro de Campina Grande, estilizada como o mapa do
Super Mario World. Nós conectados por caminhos pontilhados:

```
   [CAD]───[Praça dos Pombos]───[Brasileiras]
     │            │                   │
 [Playtime]  [Calçadão]        [Av. Floriano]
     │            │                   │
  [Livro 7]  [FISK/Galego]──────[Fila do Ônibus]
                                      │
                                [Ônibus Lotado]──▶ CASA (fim)
```

Cenografia do mapa: Praça da Bandeira ao centro (chão de ladrilho, árvores,
pombos animados, busto do fundador, Banca do Orlando), prédio da TELPA com
orelhões, Avenida Floriano Peixoto com carros passando, fachadas
reconhecíveis de cada local.

---

## 5. As Fases

> **F1 e F2 são construídas nesta primeira etapa.** As demais estão
> projetadas e aparecem no mapa como "EM BREVE" (cadeado).

### FASE 1 — "Fuga do CAD" 🦁
**Local:** interior do CAD → fachada brutalista com colunas vermelhas e leões.
**Cutscene:** Murrinha na porta da sala. *"Prova de matemática? Hoje não.
HOJE NÃO."* Vanita aparece no fim do corredor.
**Gameplay:** atravessar corredores da escola: pular carteiras empilhadas,
baldes de zelador, desviar de Vanita patrulhando (2 encontros — ela acelera
quando te vê). Trecho no pátio com muro. Final: sair pela porta principal
por baixo da marquise **entre os dois leões de pedra** — os leões são o
"portal" de fim de fase.
**Chefe? Não** — Vanita reaparece nas fases finais.

### FASE 2 — "Praça dos Pombos" 🐦
**Local:** Praça da Bandeira: ladrilho, bancos de alvenaria, árvores,
busto do fundador, Banca do Orlando, paradas de ônibus.
**Cutscene:** *"Livre! Agora é só atravessar a praça... sem levar uma
cagada na cabeça."* Um pombo encara Murrinha.
**Gameplay:** pombos empoleirados em fios e árvores decolam e bombardeiam;
trombadinhas patrulham em grupos (pisáveis); pular entre bancos, canteiros
e o teto da Banca do Orlando. Checkpoint na estátua do fundador.
Chocolate escondido no teto da banca.
**Final:** alcançar o outro lado da praça (placa da parada de ônibus).

### FASE 3 — "As Brasileiras" 🍫 *(stealth)*
Pegar o chocolate sem o fiscal ver. Cones de visão, esconder atrás de
araras, subir/descer pela **escada rolante** (a única da cidade!) — que
muda de direção sozinha. Alarme = Ratinho é atraído pra porta.

### FASE 4 — "Playtime" 🕹️ *(cyberpunk underground)*
Neon, fliperamas. Objetivo: jogar 3 fliperamas (pontos da fase) sem ser
alcançado por **Cacimba**, que dança pelo salão e solta beijos teleguiados.
Mini-easter-egg: cada fliperama roda um micro-minigame de 10 segundos.

### FASE 5 — "Calçadão" 🤡
Vendedores ambulantes, bancos de alvenaria, barracas. **Carrapeta** solta
ondas de assovio paralisantes; **Tavinho Miranda** cruza a tela em alta
velocidade tentando te prender em conversa; o **Gordo do Calçadão** anda
lento e vira plataforma móvel para alcançar o telhado das barracas.

### FASE 6 — "A Travessia da Floriano" 🚗 *(fase especial)*
Atravessar a avenida mais movimentada da cidade até os orelhões da TELPA —
seção vertical estilo Frogger dentro do motor de plataforma: ônibus, carros
e motos em faixas com velocidades diferentes. Comprar ficha com o Cego da
Ficha e ligar no orelhão (álibi com a mãe: *"Oi mãe, tô na escola!"*).

### FASE 7 — "FISK & o Galego" 🍿
Região da FISK. Bené patrulha a calçada das DAMAS no caminho. Minigame do
Galego: pegar pipocas que pulam da panela (chuva de pipoca) — cada 10
pipocas = 1 pipoca turbo pro inventário. Ratinho aparece na saída:
**perseguição em alta velocidade** (auto-scroll) pra não perder o tênis.

### FASE 8 — "A Fila do Ônibus" 🚌
Fim de tarde, sol laranja. Fila na porta traseira do ônibus cercada de
trombadinhas tentando bater sua carteira (spawn contínuo, pisão liberado).
Proteger a carteira até a porta = entrar no ônibus.

### FASE 9 — "O Ônibus Lotado" 🚍 *(fase final)*
Interior do ônibus em movimento: atravessar da porta traseira até a
dianteira por um corredor LOTADO. Passageiros balançam com as freadas
(o "terreno" se move), cobrador vira catraca-obstáculo, Ratinho fez a
mesma linha (!). Descer no ponto certo — passou do ponto = volta trecho.
**Cutscene final:** Murrinha desce, chega em casa, a mãe pergunta:
*"E a escola, meu filho?"* — *"Foi ótima, mãe."* Corta pra Vanita na
diretoria olhando a lista de faltas... **FIM** (com os créditos em
estilo SNES e estatísticas: fichas, tickets, vidas perdidas).

---

## 6. Direção de arte

- **Paleta:** cores chapadas e quentes estilo SNES (céu azul-claro,
  ladrilho laranja/terracota da praça, vermelho CAD, bege dos leões)
- **Tiles 16×16**, personagens 16×24, chefes/adultos 16×28
- **Fachadas fiéis às memórias:** CAD brutalista (colunas vermelhas, leões
  bege), DAMAS estilo convento com escadaria, Brasileiras verde-amarela,
  TELPA com orelhões, FISK branca com letreiro vermelho
- **HUD estilo Mario World:** vidas (rostinho do Murrinha ×N), contador de
  fichas, tickets da fase
- **Fonte:** bitmap 3×5 própria, maiúsculas

## 7. Áudio (chiptune Web Audio)

| Tema | Clima |
|---|---|
| Título | Jingle heroico-safado |
| Mapa | Caminhada tranquila (forró-chiptune sutil) |
| Fase CAD | Tenso-cômico (stealth de desenho animado) |
| Praça | Ensolarado e ligeiro |
| Playtime | Synthwave underground |
| Perseguição (Ratinho) | Acelerado, coração na boca |
| Ônibus | Balanço caótico |
| Vitória de fase | Jingle "aê!" |
| Game over | "Suspenso" — trombone triste 8-bit |

SFX: pulo, ficha (plim!), pisão, splat de cagada, assovio do Carrapeta,
beijo do Cacimba, apito da Vanita, buzina, sino de porta de loja.

## 8. Técnica

- **Motor próprio** em JS puro: loop fixo 60fps, tilemap ASCII, AABB,
  câmera com lookahead, sistema de entidades
- **PWA:** `manifest.webmanifest` (display fullscreen, orientation
  landscape) + Service Worker cache-first com versionamento
- **Sem rede, sem build, sem dependências** — arquivos estáticos puros
- **Deploy:** GitHub Pages
- **Save:** localStorage (progresso, recordes, tickets)

## 9. Roadmap

| Etapa | Conteúdo | Status |
|---|---|---|
| **1** | Motor + PWA + título + mapa-múndi + Fases 1 e 2 + áudio | ✅ pronto |
| **2** | Travessia da Floriano (tráfego) + itens novos + reforma visual | ✅ pronto |
| **3** | Brasileiras (escada rolante/fiscal) e Playtime (Cacimba) | ✅ pronto |
| **4** | Calçadão (Carrapeta/Gordo/Tavinho) | ✅ pronto |
| **5** | FISK/Galego (chuva de pipoca) + Ratinho | ✅ pronto |
| **6** | Ônibus (fila + lotado) + final + créditos | ✅ pronto |
| 7 | Polimento: tickets 100%, minigames do Playtime, speedrun timer | planejado |

**Todas as 9 fases jogáveis e validadas contra softlock por bot automatizado.**
Ondas do Carrapeta e o Tavinho são não-letais (paralisam, como no filme).
