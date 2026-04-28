// ============================================================
// StudyTogether — App per la Gestione Collaborativa
//                 delle Interrogazioni Programmate
//
// Piattaforma: AppLab di Code.org
// Destinatari: Studenti della scuola secondaria di secondo grado
// Contesto:    Singola classe scolastica
//
// Tabelle del database (configurare in "Manage Tables"):
//   • studenti       — nome, cognome, classe
//   • materie        — nome
//   • interrogazioni — materia, argomento, data, descrizione,
//                      autore, classe
//   • candidature    — interrogazione_id, studente, materia,
//                      data, argomento, classe
//   • domande_studio — materia, argomento, domanda, risposta,
//                      autore, classe
//
// Schermate AppLab da creare:
//   schermata_login         schermata_home
//   schermata_calendario    schermata_nuova_verifica
//   schermata_candidature   schermata_domande
//   schermata_nuova_domanda
// ============================================================

// ============================================================
// VARIABILI GLOBALI
// ============================================================

var studenteCorrente = {
  nome: "",
  cognome: "",
  classe: ""
};

var MATERIE_DEFAULT = [
  "Matematica", "Italiano", "Storia", "Inglese",
  "Informatica", "Economia", "Diritto", "Scienze",
  "Fisica", "Latino", "Filosofia", "Arte"
];

// ============================================================
// UTILITÀ
// ============================================================

/**
 * Formatta la data odierna come stringa AAAA-MM-GG.
 */
function oggiStringa() {
  var d = new Date();
  var mm = d.getMonth() + 1;
  var gg = d.getDate();
  return d.getFullYear() + "-" +
    (mm < 10 ? "0" : "") + mm + "-" +
    (gg < 10 ? "0" : "") + gg;
}

/**
 * Verifica se una stringa è nel formato AAAA-MM-GG.
 */
function dataValida(s) {
  if (!s || s.length !== 10) return false;
  if (s.charAt(4) !== "-" || s.charAt(7) !== "-") return false;
  var anno = parseInt(s.substring(0, 4), 10);
  var mese = parseInt(s.substring(5, 7), 10);
  var giorno = parseInt(s.substring(8, 10), 10);
  if (anno <= 2000 || mese < 1 || mese > 12 || giorno < 1 || giorno > 31) {
    return false;
  }
  // Verifica che il giorno esista nel mese/anno indicato
  return new Date(anno, mese - 1, giorno).getDate() === giorno;
}

/**
 * Ordina un array di oggetti per la proprietà `data` (stringa ISO).
 */
function ordinaPerData(arr) {
  arr.sort(function (a, b) {
    if (a.data < b.data) return -1;
    if (a.data > b.data) return 1;
    return 0;
  });
}

/**
 * Carica le materie nel dropdown indicato.
 * Se nel database non ci sono materie usa MATERIE_DEFAULT.
 */
function caricaMaterieInDropdown(idDropdown, includeTutte) {
  readRecords("materie", {}, function (records) {
    var opzioni = includeTutte ? ["Tutte le materie"] : [];
    if (records.length > 0) {
      for (var i = 0; i < records.length; i++) {
        opzioni.push(records[i].nome);
      }
    } else {
      for (var j = 0; j < MATERIE_DEFAULT.length; j++) {
        opzioni.push(MATERIE_DEFAULT[j]);
      }
    }
    setProperty(idDropdown, "options", opzioni);
  });
}

// ============================================================
// SCHERMATA LOGIN
// ============================================================

onEvent("btn_accedi", "click", function () {
  var nome    = getText("input_nome").trim();
  var cognome = getText("input_cognome").trim();
  var classe  = getText("input_classe").trim();

  if (nome === "" || cognome === "" || classe === "") {
    setText("lbl_errore_login", "⚠ Compila tutti i campi.");
    return;
  }
  setText("lbl_errore_login", "");

  studenteCorrente.nome    = nome;
  studenteCorrente.cognome = cognome;
  studenteCorrente.classe  = classe;

  // Registra lo studente se non è già presente
  readRecords("studenti",
    { nome: nome, cognome: cognome, classe: classe },
    function (records) {
      if (records.length === 0) {
        createRecord("studenti",
          { nome: nome, cognome: cognome, classe: classe },
          function () {
            setScreen("schermata_home");
            aggiornaHome();
          }
        );
      } else {
        setScreen("schermata_home");
        aggiornaHome();
      }
    }
  );
});

// ============================================================
// SCHERMATA HOME (DASHBOARD)
// ============================================================

function aggiornaHome() {
  setText("lbl_benvenuto",
    "Ciao, " + studenteCorrente.nome + " " + studenteCorrente.cognome + "!");
  setText("lbl_info_classe", "Classe: " + studenteCorrente.classe);

  // Prossime interrogazioni (da oggi in poi, max 5)
  var oggi = oggiStringa();
  readRecords("interrogazioni", {}, function (records) {
    var future = [];
    for (var i = 0; i < records.length; i++) {
      if (records[i].data >= oggi) {
        future.push(records[i]);
      }
    }
    ordinaPerData(future);

    var testo = "";
    var max = Math.min(5, future.length);
    if (max === 0) {
      testo = "Nessuna interrogazione programmata.";
    } else {
      for (var j = 0; j < max; j++) {
        var r = future[j];
        testo += r.data + "  |  " + r.materia + "\n" +
                 "    " + r.argomento + "\n";
      }
    }
    setText("lbl_prossime", testo);
  });

  // Candidature attive dello studente
  var nomeCompleto = studenteCorrente.nome + " " + studenteCorrente.cognome;
  readRecords("candidature", { studente: nomeCompleto }, function (records) {
    var testo = "";
    if (records.length === 0) {
      testo = "Nessuna candidatura attiva.";
    } else {
      // Mostra solo le future o recenti
      var oggi2 = oggiStringa();
      for (var k = 0; k < records.length; k++) {
        if (records[k].data >= oggi2) {
          testo += records[k].data + "  |  " + records[k].materia + "\n" +
                   "    " + records[k].argomento + "\n";
        }
      }
      if (testo === "") testo = "Nessuna candidatura attiva.";
    }
    setText("lbl_mie_candidature", testo);
  });
}

onEvent("btn_home_a_calendario",    "click", function () {
  setScreen("schermata_calendario");
  caricaCalendario();
});
onEvent("btn_home_a_candidature",   "click", function () {
  setScreen("schermata_candidature");
  caricaCandidature();
});
onEvent("btn_home_a_domande",       "click", function () {
  setScreen("schermata_domande");
  caricaDomande();
});

// ============================================================
// SCHERMATA CALENDARIO INTERROGAZIONI
// ============================================================

function caricaCalendario() {
  readRecords("interrogazioni", {}, function (records) {
    ordinaPerData(records);

    var testo = "";
    if (records.length === 0) {
      testo = "Nessuna interrogazione programmata.\n" +
              "Aggiungine una con il pulsante qui sotto!";
    } else {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        testo += r.data + "  \u2014  " + r.materia.toUpperCase() + "\n";
        testo += "  Argomento: " + r.argomento + "\n";
        if (r.descrizione && r.descrizione !== "") {
          testo += "  Note: " + r.descrizione + "\n";
        }
        testo += "  Aggiunta da: " + r.autore + "\n";
        testo += "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";
      }
    }
    setText("lbl_lista_interrogazioni", testo);
  });
}

onEvent("btn_cal_a_nuova_verifica", "click", function () {
  setScreen("schermata_nuova_verifica");
  inizializzaNuovaVerifica();
});
onEvent("btn_cal_a_home",           "click", function () {
  setScreen("schermata_home");
  aggiornaHome();
});

// ============================================================
// SCHERMATA NUOVA INTERROGAZIONE
// ============================================================

function inizializzaNuovaVerifica() {
  setText("lbl_errore_verifica", "");
  setText("input_argomento_verifica", "");
  setText("input_data_verifica", "");
  setText("input_descrizione_verifica", "");
  caricaMaterieInDropdown("dropdown_materia_verifica", false);
}

onEvent("btn_salva_verifica", "click", function () {
  var materia     = getText("dropdown_materia_verifica").trim();
  var argomento   = getText("input_argomento_verifica").trim();
  var data        = getText("input_data_verifica").trim();
  var descrizione = getText("input_descrizione_verifica").trim();

  if (materia === "" || argomento === "" || data === "") {
    setText("lbl_errore_verifica", "⚠ Materia, argomento e data sono obbligatori.");
    return;
  }
  if (!dataValida(data)) {
    setText("lbl_errore_verifica", "⚠ Formato data: AAAA-MM-GG  (es. 2025-05-20)");
    return;
  }
  if (data < oggiStringa()) {
    setText("lbl_errore_verifica", "⚠ La data deve essere uguale o successiva a oggi.");
    return;
  }

  setText("lbl_errore_verifica", "Salvataggio in corso...");

  createRecord("interrogazioni", {
    materia:     materia,
    argomento:   argomento,
    data:        data,
    descrizione: descrizione,
    autore:      studenteCorrente.nome + " " + studenteCorrente.cognome,
    classe:      studenteCorrente.classe
  }, function () {
    setScreen("schermata_calendario");
    caricaCalendario();
  });
});

onEvent("btn_verifica_a_calendario", "click", function () {
  setScreen("schermata_calendario");
  caricaCalendario();
});

// ============================================================
// SCHERMATA CANDIDATURE
// ============================================================

// Mappa id interrogazione → dati interrogazione (usata per la candidatura)
var mappaInterrogazioni = {};

function caricaCandidature() {
  setText("lbl_errore_candidatura", "");
  var oggi = oggiStringa();
  var nomeCompleto = studenteCorrente.nome + " " + studenteCorrente.cognome;

  readRecords("interrogazioni", {}, function (interrogazioni) {
    // Filtra le future
    var future = [];
    mappaInterrogazioni = {};
    for (var i = 0; i < interrogazioni.length; i++) {
      if (interrogazioni[i].data >= oggi) {
        future.push(interrogazioni[i]);
        mappaInterrogazioni[interrogazioni[i].id] = interrogazioni[i];
      }
    }
    ordinaPerData(future);

    // Leggi tutte le candidature per contare i candidati
    readRecords("candidature", {}, function (candidature) {
      var testo = "";
      if (future.length === 0) {
        testo = "Nessuna interrogazione disponibile per candidarsi.";
        setText("lbl_lista_candidature", testo);
        setProperty("dropdown_seleziona_verifica", "options", ["—"]);
        return;
      }

      // Costruisci lista e dropdown
      var opzioniDropdown = [];
      for (var j = 0; j < future.length; j++) {
        var interr    = future[j];
        var nCandidati = 0;
        var ioCandidato = false;

        for (var k = 0; k < candidature.length; k++) {
          if (candidature[k].interrogazione_id === interr.id) {
            nCandidati++;
            if (candidature[k].studente === nomeCompleto) {
              ioCandidato = true;
            }
          }
        }

        testo += interr.data + "  \u2014  " + interr.materia.toUpperCase() + "\n";
        testo += "  Argomento: " + interr.argomento + "\n";
        testo += "  Candidati: " + nCandidati + "  " +
                 (ioCandidato ? "[\u2713 SEI CANDIDATO/A]" : "") + "\n";
        testo += "  ID: " + interr.id + "\n";
        testo += "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";

        opzioniDropdown.push(interr.data + " | " + interr.materia + " [" + interr.id + "]");
      }

      setText("lbl_lista_candidature", testo);
      setProperty("dropdown_seleziona_verifica", "options", opzioniDropdown);
    });
  });
}

/**
 * Estrae l'id dell'interrogazione dall'opzione del dropdown.
 * Formato: "data | materia [id]"
 */
function estraiIdDaOpzione(opzione) {
  var inizio = opzione.lastIndexOf("[");
  var fine   = opzione.lastIndexOf("]");
  if (inizio === -1 || fine === -1) return null;
  return opzione.substring(inizio + 1, fine);
}

onEvent("btn_candidati", "click", function () {
  var selezione    = getText("dropdown_seleziona_verifica");
  var nomeCompleto = studenteCorrente.nome + " " + studenteCorrente.cognome;

  if (!selezione || selezione === "\u2014") {
    setText("lbl_errore_candidatura", "⚠ Seleziona un'interrogazione.");
    return;
  }

  var idInterr = estraiIdDaOpzione(selezione);
  if (!idInterr) {
    setText("lbl_errore_candidatura", "⚠ Selezione non valida.");
    return;
  }

  // Controlla se già candidato
  readRecords("candidature",
    { interrogazione_id: idInterr, studente: nomeCompleto },
    function (records) {
      if (records.length > 0) {
        setText("lbl_errore_candidatura",
          "⚠ Sei già candidato/a per questa interrogazione.");
        return;
      }

      var interr = mappaInterrogazioni[idInterr];
      createRecord("candidature", {
        interrogazione_id: idInterr,
        studente:          nomeCompleto,
        materia:           interr ? interr.materia   : "",
        data:              interr ? interr.data       : "",
        argomento:         interr ? interr.argomento  : "",
        classe:            studenteCorrente.classe
      }, function () {
        setText("lbl_errore_candidatura",
          "✓ Candidatura registrata con successo!");
        caricaCandidature();
      });
    }
  );
});

onEvent("btn_ritira_candidatura", "click", function () {
  var selezione    = getText("dropdown_seleziona_verifica");
  var nomeCompleto = studenteCorrente.nome + " " + studenteCorrente.cognome;

  if (!selezione || selezione === "\u2014") {
    setText("lbl_errore_candidatura", "⚠ Seleziona un'interrogazione.");
    return;
  }

  var idInterr = estraiIdDaOpzione(selezione);
  if (!idInterr) {
    setText("lbl_errore_candidatura", "⚠ Selezione non valida.");
    return;
  }

  readRecords("candidature",
    { interrogazione_id: idInterr, studente: nomeCompleto },
    function (records) {
      if (records.length === 0) {
        setText("lbl_errore_candidatura",
          "⚠ Non sei candidato/a per questa interrogazione.");
        return;
      }
      deleteRecord("candidature", records[0], function () {
        setText("lbl_errore_candidatura", "✓ Candidatura ritirata.");
        caricaCandidature();
      });
    }
  );
});

onEvent("btn_cand_a_home", "click", function () {
  setScreen("schermata_home");
  aggiornaHome();
});

// ============================================================
// SCHERMATA DOMANDE DI STUDIO
// ============================================================

function caricaDomande() {
  setText("lbl_errore_domande", "");
  var filtroMateria   = getText("dropdown_filtro_materia");
  var filtroArgomento = getText("input_filtro_argomento").trim().toLowerCase();

  // Inizializza dropdown filtro materie (solo alla prima apertura)
  caricaMaterieInDropdown("dropdown_filtro_materia", true);

  var ricerca = {};
  if (filtroMateria && filtroMateria !== "Tutte le materie") {
    ricerca.materia = filtroMateria;
  }

  readRecords("domande_studio", ricerca, function (records) {
    // Filtro lato client per argomento / testo domanda
    var risultati = [];
    for (var i = 0; i < records.length; i++) {
      var d = records[i];
      if (filtroArgomento === "" ||
          d.argomento.toLowerCase().indexOf(filtroArgomento) !== -1 ||
          d.domanda.toLowerCase().indexOf(filtroArgomento)   !== -1) {
        risultati.push(d);
      }
    }

    var testo = "";
    if (risultati.length === 0) {
      testo = "Nessuna domanda trovata.\n" +
              "Condividi la prima domanda con la classe!";
    } else {
      for (var j = 0; j < risultati.length; j++) {
        var r = risultati[j];
        testo += r.materia.toUpperCase() + "  \u2014  " + r.argomento + "\n";
        testo += "  D: " + r.domanda + "\n";
        if (r.risposta && r.risposta !== "") {
          testo += "  R: " + r.risposta + "\n";
        }
        testo += "  (condivisa da " + r.autore + ")\n";
        testo += "\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n";
      }
    }
    setText("lbl_lista_domande", testo);
  });
}

onEvent("btn_cerca_domande", "click", function () {
  caricaDomande();
});

onEvent("btn_dom_a_nuova_domanda", "click", function () {
  setScreen("schermata_nuova_domanda");
  inizializzaNuovaDomanda();
});

onEvent("btn_dom_a_home", "click", function () {
  setScreen("schermata_home");
  aggiornaHome();
});

// ============================================================
// SCHERMATA NUOVA DOMANDA DI STUDIO
// ============================================================

function inizializzaNuovaDomanda() {
  setText("lbl_errore_domanda", "");
  setText("input_argomento_domanda", "");
  setText("input_testo_domanda", "");
  setText("input_risposta_domanda", "");
  caricaMaterieInDropdown("dropdown_materia_domanda", false);
}

onEvent("btn_salva_domanda", "click", function () {
  var materia   = getText("dropdown_materia_domanda").trim();
  var argomento = getText("input_argomento_domanda").trim();
  var domanda   = getText("input_testo_domanda").trim();
  var risposta  = getText("input_risposta_domanda").trim();

  if (materia === "" || argomento === "" || domanda === "") {
    setText("lbl_errore_domanda", "⚠ Materia, argomento e domanda sono obbligatori.");
    return;
  }

  setText("lbl_errore_domanda", "Salvataggio in corso...");

  createRecord("domande_studio", {
    materia:   materia,
    argomento: argomento,
    domanda:   domanda,
    risposta:  risposta,
    autore:    studenteCorrente.nome + " " + studenteCorrente.cognome,
    classe:    studenteCorrente.classe
  }, function () {
    setScreen("schermata_domande");
    caricaDomande();
  });
});

onEvent("btn_nuovadom_a_domande", "click", function () {
  setScreen("schermata_domande");
  caricaDomande();
});
