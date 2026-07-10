# SAI — Plataforma de Sinais para Trade de Bitcoin
### Conceito de ponta a ponta

> Este documento consolida, de forma ordenada e didática, tudo o que discutimos.
> Ele descreve **o conceito** da plataforma — não é código, é o mapa que orienta
> qualquer construção futura. A ordem dos capítulos é proposital: cada um se apoia
> no anterior.

---

## Como ler este documento

São 12 capítulos, agrupados em três blocos:

1. **Fundamentos** (caps. 1–3) — a filosofia e o objetivo correto.
2. **O motor de pesquisa** (caps. 4–7) — como a plataforma descobre e valida o que funciona.
3. **A plataforma em operação** (caps. 8–12) — como ela decide, opera e sobrevive.

No fim há um **fluxo de ponta a ponta** que amarra tudo num único diagrama textual.

---

# Bloco I — Fundamentos

## 1. O que é o SAI (em uma frase)

O SAI é um **sistema de pesquisa quantitativa que gera sinais de trade por
probabilidade** — não um robô de indicador. Ele tem duas camadas:

- **Laboratório offline:** descobre fatores, valida estatisticamente, monta os modelos.
- **Motor de sinais em tempo real:** aplica só o que foi validado e emite o sinal.

O objetivo dele **não** é gritar "compre/venda", e sim responder três perguntas:
*(1) pra onde provavelmente vai, (2) vale a pena operar agora, (3) quanto apostar e como sair.*

---

## 2. O erro de partida que evitamos

A pergunta natural é "em quais indicadores me baseio?". É a pergunta errada pra começar.

Indicador (RSI, MACD, Bollinger...) é só uma **régua que mede** alguma coisa. RSI mede
esticada; ATR mede volatilidade; MACD mede momentum. Nenhum deles é uma estratégia.
Começar por indicador é escolher a ferramenta antes de saber o que se quer medir.

A ordem correta é:

1. **De onde vem o lucro** (a vantagem / o *edge*).
2. **O que controla o resultado** (risco, saída e custo).
3. **Só então os indicadores** — como sensores dessas duas coisas.

---

## 3. O objetivo correto: crescimento composto sob restrição de perda

"Maior lucro possível" é uma bússola perigosa — empurra pra alavancagem e ruína.
A tradução correta do que realmente maximiza o dinheiro no fim do período é:

> **Maximizar a taxa de crescimento composto que sobrevive aos tombos.**

Motivo aritmético: quem cai −50% precisa de +100% só pra empatar. Uma estratégia que
ganha *um pouco menos* por trade, mas quase nunca toma um drawdown feio, termina com
**muito mais dinheiro** do que uma agressiva de voos e quedas. Logo, a função-objetivo
é **crescimento composto com um teto de perda máxima** — não lucro bruto por trade.

**Princípio-chave:** a entrada é superestimada; **saída e tamanho da posição** são o que
decidem o resultado. E **assimetria > taxa de acerto** — acertar 40% ganhando 3× o que
se perde bate acertar 60% ganhando 1×.

---

# Bloco II — O motor de pesquisa

## 4. Como a pesquisa funciona (a lição central)

Existe a tentação de estudar "o que veio antes das subidas". O instinto é bom (aprender
com os resultados), mas contém uma **armadilha fatal**: olhar só os movimentos que deram
certo é **selecionar pelos vencedores**.

- Estudar só as subidas mede **P(sinal | subiu)** — "como era o cenário antes das subidas".
- Pra operar você precisa de **P(subiu | sinal)** — "quando vejo o sinal, qual a chance de subir".
- **São números diferentes.** Um sinal pode estar presente em 100% das subidas e ser
  inútil, se também estiver em 100% das *não*-subidas.

**Correção:** sempre incluir os casos negativos (as vezes em que o sinal apareceu e nada
aconteceu). No instante em que você faz isso, "de trás pra frente" e "pra frente" viram
**a mesma coisa**. O eixo real não é a direção, é:

- **Descoberta** (gerar hipóteses — olhar os movimentos é ótimo pra isso) **→**
- **Validação** (provar hipóteses — com os negativos incluídos, fora da amostra).

Descoberta pra trás, validação pra frente. Nessa ordem.

---

## 5. O tijolo do laboratório: a tabela "situação → desfecho"

Todo o motor de pesquisa se reduz a construir e estudar uma tabela:

1. Para **cada instante** histórico, congela-se o **vetor de características** conhecido
   *naquele momento* (sem espiar o futuro — evitar *lookahead* é regra sagrada).
2. Registra-se o **desfecho** ao longo dos próximos N candles: bateu o alvo? o stop?
   quanto andou a favor e contra?

Isso vira uma tabela "situação → desfecho" para **todos** os instantes (os que viraram
movimento **e os que não viraram**). É aprendizado supervisionado puro: o rótulo é o
futuro, as features são os antecedentes.

O que se extrai dela:

- **Taxa-base vs taxa condicional (o *lift*):** normalmente acerto X%; quando a feature Y
  está presente, acerto Z%. Se Z não for claramente maior, Y é decoração.
- **MAE e MFE** — a resposta para "quando sair":
  - **MAE** (excursão adversa máxima): o quanto o trade foi contra antes de dar certo →
    diz **quão perto o stop pode ficar** sem matar os trades bons.
  - **MFE** (excursão favorável máxima): o quanto foi a favor antes de virar → diz **onde
    tirar o lucro**. A saída vira **dado aprendido**, não chute.
- **Distribuição** dos retornos (não só a média), **estabilidade** no tempo/regime, e
  **tamanho de amostra** (o filtro que separa edge de sorte).

---

## 6. A camada de dados: o que é possível medir

Princípio que organiza tudo: **dado reconstruível depois do fato** vs **estado que só
existiu ao vivo e precisava ter sido gravado**. O primeiro é barato e completo; o segundo,
se ninguém arquivou, **não volta**.

**🟢 Backtestável de verdade e grátis**
- Candles 1m (dumps da Binance, desde ~2019) • Funding rate histórico • Trades → fluxo/CVD/delta
- Macro (datas/resultados via FRED — poucos eventos) • Fluxo de ETF (só desde 2024, história curta)
- Ferramenta pra puxar: **CCXT**

**🟡 Existe, mas pago ou só coletando a partir de agora**
- Open Interest histórico granular • Long/short ratio • On-chain premium (Glassnode/CryptoQuant)
- Livro de ofertas histórico (Tardis.dev/Kaiko)

**🔴 Praticamente inviável de validar honestamente**
- Liquidações brutas (feed capado desde abr/2021) • **Mapa de stop/liquidação** (é um
  *modelo estimado*, não um registro — e stop nunca é observável, nem ao vivo)

**Consequência:** o núcleo se constrói sobre o "chão firme" (verde). Os dados mais
"empolgantes" (caça a stops) são justamente os que **não dá pra provar** — então eles não
mandam no sistema.

---

## 7. Os critérios e como pesá-los

Os critérios são avaliados como **candidatos**; o peso real é decidido pelos **dados**, e
**muda conforme o regime**. Os percentuais abaixo são apenas **priores** — a aposta inicial
de onde procurar, a ser sobrescrita pelo laboratório.

| Família de critério | Peso-prior | Por quê |
|---|---:|---|
| Regime / estrutura de tendência | 22% | Condiciona todos os outros — decide se um gatilho é compra ou armadilha |
| Volume e fluxo (delta/CVD) | 18% | Informação **independente do preço** e backtestável |
| Volatilidade / compressão | 15% | Movimentos grandes nascem de compressão; dimensiona stop e tamanho |
| Derivativos (funding + OI) | 15% | Melhor família exógena: combustível e posicionamento da multidão |
| Momentum / força recente | 13% | Tendências persistem; mas redundante com regime |
| Esticada / reversão (RSI, MFI) | 7% | Útil só condicionado ao regime; muito redundante entre si |
| Contexto temporal (sessão/hora/dia) | 5% | Real e barato, edge modesto |
| Macro / evento (CPI, FOMC) | 3% | Poucos eventos → pouca confiança estatística |
| Microestrutura / liquidação | 2% | Banco de reservas: não validável, entra só como contexto |

**Insight de redundância:** RSI, MFI, Bollinger, estocástico são todos funções do *mesmo
preço* — cinco cópias de quase a mesma informação. Já fluxo e funding trazem dados **novos**.
Por isso fluxo (18%) pesa mais que a família inteira de esticada (7%).

**Tratando o que não se pode medir:** um critério não-backtestável recebe **peso zero na
probabilidade calibrada** (por *shrinkage* — sem evidência, o peso correto é ~zero). Mas ele
não some: vai para a **camada de contexto/veto**, agindo sobre a *ação* (encurtar alvo,
reduzir tamanho, vetar), sempre exibido **separado** do número. Ele pode ganhar peso depois,
se (a) for **gravado a partir de agora** até formar amostra, ou (b) for trocado por um
**proxy mensurável** (ex.: liquidação ≈ função de OI+funding+preço).

---

# Bloco III — A plataforma em operação

## 8. A estrutura de múltiplos timeframes

Cada janela responde a uma pergunta diferente e passa o bastão para a seguinte:

- **4 horas — regime:** estamos em tendência, lateralização ou transição? Decide *quais*
  gatilhos valem.
- **1 hora — saúde da tendência:** o movimento é consistente, acelerado, ruidoso, comprimido?
- **15 minutos — timing:** apenas o momento fino de entrada.

A janela maior **condiciona** a menor: sem regime definido no 4h, o gatilho de 15m é ignorado.

---

## 9. A saída do sistema: probabilidade × payoff = valor esperado

Em vez de um "compre/venda" binário, o SAI emite **probabilidade** — que é honesta sobre a
incerteza, conversa com o tamanho da posição e é **verificável por calibração** (quando diz
60%, acerta perto de 60%?). A calibração é uma obsessão do sistema.

Mas probabilidade **sozinha não basta**. O que decide é:

> **probabilidade × payoff = valor esperado.** Idealmente, a *distribuição* de desfechos:
> "provável +2%, stop provável −0,8%, chance ~55%, expectativa positiva".

Probabilidade responde "vou acertar?". Valor esperado responde a pergunta certa: **"vale a
pena entrar?"**

---

## 10. As peças de plataforma (onde o dinheiro se decide)

Não são "indicadores" — são máquinas que transformam um gerador de sinais numa plataforma
de decisão completa:

- **Filtro de "não operar":** saber quando ficar de fora (liquidez baixa, sem regime claro).
  O melhor trade costuma ser nenhum.
- **Motor de dimensionamento:** *quanto* apostar (vol-targeting — posição menor quando o
  mercado está agitado; Kelly fracionado). Estabiliza a curva de capital.
- **Modelo de custo/slippage + "edge líquido":** todo edge é calculado **depois** de taxa,
  spread, funding e derrapagem. Separa fantasia de realidade.
- **Meta-camada (meta-labeling):** um modelo decide a direção; um segundo decide **se vale
  agir** e com que tamanho.
- **Monitor de decaimento de edge:** vigia cada fator ao vivo e avisa quando parar de
  funcionar (edge morre).
- **Governador de risco / kill-switch:** perda máxima diária, perdas seguidas, disjuntor.
  Infraestrutura de sobrevivência.

---

## 11. Informação nova que amplia a análise

Fontes que adicionam dimensões que os indicadores de preço não têm:

- **Contexto do mercado tradicional (risk-on/off):** correlação com S&P/Nasdaq, DXY, ouro.
  Grátis, independente, backtestável. Saber se o BTC está descolado já é meio caminho.
- **Prêmio spot vs perpétuo / "Coinbase premium":** quem está no comando — compra à vista
  (mais real) vs euforia alavancada (mais frágil).
- **Volatilidade implícita e skew de opções (Deribit/DVOL):** a **única fonte que olha pra
  frente** — quanto medo o mercado espera e pra que lado.
- **Calendário estrutural:** gaps de CME (tendem a ser preenchidos) e vencimentos de opções.

---

## 12. As verdades honestas (o que impede a auto-ilusão)

- **BTC intradiário é eficiente e adversarial.** Edge real é **raro e decai**. O modelo
  mental não é "achar o santo graal", é "achar uma vantagem modesta, blindar com risco,
  compor no tempo e nunca parar de pesquisar".
- **Overfitting é o inimigo nº 1.** Pesquisar milhares de fatores em história limitada
  *garante* falsos positivos. Antídotos: out-of-sample, walk-forward, correção para
  múltiplos testes, tamanho de amostra mínimo.
- **Não-estacionariedade:** a microestrutura do BTC muda (ETF, fluxo institucional). O que
  funcionou em 2020 pode estar morto — daí o laboratório contínuo e o monitor de decaimento.
- **A probabilidade só contém o que foi provado.** Tudo o que não se pode medir fica fora
  do número, como alerta — até merecer entrar.

---

# Fluxo de ponta a ponta

```
                    ┌──────────────────────────────────────────┐
                    │        CAMADA 1 — LABORATÓRIO OFFLINE       │
                    └──────────────────────────────────────────┘
   Dados (chão firme)      Descoberta            Validação
   candles, funding,   →   olhar movimentos  →   P(desfecho|sinal)
   OI, fluxo, macro        (gera hipóteses)      com negativos,
        │                                        fora da amostra
        │                                             │
        ▼                                             ▼
   tabela situação→desfecho ───────────────► seleção de fatores
   (features sem lookahead,                   (quem prova poder
    desfecho + MAE/MFE)                         preditivo sobrevive)
                                                      │
                                                      ▼
                                            pesos por regime +
                                            modelo calibrado
                    ┌──────────────────────────────────────────┐
                    │      CAMADA 2 — MOTOR DE SINAIS AO VIVO     │
                    └──────────────────────────────────────────┘
   4h regime → 1h saúde → 15m timing
        │
        ▼
   ┌─ Probabilidade calibrada (só fatores validados) ─┐
   │                    ×                              │
   │            payoff (MAE/MFE)                       │
   │                    =                              │
   │              VALOR ESPERADO                       │
   └───────────────────────┬───────────────────────────┘
                            │  (camada de contexto/veto age por fora:
                            │   liquidação, alertas — sem entrar no número)
                            ▼
        Pergunta 2: vale operar?  → filtro "não operar" + custo líquido
                            ▼
        Pergunta 3: quanto/como? → sizing (vol-target) + gestão de saída
                            ▼
                      SINAL EMITIDO
                            ▼
        Governador de risco (kill-switch)  +  Monitor de decaimento
                            ▼
              registro de tudo → volta para o laboratório
                     (aprendizado contínuo)
```

---

## Síntese em uma linha

**O SAI descobre padrões olhando os movimentos, prova cada um com os fracassos incluídos e
fora da amostra, combina só o que sobrevive num número calibrado de valor esperado, e cerca
esse número com filtros de "não operar", dimensionamento e sobrevivência — aprendendo
continuamente, porque todo edge decai.**
