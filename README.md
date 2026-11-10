# Мапа света

Edukativna interaktivna mapa sveta za decu (srpska ćirilica, landscape, tablet). Instalira se kao aplikacija (PWA) i radi bez interneta.

Adresa: https://alecfleurs.github.io/mapa-sveta/

## Šta ima (v1)

- Istraživač: Robinson mapa sa zumiranjem prstima, 195 država (193 članice UN, Vatikan, Palestina), kartice sa zastavom, glavnim gradom, površinom, brojem stanovnika, susedima i rekama.
- Kontinenti, okeani i 36 velikih reka sa karticama.
- Zvezdice za svako novo otkriće i činovi (Путник, Истраживач, Морепловац, Капетан, Пилот, Глобтротер).
- Igre dolaze u sledećoj verziji.

## Struktura

- `src/` izvorni kod (CSS, mapa, istraživač, početna)
- `tools/sr-data.js` srpski nazivi, glavni gradovi na ćirilici, činjenice sa izvorima
- `tools/prep-data.js` pravi `data/world.json` i `data/flags.json` iz izvornih skupova
- `tools/build.js` spaja sve u jedan HTML i pravi PWA (`index.html`, `manifest.webmanifest`, `sw.js`, ikonice)
- `tools/test.js` Playwright provera na 1280×800, 1280×720 i 1024×600

Nova verzija: podići `VERSION` u `tools/build.js` (npr. `ms-v1` u `ms-v2`), pokrenuti build i kopirati `dist/*` u koren.

## Izvori i licence

- Natural Earth (naturalearthdata.com), javno dobro: oblici država, reke, jezera, koordinate glavnih gradova, broj stanovnika (procena 2019).
- mledoze/countries (github.com/mledoze/countries), ODbL 1.0: nazivi, glavni gradovi, površina, susedi. Izvedeni podaci u `data/world.json` su pod istom licencom.
- flag-icons (github.com/lipis/flag-icons), MIT: zastave.
- Granice prikazane prema međunarodno priznatom stanju kako ga vodi Republika Srbija.
