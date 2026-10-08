# Primeira Aventura

Ficha de personagem simplificada para apresentar RPG a quem nunca jogou. Cada pessoa abre o link no celular, cria o personagem e rola os dados pela ficha enquanto você narra.

Site estático (HTML, CSS e JS puros), sem build e sem servidor. O personagem fica salvo no navegador do celular.

## Rodar localmente

```sh
python3 -m http.server 8000   # abra http://localhost:8000
node --test                   # testes das regras
```

## Publicar (GitHub Pages)

1. Crie um repositório e envie esta pasta.
2. Settings → Pages → Source: "Deploy from a branch", branch `main`, pasta `/ (root)`.
3. O link fica `https://<usuario>.github.io/<repositorio>/`. Vale gerar um QR code dele para projetar na palestra.

## Regras (cola para quem mestra)

**Teste:** role 1d6 + atributo e tente alcançar o alvo que você anunciar: **4 fácil**, **6 normal**, **8 difícil**. Um 6 natural é crítico e um 1 natural é "ops...".

**Iniciativa:** no começo de um combate, todo mundo toca em "Rolar iniciativa" (1d6 + DES). Quem tirar mais age primeiro.

| Classe | FOR | DES | CON | MAG | PV | Habilidade (1x por cena) |
|---|---|---|---|---|---|---|
| Bárbaro | +2 | +0 | +1 | +0 | 8 | Fúria: +2 na próxima rolagem de FOR |
| Guerreiro | +1 | +0 | +2 | +0 | 10 | Fôlego: recupera 1d6 PV |
| Ladino | +0 | +2 | +1 | +0 | 8 | Nas Sombras: próxima rolagem de DES usa 2 dados e fica com o maior |
| Mago | +0 | +0 | +1 | +2 | 8 | Sobrecarga Arcana: +3 na próxima rolagem de MAG, mas perde 2 PV na hora |
| Clérigo | +1 | +0 | +1 | +1 | 8 | Cura: aliado recupera 1d6 + MAG PV |

A ocupação dá +1 em um atributo (máximo +3) e os PV ficam em 6 + 2×CON, então uma ocupação de CON aumenta os PV acima.

| Ocupação | Bônus |
|---|---|
| Ferreiro(a), Guarda | +1 FOR |
| Entregador(a), Malabarista | +1 DES |
| Pescador(a), Pedreiro(a) | +1 CON |
| Estudante, Artista de rua | +1 MAG |

"Recarregar" a habilidade fica a seu critério: no começo de cada cena, peça para todo mundo tocar em "recarregar".

Para mudar classes, ocupações ou números, edite apenas `rules.js` e rode `node --test`.
