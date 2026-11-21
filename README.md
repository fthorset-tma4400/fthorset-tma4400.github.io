# TMA4400 Matematikk 1: interaktivt kompendium

Kompendium i **TMA4400 Matematikk 1: Kalkulus og lineær algebra** ved NTNU, høsten 2026.

**Les det her: <https://fthorset-tma4400.github.io>**

Kompendiet er laget av en student til eksamensforberedelse. Det er ikke offisielt NTNU-materiell. Pensum, fremdriftsplan og eksamensinformasjon finner du på [emnesiden på wiki](https://wiki.math.ntnu.no/tma4400/2026h/start).

## Innhold

| Del | Moduler |
|---|---|
| Lineær algebra | Lineære ligningssystemer · Matriser og LU-faktorisering · Determinanter og egenverdier |
| Følger, kontinuitet og derivasjon | Følger · Kontinuitet · Derivasjon · Funksjonsdrøfting |
| Integrasjon | Det bestemte integralet · Integrasjonsteknikker · Anvendelser av integralet |
| Numeriske metoder | Taylors teorem og feilanalyse · Ligningsløsning |
| Differensialligninger og komplekse tall | Første ordens · Komplekse tall · Andre ordens · Eulers metoder |

Hver modul har læringsmål, gjennomregnede eksempler, eksamensoppgaver med løsning, kontrollspørsmål og en oppsummering. I tillegg har kompendiet:

- en leseplan frem mot eksamen 1. desember 2026
- formelsamling, begrepsliste og flashcards
- interaktive simuleringer av Riemannsummer, Newtons metode, Eulers metoder, egenvektorer og ε–N for følger
- eksamensoppgaver fra TMA4400 (kont V26, H25 og prøveeksamen H25) og relevante oppgaver fra det eldre emnet TMA4100, med lenker til oppgavesett og løsningsforslag

Det deles ikke ut formelark på eksamen i TMA4400, så formelsamlingen viser hva du må kunne utenat.

## Kjøre lokalt

Du trenger Node 22 og pnpm.

```bash
pnpm install
pnpm dev       # forhåndsvisning på http://localhost:4321
pnpm build     # statisk side i dist/
pnpm preview   # forhåndsvis bygget (søk virker bare her)
```

Siden bygges og publiseres automatisk til GitHub Pages ved hver push til `main` (`.github/workflows/deploy.yml`).

## Oppbygning

Kompendiet er bygget på [StudyCompanion](https://github.com/MartinSA04/StudyCompanion) v5.2.0, som står for all design, alle sider og alle widgeter. Repoet inneholder bare innholdet:

- `content/course.yaml`: emnedata, eksamen, tidligere eksamener, formler og begreper
- `content/flashcards.yaml`: flashcards
- `content/sections/*.mdx`: én fil per modul
- `public/sims/` og `public/figures/`: simuleringer og figurer
- `theme/apple.css`: eget fargetema oppå rammeverket

Har du funnet en feil, kan du opprette en [issue](https://github.com/fthorset-tma4400/fthorset-tma4400.github.io/issues).

## Lisens

Innholdet er lisensiert under [CC BY 4.0](LICENSE). Eksamensoppgavene som siteres, tilhører NTNU, og det lenkes til originalene på wiki.math.ntnu.no.
