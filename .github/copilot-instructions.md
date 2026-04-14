# StudyTogether — Copilot Instructions

## Cos'è questo repository

La specifica dei requisiti software (SRS) dell'applicazione **StudyTogether**, in formato AsciiDoc (`srs.adoc`).  
L'app è sviluppata interamente su **AppLab di Code.org**: un ambiente browser-based con database integrato, ottimizzato per smartphone (320×450 px, touch-first).

Per generare l'output, installa i gem necessari (una volta sola):

```bash
gem install asciidoctor asciidoctor-diagram asciidoctor-diagram-plantuml asciidoctor-pdf
```

Poi compila:

```bash
asciidoctor -r asciidoctor-diagram srs.adoc        # → srs.html + images/*.svg
asciidoctor-pdf -r asciidoctor-diagram srs.adoc    # → srs.pdf
```

I diagrammi SVG vengono generati nella cartella `images/` (richiede Java in `$PATH`).

---

## Piattaforma: vincoli AppLab

- Linguaggio: **JavaScript ES6** nell'interprete AppLab — no `import`, no `require`, no librerie esterne.
- UI: schermate progettate in **Design Mode** (editor visuale di AppLab).
- Database: solo le **quattro API native** di AppLab, tutte asincrone con callback:

```js
insertRecord(tableName, record, callback)
getRecords(tableName, callback)         // restituisce TUTTI i record — nessun filtro server-side
updateRecord(tableName, record, callback)
deleteRecord(tableName, record, callback)
```

- `getRecords` non accetta parametri di filtro: il filtraggio avviene **sempre in JavaScript nel callback**.
- Le operazioni dipendenti vanno **concatenate nei callback** (non esistono `async/await` o Promise).
- AppLab non ha vincoli di unicità sul database: ogni constraint va verificato **in JS prima di `insertRecord`**.

---

## Modello dei dati (12 tabelle)

AppLab genera automaticamente un campo `id` (Number, PK) per ogni tabella. Le relazioni tra tabelle devono usare sempre questo identificatore numerico.

### Dati anagrafici

| Tabella | Chiave primaria | Campi |
|---|---|---|
| `Studente` | `id` (Number, auto) | `cognome`, `nome` |
| `Materia` | `id` (Number, auto) | `materia` |
| `Argomento` | `id` (Number, auto) | `idMateria` FK, `argomento` |
| `Quesito` | `id` (Number, auto) | `idArgomento` FK, `quesito` |
| `MaterialeDidattico` | `id` (Number, auto) | `tipo`, `titolo`, `autore` (opt), `url` (opt) |
| `Riferimento` | `id` (Number, auto) | `idQuesito` FK, `idMateriale` FK, `dettaglio` |

`tipo` di `MaterialeDidattico`: `libro` \| `sito` \| `articolo` \| `rivista` \| `video` \| `podcast`  
`dettaglio` di `Riferimento`: testo libero, es. `"pp. 42–56"`, `"cap. 3"`, `"min 12:30–25:00"`

### Interrogazioni programmate

| Tabella | Chiave primaria | Campi |
|---|---|---|
| `InterrogazioneProgrammata` | `id` (Number, auto) | `numeroInterrogati`, `data` (`gg/mm/aaaa`), `ora` (`hh:mm`) |
| `IntProgArgomento` | `id` (Number, auto) | `idInterrogazione` FK, `idArgomento` FK — tutti gli argomenti devono appartenere alla **stessa materia** |
| `AssegnazioneStudenti` | `id` (Number, auto) | `idInterrogazione` FK, `idStudente` FK |

### Interrogazioni svolte

| Tabella | Chiave primaria | Campi |
|---|---|---|
| `InterrogazioneSvolta` | `id` (Number, auto) | `idInterrogazione` FK **opzionale**, `data`, `ora` |
| `IntSvoltaArgomento` | `id` (Number, auto) | `idInterrSvolta` FK, `idArgomento` FK |
| `StudentiInterrogati` | `id` (Number, auto) | `idInterrSvolta` FK, `idStudente` FK |

> Un'`InterrogazioneSvolta` può esistere senza essere collegata a una `InterrogazioneProgrammata` (interrogazione non pianificata). Il campo `idInterrogazione` viene lasciato `null` in quel caso.

---

## Architettura

L'app è **client-only**: nessun backend, tutto gira nell'interprete AppLab.  
Il flusso è sempre:

```
Evento UI → getRecords (una o più tabelle) → join/filtro in JS → validazione → insertRecord/updateRecord → aggiorna UI nel callback
```

La navigazione usa una **bottom-tab bar con 5 tab** (Home, Calendario, Materie, Studenti, Nuovo).  
Ogni operazione deve essere raggiungibile in **massimo 3 tap** dalla home.

### Pattern di caricamento dati

Per schermate che aggregano dati da più tabelle (es. calendario), **caricare tutto in anticipo** con chiamate parallele, poi fare il join in JS — non fare N chiamate dentro un loop:

```js
// ✅ corretto
getRecords("InterrogazioneProgrammata", function(interr) {
  getRecords("IntProgArgomento", function(intprog) {
    getRecords("AssegnazioneStudenti", function(ass) {
      // join client-side
    });
  });
});

// ❌ sbagliato — N chiamate in loop
interr.forEach(function(i) {
  getRecords("Argomento", ...); // una chiamata per ogni interrogazione
});
```

---

## Convenzioni chiave

- **Lingua**: tutta l'interfaccia, i messaggi di errore, i commenti nel codice e la SRS sono in **italiano**.
- **Chiave primaria**: il campo `id` assegnato automaticamente da AppLab e' l'unica chiave primaria di ogni tabella.
- **Chiavi esterne**: tutti i riferimenti tra tabelle devono usare gli identificatori numerici `id...` (`idMateria`, `idArgomento`, `idInterrogazione`, `idStudente`, `idQuesito`, `idMateriale`, `idInterrSvolta`).
- **Unicità**: verificare in JavaScript l'assenza di duplicati logici e, per le tabelle di giunzione, l'assenza di duplicati sulle coppie di chiavi esterne prima di ogni `insertRecord`.
- **Vincolo stessa materia**: in `IntProgArgomento`, tutti gli argomenti di una stessa interrogazione devono avere lo stesso `idMateria` — controllare in JS prima di salvare (UC5 alt. 3b).
- **Posti disponibili**: `numeroInterrogati` in `InterrogazioneProgrammata` e' il massimo; il numero di candidature attuali si conta filtrando `AssegnazioneStudenti` per `idInterrogazione`.
- **Studenti in attesa**: un candidato è "in attesa" se è in `AssegnazioneStudenti` per un'interrogazione futura che copre un argomento, ma **non** appare in `StudentiInterrogati` per nessuna `InterrogazioneSvolta` che copre lo stesso argomento.
- Le operazioni di database devono essere incapsulate in **funzioni helper** (una per tipo di operazione per tabella).

---

## Use Case (UC1–UC11)

| ID | Nome | Pre-condizione principale |
|---|---|---|
| UC1 | Inserisce Studenti | — |
| UC2 | Inserisce Materie | — |
| UC3 | Inserisce Argomenti | almeno una materia |
| UC4 | Inserisce Quesiti | almeno un argomento |
| UC5 | Inserisce Interrogazione Programmata | almeno un argomento |
| UC6 | Visualizza Interrogazione Programmata | almeno una interrogazione |
| UC7 | Si candida (`<<include>> UC6`) | posti disponibili, nessun conflitto di data |
| UC8 | Inserisce Materiale Didattico | — |
| UC9 | Inserisce Riferimento (`<<extend>> UC4`) | almeno un quesito e un materiale |
| UC10 | Registra Interrogazione Svolta | almeno un argomento e uno studente |
| UC11 | Visualizza Studenti in Attesa | candidature attive + almeno una svolta |

---

## Rendering SRS

```bash
gem install asciidoctor asciidoctor-diagram asciidoctor-diagram-plantuml asciidoctor-pdf
asciidoctor -r asciidoctor-diagram srs.adoc
asciidoctor-pdf -r asciidoctor-diagram srs.adoc
```

I blocchi `[plantuml, ..., svg]` richiedono `asciidoctor-diagram`, `asciidoctor-diagram-plantuml` e Java.  
In assenza di questi strumenti, ogni sezione PlantUML ha una rappresentazione testuale equivalente nel blocco `[listing]` successivo.
