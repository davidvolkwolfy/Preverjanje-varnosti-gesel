# SRC – Preverjanje varnosti gesel (nadgrajena Flask različica)

## Struktura
```
app.py                  Flask strežnik (streže strani + varnostne glave)
templates/index.html    Glavna stran
templates/about.html    O projektu
static/style.css        Slog (svetla/temna tema)
static/script.js        Vsa logika analize + generator (v brskalniku)
```

## Zagon
```bash
pip install flask
python app.py
# -> http://127.0.0.1:5000
```

## Kaj je novega
- **Izobraževalni popup (socialni inženiring):** 20 s po prvem vpisu v polje geslo se
  pojavi opozorilo, da je bilo geslo »poslano napadalcu«, nato razkrije, da gre za preizkus.
  Prikaže se enkrat na sejo in **ne shrani nobenih podatkov**. Čas: `DELAY_MS` v `script.js`.
- **SRC logo** sredinsko na vrhu; nov vrstni red sekcij: 1) vnos, 2) generator,
  3) kontrolni seznam + priporočila + dosežki, 4) ocena časa razbitja.
- **Preverjanje osebnih podatkov:** neobvezno polje za ime/priimek/vzdevek/letnico –
  aplikacija opozori, če jih geslo vsebuje (pogosta šibkost). Podatki ostanejo v brskalniku.
- **Izvoz PDF poročila:** gumb ustvari poročilo z oceno, časi razbitja in priporočili
  za awareness/dokazila – **poročilo ne vsebuje samega gesla.**
- **Zasebnost:** analiza se izvede v brskalniku – geslo se NE pošlje na strežnik (prej POST).
  Odstranjena so skrita polja (`zxcvbn_result`, `entropy`, `fulfilled_conditions` …).
- **Boljša ocena časa razbitja:** 5 realističnih scenarijev napada (spletni omejen/hiter,
  offline počasen/GPU/gruča) namesto ene številke.
- **Model moči:** entropija + prepoznavanje vzorcev (slovarska gesla tudi z zamenjavo
  črk s številkami, zaporedja tipk, ponavljanja, letnice) → efektivna entropija.
- **Varen generator:** `crypto.getRandomValues` (ne `Math.random`) + način geslo-fraza
  (diceware slog v slovenščini).
- **Konkretna priporočila** glede na dejanske šibkosti + živ kontrolni seznam + dosežki.
- **Varnostne glave:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.

## Opomba glede `zxcvbn.js`
Prvotna aplikacija je vključevala `static/zxcvbn.js`. Nova različica ima lasten model in ga
ne potrebuje – lahko ga izbrišete. Če želite zxcvbn obdržati za še natančnejše ocene,
ga lahko dodamo kot dodaten vir ugibanj.
