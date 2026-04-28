# StudyTogether 📚

**App per la Gestione Collaborativa delle Interrogazioni Programmate**

Proposta della classe 3B AFM per il concorso *Programma il Futuro 2025-26*
Realizzata con **AppLab di Code.org** — Scuola Secondaria di Secondo Grado.

---

## Idea

StudyTogether trasforma la classe in una **Comunità di Pratica** (Lave & Wenger, 1991):
uno spazio in cui la conoscenza non è detenuta da pochi, ma circola, si costruisce
collettivamente e si consolida attraverso la partecipazione attiva di ogni studente.

Le interrogazioni programmate — tradizionalmente vissute come momenti di ansia e
competizione — diventano *occasioni di apprendimento cooperativo*: gli studenti
gestiscono insieme il calendario delle verifiche, si candidano consapevolmente,
condividono quesiti di studio e organizzano la conoscenza per argomento e materia.

---

## Funzionalità

| Funzione | Descrizione |
|---|---|
| 🔑 **Login** | Lo studente si identifica con nome, cognome e classe |
| 🏠 **Dashboard** | Mostra le prossime interrogazioni e le proprie candidature attive |
| 📅 **Calendario** | Elenco completo delle interrogazioni programmate, ordinate per data |
| ➕ **Nuova interrogazione** | Aggiunge una verifica al calendario condiviso |
| ✋ **Candidature** | Permette di candidarsi (o ritirare la propria candidatura) a un'interrogazione |
| ❓ **Banca domande** | Sfoglia le domande di studio condivise, filtrabili per materia e argomento |
| 📝 **Nuova domanda** | Condivide una domanda (con risposta opzionale) con tutta la classe |

---

## Struttura del progetto

```
study-together/
├── src/
│   └── main.js          ← codice JavaScript dell'app (da incollare in AppLab)
└── README.md
```

Il file `src/main.js` contiene **tutto il codice JavaScript** dell'applicazione.
L'interfaccia grafica (schermate e widget) va creata nell'**editor visuale di AppLab**
seguendo le istruzioni nella sezione *Configurazione AppLab* qui sotto.

---

## Configurazione AppLab

### 1. Crea un nuovo progetto AppLab

Vai su [studio.code.org/projects/applab](https://studio.code.org/projects/applab)
e crea un nuovo progetto.

### 2. Crea le tabelle del database

Nel pannello **Data** → **Manage Tables** crea le seguenti cinque tabelle:

| Tabella | Colonne |
|---|---|
| `studenti` | `nome`, `cognome`, `classe` |
| `materie` | `nome` |
| `interrogazioni` | `materia`, `argomento`, `data`, `descrizione`, `autore`, `classe` |
| `candidature` | `interrogazione_id`, `studente`, `materia`, `data`, `argomento`, `classe` |
| `domande_studio` | `materia`, `argomento`, `domanda`, `risposta`, `autore`, `classe` |

> **Suggerimento:** Popola la tabella `materie` con le materie della tua classe
> (es. Matematica, Italiano, Storia, …). Se la tabella è vuota l'app utilizza
> automaticamente un elenco predefinito.

### 3. Crea le schermate

Crea le seguenti schermate nell'editor visuale con i relativi elementi UI:

---

#### `schermata_login`

| Elemento | Tipo | ID |
|---|---|---|
| Titolo "StudyTogether" | Label | `lbl_titolo` |
| "Nome:" | Label | — |
| Campo nome | Text Input | `input_nome` |
| "Cognome:" | Label | — |
| Campo cognome | Text Input | `input_cognome` |
| "Classe (es. 3B):" | Label | — |
| Campo classe | Text Input | `input_classe` |
| Pulsante "Accedi" | Button | `btn_accedi` |
| Messaggio di errore | Label | `lbl_errore_login` |

---

#### `schermata_home`

| Elemento | Tipo | ID |
|---|---|---|
| "Ciao, …!" | Label | `lbl_benvenuto` |
| "Classe: …" | Label | `lbl_info_classe` |
| "Prossime interrogazioni:" | Label | — |
| Elenco prossime verifiche | Label (multiriga) | `lbl_prossime` |
| "Le mie candidature:" | Label | — |
| Elenco candidature | Label (multiriga) | `lbl_mie_candidature` |
| Pulsante "📅 Calendario" | Button | `btn_home_a_calendario` |
| Pulsante "✋ Candidature" | Button | `btn_home_a_candidature` |
| Pulsante "❓ Domande" | Button | `btn_home_a_domande` |

---

#### `schermata_calendario`

| Elemento | Tipo | ID |
|---|---|---|
| "Calendario Interrogazioni" | Label | — |
| Elenco verifiche | Label (multiriga) | `lbl_lista_interrogazioni` |
| Pulsante "➕ Aggiungi verifica" | Button | `btn_cal_a_nuova_verifica` |
| Pulsante "🏠 Home" | Button | `btn_cal_a_home` |

---

#### `schermata_nuova_verifica`

| Elemento | Tipo | ID |
|---|---|---|
| "Nuova Interrogazione" | Label | — |
| "Materia:" | Label | — |
| Scelta materia | Dropdown | `dropdown_materia_verifica` |
| "Argomento:" | Label | — |
| Campo argomento | Text Input | `input_argomento_verifica` |
| "Data (AAAA-MM-GG):" | Label | — |
| Campo data | Text Input | `input_data_verifica` |
| "Note (facoltativo):" | Label | — |
| Campo note | Text Input | `input_descrizione_verifica` |
| Pulsante "💾 Salva" | Button | `btn_salva_verifica` |
| Pulsante "↩ Calendario" | Button | `btn_verifica_a_calendario` |
| Messaggio di errore | Label | `lbl_errore_verifica` |

---

#### `schermata_candidature`

| Elemento | Tipo | ID |
|---|---|---|
| "Candidature" | Label | — |
| Elenco verifiche con candidati | Label (multiriga) | `lbl_lista_candidature` |
| "Seleziona una verifica:" | Label | — |
| Scelta verifica | Dropdown | `dropdown_seleziona_verifica` |
| Pulsante "✋ Candidati" | Button | `btn_candidati` |
| Pulsante "❌ Ritira candidatura" | Button | `btn_ritira_candidatura` |
| Messaggio di stato | Label | `lbl_errore_candidatura` |
| Pulsante "🏠 Home" | Button | `btn_cand_a_home` |

---

#### `schermata_domande`

| Elemento | Tipo | ID |
|---|---|---|
| "Banca Domande" | Label | — |
| "Filtra per materia:" | Label | — |
| Filtro materia | Dropdown | `dropdown_filtro_materia` |
| "Cerca per argomento/testo:" | Label | — |
| Campo ricerca | Text Input | `input_filtro_argomento` |
| Pulsante "🔍 Cerca" | Button | `btn_cerca_domande` |
| Elenco domande | Label (multiriga) | `lbl_lista_domande` |
| Pulsante "📝 Aggiungi domanda" | Button | `btn_dom_a_nuova_domanda` |
| Messaggio di stato | Label | `lbl_errore_domande` |
| Pulsante "🏠 Home" | Button | `btn_dom_a_home` |

---

#### `schermata_nuova_domanda`

| Elemento | Tipo | ID |
|---|---|---|
| "Nuova Domanda di Studio" | Label | — |
| "Materia:" | Label | — |
| Scelta materia | Dropdown | `dropdown_materia_domanda` |
| "Argomento:" | Label | — |
| Campo argomento | Text Input | `input_argomento_domanda` |
| "Domanda:" | Label | — |
| Campo domanda | Text Input | `input_testo_domanda` |
| "Risposta (facoltativa):" | Label | — |
| Campo risposta | Text Input | `input_risposta_domanda` |
| Pulsante "💾 Salva" | Button | `btn_salva_domanda` |
| Pulsante "↩ Domande" | Button | `btn_nuovadom_a_domande` |
| Messaggio di errore | Label | `lbl_errore_domanda` |

### 4. Incolla il codice

Passa alla modalità **Code** e incolla il contenuto di `src/main.js`
nell'editor JavaScript.

---

## Flusso principale

```
schermata_login
    │
    └──► schermata_home ◄─────────────────────────────────┐
              │                                            │
    ┌─────────┼──────────────┐                            │
    ▼         ▼              ▼                            │
schermata_ schermata_   schermata_                        │
calendario candidature  domande                           │
    │                        │                            │
    └──► schermata_           └──► schermata_             │
         nuova_verifica            nuova_domanda ─────────┘
```

---

## Riferimenti pedagogici

- Lave, J. & Wenger, E. (1991). *Situated Learning: Legitimate Peripheral Participation*. Cambridge University Press.
- Johnson, D.W. & Johnson, R.T. (1989). *Cooperation and Competition: Theory and Research*. Edina, MN: Interaction Book Company.

---

## Licenza

Questo progetto è rilasciato in [CC0 1.0 Universal](LICENSE) — dominio pubblico.
