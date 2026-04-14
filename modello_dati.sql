--
-- Formato: SQLite
--

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS Studente (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cognome TEXT NOT NULL,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Materia (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  materia TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS Argomento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idMateria INTEGER NOT NULL,
  argomento TEXT NOT NULL,
  FOREIGN KEY (idMateria) REFERENCES Materia(id)
);

CREATE TABLE IF NOT EXISTS Quesito (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idArgomento INTEGER NOT NULL,
  quesito TEXT NOT NULL,
  FOREIGN KEY (idArgomento) REFERENCES Argomento(id)
);

CREATE TABLE IF NOT EXISTS MaterialeDidattico (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK (tipo IN ('libro', 'sito', 'articolo', 'rivista', 'video', 'podcast')),
  titolo TEXT NOT NULL,
  autore TEXT DEFAULT NULL,
  url TEXT DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS Riferimento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idQuesito INTEGER NOT NULL,
  idMateriale INTEGER NOT NULL,
  dettaglio TEXT NOT NULL,
  FOREIGN KEY (idQuesito) REFERENCES Quesito(id),
  FOREIGN KEY (idMateriale) REFERENCES MaterialeDidattico(id)
);

CREATE TABLE IF NOT EXISTS InterrogazioneProgrammata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  numeroInterrogati INTEGER NOT NULL CHECK (numeroInterrogati > 0),
  data TEXT NOT NULL,
  ora TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS IntProgArgomento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idInterrogazione INTEGER NOT NULL,
  idArgomento INTEGER NOT NULL,
  FOREIGN KEY (idInterrogazione) REFERENCES InterrogazioneProgrammata(id),
  FOREIGN KEY (idArgomento) REFERENCES Argomento(id),
  UNIQUE (idInterrogazione, idArgomento)
);

CREATE TABLE IF NOT EXISTS AssegnazioneStudenti (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idInterrogazione INTEGER NOT NULL,
  idStudente INTEGER NOT NULL,
  FOREIGN KEY (idInterrogazione) REFERENCES InterrogazioneProgrammata(id),
  FOREIGN KEY (idStudente) REFERENCES Studente(id),
  UNIQUE (idInterrogazione, idStudente)
);

CREATE TABLE IF NOT EXISTS InterrogazioneSvolta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idInterrogazione INTEGER DEFAULT NULL,
  data TEXT NOT NULL,
  ora TEXT NOT NULL,
  FOREIGN KEY (idInterrogazione) REFERENCES InterrogazioneProgrammata(id)
);

CREATE TABLE IF NOT EXISTS IntSvoltaArgomento (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idInterrSvolta INTEGER NOT NULL,
  idArgomento INTEGER NOT NULL,
  FOREIGN KEY (idInterrSvolta) REFERENCES InterrogazioneSvolta(id),
  FOREIGN KEY (idArgomento) REFERENCES Argomento(id),
  UNIQUE (idInterrSvolta, idArgomento)
);

CREATE TABLE IF NOT EXISTS StudentiInterrogati (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  idInterrSvolta INTEGER NOT NULL,
  idStudente INTEGER NOT NULL,
  FOREIGN KEY (idInterrSvolta) REFERENCES InterrogazioneSvolta(id),
  FOREIGN KEY (idStudente) REFERENCES Studente(id),
  UNIQUE (idInterrSvolta, idStudente)
);

/* Studenti fittizi */
INSERT INTO Studente (cognome, nome) VALUES
('Bianchi', 'Luigi'),
('Doe', 'John'),
('Neri', 'Francesca'),
('Rossi', 'Mario'),
('Smith', 'John'),
('Verdi', 'Giulia');

/* Materie da monte orario trienni ITE AFM - SIA

LINGUA E LETTERATURA ITALIANA
STORIA
LINGUA INGLESE
MATEMATICA
SPAGNOLO
INFORMATICA
ECONOMIA AZIENDALE
DIRITTO
ECONOMIA POLITICA
*/
INSERT INTO Materia (materia) VALUES
('Lingua e letteratura italiana'),
('Storia'),
('Lingua inglese'),
('Matematica'),
('Spagnolo'),
('Informatica'),
('Economia aziendale'),
('Diritto'),
('Economia politica');

/* Argomenti fittizi */
INSERT INTO Argomento (idMateria, argomento) VALUES
((SELECT id FROM Materia WHERE materia = 'Lingua e letteratura italiana'), 'Analisi del testo poetico'),
((SELECT id FROM Materia WHERE materia = 'Lingua e letteratura italiana'), 'Analisi del testo narrativo'),
((SELECT id FROM Materia WHERE materia = 'Storia'), 'La Prima guerra mondiale'),
((SELECT id FROM Materia WHERE materia = 'Storia'), 'La Seconda guerra mondiale'),
((SELECT id FROM Materia WHERE materia = 'Lingua inglese'), 'Present simple e present continuous'),
((SELECT id FROM Materia WHERE materia = 'Lingua inglese'), 'Past simple e past continuous'),
((SELECT id FROM Materia WHERE materia = 'Matematica'), 'Funzioni e grafici'),
((SELECT id FROM Materia WHERE materia = 'Matematica'), 'Derivate e integrali'),
((SELECT id FROM Materia WHERE materia = 'Informatica'), 'Il linguaggio C++'),
((SELECT id FROM Materia WHERE materia = 'Informatica'), 'Algoritmi e strutture dati'),
((SELECT id FROM Materia WHERE materia = 'Informatica'), 'Informatica come strumento di collaborazione e cooperazione'),
((SELECT id FROM Materia WHERE materia = 'Economia aziendale'), 'Contabilita generale'),
((SELECT id FROM Materia WHERE materia = 'Economia aziendale'), 'Analisi di bilancio'),
((SELECT id FROM Materia WHERE materia = 'Diritto'), 'Diritto costituzionale'),
((SELECT id FROM Materia WHERE materia = 'Diritto'), 'Diritto penale'),
((SELECT id FROM Materia WHERE materia = 'Economia politica'), 'Microeconomia'),
((SELECT id FROM Materia WHERE materia = 'Economia politica'), 'Macroeconomia');
