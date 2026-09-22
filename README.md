# 🔒 Preverjanje varnosti gesel (Password Security Checker)

Spletno orodje za **ozaveščanje o varnosti gesel**, ki ga razvija Oddelek za kibernetsko
varnost **SRC d.o.o.** Uporabnik vpiše geslo in v realnem času dobi oceno moči, konkretne
predloge za izboljšanje ter realističen čas, ki bi ga napadalec potreboval za razbitje.

> ⚠️ **Namen orodja je izobraževalen.** Vsebuje tudi vgrajen preizkus socialnega inženiringa
> (glej [Izobraževalni popup](#-izobraževalni-popup)), zato **v orodje nikoli ne vpisujte
> svojih pravih gesel** – uporabite izmišljeno geslo.

---

## ✨ Funkcije

- **Ocena moči gesla v realnem času** – dolžina, uporabljene vrste znakov in entropija (v bitih).
- **Realističen čas razbitja** za 5 modelov napada: spletni napad (omejen/hiter),
  offline s počasnim hashom (bcrypt/argon2), offline GPU (MD5/SHA1) in gruča GPU.
- **Prepoznavanje šibkosti** – pogosta in slovarska gesla (tudi z zamenjavo črk s številkami,
  npr. `@` za `a`), zaporedja tipk (`qwertz`, `123`), ponavljanja (`aaa`) in letnice.
- **Preverjanje osebnih podatkov** – neobvezno polje za ime/priimek/vzdevek/letnico; orodje
  opozori, če jih geslo vsebuje (pogosta šibkost).
- **Generator močnih gesel** – kriptografsko varen (`crypto.getRandomValues`), z načinom
  naključnega gesla ali gesla-fraze (diceware slog v slovenščini).
- **Konkretna priporočila, kontrolni seznam in dosežki** za vzgojni učinek.
- **Izvoz PDF poročila** – z oceno, časi razbitja in priporočili (poročilo **ne vsebuje gesla**).
- **Svetla / temna tema.**

## 🔐 Zasebnost

Vsa analiza poteka **lokalno v brskalniku**. Geslo se **ne shranjuje in ne pošilja na strežnik** –
strežnik streže le statične strani. Prejšnja različica je geslo pošiljala prek POST; to je bilo
odpravljeno. Orodje ne uporablja piškotkov za sledenje in ne beleži vnosov.

## 🎭 Izobraževalni popup

Orodje vsebuje **preizkus socialnega inženiringa** za ozaveščanje zaposlenih:

- **20 sekund** po tem, ko uporabnik prvič začne vpisovati v polje za geslo, se pojavi opozorilo,
  ki v šali sporoči, da je bilo geslo »zabeleženo in poslano napadalcu«.
- Nato razkrije, da gre za **preizkus** in da geslo **ni bilo nikamor shranjeno ali poslano**.
- **Nauk:** nikoli ne vpisuj pravih gesel v spletne obrazce, ki jim ne zaupaš 100 %.

Popup se prikaže **enkrat na sejo** in **ne shrani nobenih podatkov** (brez `localStorage`,
`sessionStorage` ali piškotkov). Čas zamika lahko prilagodite s konstanto `DELAY_MS` v
`static/script.js`.

## 🚀 Zagon

### Flask različica
```bash
pip install flask
python app.py
# -> http://127.0.0.1:5000
```

### Samostojna različica
Odprite `preverjanje-gesel.html` neposredno v brskalniku – deluje brez strežnika
(vse je v eni datoteki).

## 🗂️ Struktura

```
app.py                  Flask strežnik (streže strani + varnostne glave)
templates/index.html    Glavna stran
templates/about.html    O projektu
static/style.css        Slog (svetla/temna tema)
static/script.js        Analiza gesla, generator, izobraževalni popup
static/image.png        SRC logo
```

## 🧮 Kako deluje ocena

Moč gesla ocenimo z **entropijo** (dolžina × log₂ velikosti nabora znakov), od katere odštejemo
kazni za prepoznane šibkosti (pogosta/slovarska gesla, zaporedja, ponavljanja, letnice, osebni
podatki, prekratka gesla). Iz efektivne entropije ocenimo število potrebnih ugibanj in ga
pretvorimo v čas razbitja za več realističnih hitrosti strojne opreme.

Ocena je **informativna** in namenjena ozaveščanju, ne kot dokončna garancija varnosti.

## 🔒 Varnostne glave

Flask nastavi `Content-Security-Policy`, `X-Frame-Options`, `X-Content-Type-Options` in
`Referrer-Policy`.

## 🛡️ Odgovorna uporaba

To orodje razvija Oddelek za kibernetsko varnost SRC d.o.o. za interno ozaveščanje in
izobraževanje zaposlenih ter strank. Ni namenjeno zbiranju gesel.

---

*Projekt razvija Oddelek za kibernetsko varnost **SRC d.o.o.***
