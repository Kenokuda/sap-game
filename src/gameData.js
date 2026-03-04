// SAP Training Simulation — Incident-style game data
// Redesigned for SAP Cockpit Dashboard experience

// ─── KPI Display Helpers ────────────────────────────────────────────
export const BUDGET_TOTAL = 3_000_000; // €3.0M project budget

export function budgetDisplay(val) {
  // val is 0-100 internal; maps to €0–€3M
  const euros = Math.round((val / 100) * BUDGET_TOTAL);
  if (euros >= 1_000_000) return `€${(euros / 1_000_000).toFixed(1)}M`;
  return `€${(euros / 1_000).toFixed(0)}k`;
}

export function daysLeft(timelineVal) {
  // val 100 = 90 days left; val 0 = 0 days
  return Math.round((timelineVal / 100) * 90);
}

export function goLiveDate(timelineVal) {
  // Go-live starts at 23.06.2025 and shifts based on timeline
  const base = new Date("2025-06-23");
  const shift = Math.round(((100 - timelineVal) / 100) * 45);
  base.setDate(base.getDate() + shift);
  return base.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function riskInfo(stressVal) {
  if (stressVal < 25) return { level: "NIEDRIG", label: "Niedrig", color: "#107E3E", bg: "#F5FAF6", dot: "🟢" };
  if (stressVal < 50) return { level: "MITTEL", label: "Mittel", color: "#E9730C", bg: "#FEF7F1", dot: "🟡" };
  if (stressVal < 75) return { level: "HOCH", label: "Hoch", color: "#BB0000", bg: "#FFF0F0", dot: "🔴" };
  return { level: "KRITISCH", label: "Kritisch", color: "#BB0000", bg: "#FFF0F0", dot: "🔴" };
}

export function moraleInfo(stressVal) {
  if (stressVal < 25) return { label: "Gut", icon: "😊", color: "#107E3E" };
  if (stressVal < 50) return { label: "OK", icon: "😐", color: "#E9730C" };
  if (stressVal < 75) return { label: "Belastet", icon: "😟", color: "#BB0000" };
  return { label: "Kritisch", icon: "😫", color: "#BB0000" };
}

// ─── Events ─────────────────────────────────────────────────────────
export const EVENTS = [
  {
    id: "transport_failure",
    priority: "P1",
    system: "SAP S/4HANA PRD",
    category: "Technical",
    title: "Kritischer Transport-Fehler in Produktion",
    description:
      "Transport TR-2025-0847 wurde um 17:23 Uhr in das Produktionssystem eingespielt. Seitdem reagieren ca. 40% der Z-Programme mit ABAP-Laufzeitfehler SYSTEM_NO_TASK_STORAGE. Die Buchhaltung kann keine Buchungen mehr durchführen. Aktuell 3.200 offene Buchungsvorgänge.",
    reportedBy: { name: "Thorsten Weber", role: "IT-Leitung / Basis", initials: "TW" },
    timestamp: "Fr, 14.03.2025 · 17:43",
    choices: [
      {
        id: "rollback",
        icon: "RotateCcw",
        label: "Transport sofort zurückrollen",
        sublabel: "Notfall-Rollback in PRD initiieren",
        consequence:
          "Der Rollback wird um 18:15 Uhr durchgeführt. Dabei werden 2 abhängige Transporte mitgezogen. Das Produktionssystem ist ab 19:00 Uhr wieder stabil. Die Root-Cause-Analyse dauert bis Montag. Transportrichtlinie wird überarbeitet: Kein Import nach 15:00 Uhr.",
        activityLog: [
          "17:45 – Rollback-Entscheidung dokumentiert (Change #2025-0312)",
          "18:15 – Transport TR-2025-0847 zurückgerollt",
          "18:22 – 2 abhängige Transporte ebenfalls zurückgerollt",
          "19:00 – Produktionssystem stabil, Buchhaltung nimmt Betrieb auf",
          "19:15 – Incident geschlossen, RCA-Analyse für Montag terminiert",
        ],
        impact: { budget: -8, timeline: -5, stress: +10 },
      },
      {
        id: "hotfix",
        icon: "Wrench",
        label: "Hotfix entwickeln & deployen",
        sublabel: "Sofortkorrektur in DEV → QAS → PRD",
        consequence:
          "Das Entwicklerteam arbeitet bis 22:00 Uhr. Der Hotfix korrigiert 38 der 40 betroffenen Programme. 2 Z-Programme bleiben deaktiviert und müssen nächste Woche bearbeitet werden. Überstunden werden als Ausgleichszeit genehmigt.",
        activityLog: [
          "18:00 – Entwicklerteam mobilisiert (4 Personen)",
          "20:30 – Hotfix TR-2025-0849 in QAS getestet",
          "21:45 – Transport in PRD eingespielt",
          "22:00 – 38/40 Programme wieder funktionsfähig",
          "22:10 – 2 Programme deaktiviert, Follow-up-Ticket #2025-0891 erstellt",
        ],
        impact: { budget: -18, timeline: 0, stress: +20 },
      },
      {
        id: "sap_support",
        icon: "Headphones",
        label: "SAP Support eskalieren (P1-Meldung)",
        sublabel: "OSS-Meldung öffnen + SAP EarlyWatch aktivieren",
        consequence:
          "SAP Support identifiziert einen bekannten Kernel-Bug in Patch 22. Ein Patch-Download wird bereitgestellt. Das Einspielen dauert bis Samstag 10:00 Uhr. Die Buchhaltung arbeitet manuell bis dahin. Kommunikation an alle Werke rausgegangen.",
        activityLog: [
          "17:50 – SAP OSS-Meldung 2025-DE-0033 (Priorität: Sehr Hoch) erstellt",
          "18:30 – SAP Support meldet sich: Known Issue SAP Note 3421788",
          "19:00 – Patch-Download gestartet (3.2 GB)",
          "Sa 09:30 – Patch eingespielt, System-Neustart",
          "Sa 10:00 – System stabil, alle Z-Programme lauffähig",
        ],
        impact: { budget: -12, timeline: -8, stress: -5 },
      },
    ],
  },
  {
    id: "betriebsrat",
    priority: "P2",
    system: "SAP SuccessFactors",
    category: "HR / Recht",
    title: "Betriebsrat fordert Mitbestimmung zu SuccessFactors",
    description:
      "Der Vorsitzende des Betriebsrats, Herr Klaus Hofmann, hat schriftlich gemäß §87 BetrVG Mitbestimmungsrechte bezüglich der Einführung von SAP SuccessFactors Performance & Goals geltend gemacht. Moniert werden: automatische Leistungsbewertungsalgorithmen, digitale Zielvorgaben ohne Einigung sowie fehlende Betriebsvereinbarung.",
    reportedBy: { name: "Klaus Hofmann", role: "Betriebsratsvorsitzender", initials: "KH" },
    timestamp: "Mo, 17.03.2025 · 09:15",
    choices: [
      {
        id: "betriebsvereinbarung",
        icon: "FileSignature",
        label: "Betriebsvereinbarung aushandeln",
        sublabel: "Formalen Verhandlungsprozess starten",
        consequence:
          "Nach 5 Verhandlungsrunden (Dauer: 3 Wochen) wird eine Betriebsvereinbarung unterzeichnet. Die automatische Leistungsbewertung wird deaktiviert. Der Betriebsrat stimmt der Einführung mit 8 Einschränkungen zu. Go-Live verschiebt sich um 18 Tage.",
        activityLog: [
          "17.03 – Formaler Verhandlungsbeginn, Protokoll erstellt",
          "19.03 – 1. Verhandlungsrunde: Grundsatzpositionen",
          "24.03 – 2. Verhandlungsrunde: Funktionsumfang besprochen",
          "28.03 – 3. Runde: Kompromiss zu Bewertungsalgorithmen",
          "04.04 – Betriebsvereinbarung unterzeichnet (§87 BetrVG erfüllt)",
        ],
        impact: { budget: -8, timeline: -18, stress: +8 },
      },
      {
        id: "rechtsgutachten",
        icon: "Scale",
        label: "Rechtsgutachten beauftragen",
        sublabel: "Fachanwalt für Arbeitsrecht hinzuziehen",
        consequence:
          "Das Gutachten klärt, welche Funktionen mitbestimmungspflichtig sind. 3 Features werden abgeschaltet. Der Betriebsrat akzeptiert das Gutachten als Grundlage. Betriebsvereinbarung in 10 Tagen unterzeichnet. Juristisch sauber.",
        activityLog: [
          "18.03 – Kanzlei Dr. Berger & Partner beauftragt",
          "21.03 – Gutachten eingetroffen (42 Seiten)",
          "24.03 – 3 mitbestimmungspflichtige Features identifiziert und deaktiviert",
          "27.03 – Betriebsrat informiert, Einigung erzielt",
          "28.03 – Betriebsvereinbarung unterzeichnet",
        ],
        impact: { budget: -20, timeline: -10, stress: -8 },
      },
      {
        id: "it_only",
        icon: "Monitor",
        label: "System als rein technisch klassifizieren",
        sublabel: "Mitbestimmungspflicht bestreiten",
        consequence:
          "Die IT-Leitung erklärt das System für nicht mitbestimmungspflichtig. Der Betriebsrat eskaliert zur Einigungsstelle. Das Verfahren dauert 6 Wochen, kostet erheblich und endet mit einem Schlichterspruch zugunsten des Betriebsrats. Imageschaden im Unternehmen.",
        activityLog: [
          "18.03 – IT-Leitung: Klassifizierung als technisches Hilfsmittel",
          "19.03 – Betriebsrat beantragt Einigungsstelle beim Arbeitsgericht",
          "01.04 – Einigungsstelle konstituiert (Richter + Sachverständige)",
          "30.04 – Schlichterspruch: Mitbestimmung wird bestätigt",
          "05.05 – Notfall-Betriebsvereinbarung mit Einschränkungen unterzeichnet",
        ],
        impact: { budget: -5, timeline: -35, stress: +30 },
      },
    ],
  },
  {
    id: "dsgvo_audit",
    priority: "P2",
    system: "SAP S/4HANA / BW/4HANA",
    category: "Compliance / DSGVO",
    title: "Datenschutzaudit durch Landesbehörde angekündigt",
    description:
      "Der Landesbeauftragte für Datenschutz und Informationsfreiheit hat eine Prüfung des Verarbeitungsverzeichnisses für das neue SAP-System angekündigt. Termin: 28.03.2025 (in 11 Tagen). Der interne Datenschutzbeauftragte meldet: Das Verarbeitungsverzeichnis nach Art. 30 DSGVO ist für 60% der SAP-Datenflüsse unvollständig.",
    reportedBy: { name: "Dr. Sabine Kroll", role: "Datenschutzbeauftragte (DPO)", initials: "SK" },
    timestamp: "Di, 18.03.2025 · 11:30",
    choices: [
      {
        id: "sprint_doc",
        icon: "FileText",
        label: "Sofort-Sprint: Verarbeitungsverzeichnis vervollständigen",
        sublabel: "3 Ressourcen vollständig freistellen",
        consequence:
          "Das Team dokumentiert alle 47 SAP-Datenflüsse in 9 Tagen. Das Verarbeitungsverzeichnis ist vollständig. Die Prüfer sind von der Sorgfalt beeindruckt. Keine Bußgeldandrohung. Projektziel: DSGVO-konformes Go-Live bestätigt.",
        activityLog: [
          "18.03 – Sprint-Team nominiert: 3 Personen freigestellt",
          "19.03 – Kick-off: 47 Datenflüsse katalogisiert",
          "24.03 – 31/47 Einträge vollständig dokumentiert",
          "27.03 – Alle 47 Einträge abgeschlossen, QA durch DPO",
          "28.03 – Behördenprüfung ohne Beanstandung abgeschlossen",
        ],
        impact: { budget: -18, timeline: -10, stress: +12 },
      },
      {
        id: "dpo_allein",
        icon: "User",
        label: "DPO eigenverantwortlich handeln lassen",
        sublabel: "Delegation an Datenschutzbeauftragte",
        consequence:
          "Die DPO schafft es, 70% zu dokumentieren. Die Prüfer akzeptieren den Status, stellen aber einen Mängelbescheid aus. Corrective Action Plan mit 90 Tagen Frist. Kein Bußgeld, aber ein Makel im Projektbericht.",
        activityLog: [
          "18.03 – DPO übernimmt vollständig die Aufgabe",
          "27.03 – 33/47 Datenflüsse dokumentiert (70%)",
          "28.03 – Prüfung: Mängelbescheid ausgestellt",
          "29.03 – Corrective Action Plan (90 Tage) akzeptiert",
          "28.06 – Nachaudit geplant",
        ],
        impact: { budget: -5, timeline: 0, stress: +10 },
      },
      {
        id: "verschiebung",
        icon: "CalendarOff",
        label: "Prüfungstermin verschieben lassen",
        sublabel: "Formalen Antrag auf Terminverschiebung stellen",
        consequence:
          "Die Behörde gewährt 4 Wochen Aufschub. Neuer Termin: 25.04. In der Zwischenzeit kommen 2 weitere offene Punkte hinzu. Die verlängerte Prüfung ist umfangreicher. Druck verlagert sich — er geht nicht weg.",
        activityLog: [
          "19.03 – Antrag auf Verschiebung gestellt (Begründung: laufende Migration)",
          "20.03 – Behörde gewährt Aufschub bis 25.04.2025",
          "21.03 – Zwei neue Datenflüsse in SAP entdeckt und gemeldet",
          "25.04 – Umfangreichere Prüfung (2 Prüfer statt 1)",
          "26.04 – Ergebnis: 2 Mängel, Corrective Action Plan 60 Tage",
        ],
        impact: { budget: -3, timeline: -5, stress: +5 },
      },
    ],
  },
  {
    id: "summer_vacation",
    priority: "P2",
    system: "Projektmanagement",
    category: "Ressourcen / HR",
    title: "Urlaubsplanung blockiert kritischen Projektpfad",
    description:
      "Gemäß Bundesurlaubsgesetz und Tarifvertrag haben 9 von 14 Kernteammitgliedern im Juli genehmigten Urlaub beantragt. Der kritische Pfad (Schnittstellentests S/4HANA ↔ TM-System) liegt genau in KW 27–29. Ohne das Team: Stillstand. Eskalation durch PMO.",
    reportedBy: { name: "Andrea Hofbauer", role: "PMO / Projektcontrolling", initials: "AH" },
    timestamp: "Mi, 19.03.2025 · 08:45",
    choices: [
      {
        id: "staffeln",
        icon: "CalendarRange",
        label: "Gestaffelte Urlaube vereinbaren",
        sublabel: "Freiwillig Verschiebung gegen Ausgleich verhandeln",
        consequence:
          "4 von 9 Mitarbeitern stimmen einer Verschiebung zu (mit je 2 Zusatztagen und bevorzugter Urlaubsplanung 2026). 5 bleiben im Juli. Die Tests laufen mit 55% Kapazität durch. Kritischer Pfad bleibt 11 Tage hinter Plan.",
        activityLog: [
          "20.03 – Freiwilligenaktion kommuniziert, Incentive-Angebot formuliert",
          "24.03 – 4 Mitarbeiter stimmen Verschiebung zu, 5 bleiben bei Juliurlaub",
          "01.07 – Schnittstellentests mit reduzierter Besetzung gestartet",
          "18.07 – 60% der Tests abgeschlossen",
          "04.08 – Team vollständig zurück, Tests bis 12.08 abgeschlossen",
        ],
        impact: { budget: -10, timeline: -11, stress: +12 },
      },
      {
        id: "freeze",
        icon: "PauseCircle",
        label: "Kritischen Pfad einfrieren",
        sublabel: "Nicht-kritische Aufgaben priorisieren, Tests auf August verschieben",
        consequence:
          "Der Juli wird für Dokumentation, Training und nicht-kritische Konfiguration genutzt. Das Team kommt erholt zurück. Die Tests im August laufen effizient. Das Team hat das beste Sprint-Velocity seit Projektbeginn. Timeline verschiebt sich um 14 Tage.",
        activityLog: [
          "21.03 – Entscheidung: Kritischer Pfad eingefroren für KW 27–29",
          "Juli – Dokumentationssprint, Trainingsunterlagen, UAT-Vorbereitung",
          "04.08 – Team vollständig, motiviert, gut erholt",
          "06.08 – Schnittstellentests gestartet: 100% Kapazität",
          "20.08 – Alle Tests abgeschlossen, Qualität: sehr gut",
        ],
        impact: { budget: 0, timeline: -14, stress: -10 },
      },
      {
        id: "extern",
        icon: "UserPlus",
        label: "Externe Berater für Urlaubszeit beauftragen",
        sublabel: "Temporäre Projektunterstützung durch SAP-Partner",
        consequence:
          "Das Beratungsunternehmen stellt 3 Berater. Die fehlenden Systemnkenntnisse führen zu 2 fehlerhaften Schnittstellenkonfigurationen, die das zurückkehrende Team 5 Tage lang korrigieren muss. Teuer und nicht effektiver als Freeze.",
        activityLog: [
          "22.03 – Consulting-Unternehmen Accenture beauftragt (3 Berater)",
          "01.07 – Berater eingearbeitet (3 Tage Onboarding benötigt)",
          "10.07 – 2 Fehlkonfigurationen in Schnittstelle FI/TM entdeckt",
          "05.08 – Rückkehrendes Team nimmt Fehlerkorrektur vor",
          "10.08 – Korrektur abgeschlossen, Tests neu gestartet",
        ],
        impact: { budget: -25, timeline: -8, stress: +8 },
      },
    ],
  },
  {
    id: "scope_creep",
    priority: "P2",
    system: "SAP Analytics Cloud",
    category: "Projektumfang",
    title: "Vorstand fordert Analytics Cloud in aktuellen Rollout",
    description:
      "Nach Rückkehr von der SAP Sapphire-Konferenz in Frankfurt fordert der CFO Dr. Matthias Breuer die Integration von SAP Analytics Cloud (SAC) mit Predictive Planning in das laufende S/4HANA-Projekt. Begründung: 'Haben wir in der Demo gesehen, klingt nicht komplex.' Keine Budget- oder Zeitplananpassung vorgesehen.",
    reportedBy: { name: "Dr. Matthias Breuer", role: "CFO / Projektsponsor", initials: "MB" },
    timestamp: "Do, 20.03.2025 · 14:00",
    choices: [
      {
        id: "phase2",
        icon: "GitBranch",
        label: "Strukturierter Phase-2-Vorschlag",
        sublabel: "Business Case für SAC-Rollout in Phase 2 erarbeiten",
        consequence:
          "Sie präsentieren dem CFO einen 12-seitigen Business Case: Phase 2 mit SAC startet 3 Monate nach Go-Live. Integration erhält eigenes Budget und Timeline. Der CFO akzeptiert — er schätzt den strukturierten Ansatz. Ihre Reputation als PM steigt erheblich.",
        activityLog: [
          "21.03 – Business-Case-Erstellung (2 Tage)",
          "24.03 – Präsentation vor CFO und Steering Committee",
          "24.03 – Entscheidung: SAC als Phase 2 genehmigt",
          "25.03 – Phase-2-Projektcharta erstellt",
          "26.03 – Aktuelles Projekt fortgesetzt ohne Scope-Erweiterung",
        ],
        impact: { budget: -5, timeline: 0, stress: -8 },
      },
      {
        id: "poc",
        icon: "FlaskConical",
        label: "Proof of Concept (PoC) durchführen",
        sublabel: "2-wöchiger technischer Assessment-Sprint",
        consequence:
          "Der PoC zeigt: SAC-Integration ist 6-mal komplexer als die Konferenzdemo. Aufwand: 8 Mannmonate. Der CFO ist überrascht und lenkt ein. SAC wird Phase 2. Sie sind jetzt der Held des Projekts. Kosten für PoC: €35k.",
        activityLog: [
          "21.03 – PoC gestartet: 2 Techniker, 2 Wochen",
          "04.04 – PoC-Ergebnis: Integrationskomplexität 6× höher als erwartet",
          "07.04 – Präsentation CFO: SAC in Phase 2 verschoben",
          "08.04 – Teamjubel: Scope-Erweiterung abgewendet",
          "09.04 – PoC-Dokumentation als Input für Phase-2-Planung archiviert",
        ],
        impact: { budget: -12, timeline: -8, stress: +5 },
      },
      {
        id: "akzeptieren",
        icon: "CheckSquare",
        label: "Scope akzeptieren und einplanen",
        sublabel: "SAC in laufendes Projekt integrieren, Budget und Zeit neu verhandeln",
        consequence:
          "Das Team übernimmt SAC. Budget +€400k, Timeline +8 Wochen. Das Team ist überlastet. Die Qualität der S/4HANA-Kernimplementierung leidet. Bei der Hypercare-Phase sind zwei Leads im Krankenstand — Burnout.",
        activityLog: [
          "21.03 – Scope-Erweiterung formell akzeptiert",
          "22.03 – Replanung: Budget +€400k, Timeline +8 Wochen",
          "April – Teambelastung kritisch, Krankenstandsquote steigt",
          "Mai – 2 Senior-Entwickler im Krankenstand (Burnout)",
          "Juni – Qualitätsprobleme in FI-Kernmodul entdeckt",
        ],
        impact: { budget: -35, timeline: -30, stress: +28 },
      },
    ],
  },
  {
    id: "feierabend",
    priority: "P1",
    system: "SAP PI/PO (Integrationsplattform)",
    category: "Technical / Betrieb",
    title: "Kritische Schnittstelle ausgefallen – 17:47 Uhr",
    description:
      "Die SAP PI/PO-Schnittstelle IF_FI_LIEFERANT_001 zur Lieferantenabrechnung ist seit 17:23 Uhr ausgefallen. Batchlauf des Lieferanten Bosch GmbH startet um 18:00 Uhr. 4.100 Rechnungen werden nicht übermittelt. Der zuständige Integrationsmanager hat Feierabend gemacht und ist nicht erreichbar.",
    reportedBy: { name: "System Alert", role: "SAP PI/PO Monitoring · Automatisch", initials: "SA" },
    timestamp: "Fr, 21.03.2025 · 17:47",
    choices: [
      {
        id: "notfall",
        icon: "Phone",
        label: "Notfallprotokoll aktivieren",
        sublabel: "Integrationsmanager via Notfallkontakt erreichen",
        consequence:
          "Herr Becker wird um 17:52 Uhr erreicht. Er loggt sich von zuhause ein und behebt das Problem in 38 Minuten. Die Schnittstelle läuft um 18:30 Uhr. Bosch GmbH erhält alle Rechnungen. Am Montag wird ein formales On-Call-Protokoll eingeführt.",
        activityLog: [
          "17:52 – Integrationsmanager erreicht (privates Mobiltelefon)",
          "17:55 – Remote-Einwahl in SAP-System",
          "18:20 – Fehlerursache identifiziert: Zertifikat abgelaufen",
          "18:30 – Zertifikat erneuert, Schnittstelle aktiv",
          "18:35 – Bosch-Batchlauf manuell neu gestartet, alle 4.100 Rechnungen übermittelt",
        ],
        impact: { budget: -5, timeline: 0, stress: +15 },
      },
      {
        id: "verschieben",
        icon: "Clock",
        label: "Lieferantenlauf verschieben",
        sublabel: "Bosch GmbH kontaktieren und Batchlauf auf Samstag verlegen",
        consequence:
          "Bosch GmbH stimmt einer Verschiebung auf 08:00 Uhr Samstag zu. Die Schnittstelle wird am Freitagabend repariert. Der Batchlauf am Samstag läuft problemlos. On-Call-Protokoll wird bis Montag formalisiert.",
        activityLog: [
          "17:52 – Bosch-GmbH-Kontakt angerufen: Verschiebung vereinbart",
          "17:55 – Verschiebung auf Sa, 08:00 Uhr bestätigt",
          "Sa 07:30 – Schnittstelle repariert (Zertifikat erneuert)",
          "Sa 08:00 – Batchlauf startet, alle 4.100 Rechnungen verarbeitet",
          "Mo 09:00 – On-Call-Protokoll erstellt und von IT-Leitung unterschrieben",
        ],
        impact: { budget: 0, timeline: -3, stress: +8 },
      },
      {
        id: "junior",
        icon: "UserCheck",
        label: "Junior-Entwickler übernehmen lassen",
        sublabel: "Anwesenden Entwickler mit der Behebung beauftragen",
        consequence:
          "Der Junior-Entwickler ändert die Mapping-Konfiguration. Das Zertifikat-Problem bleibt. 3 Tage später entdeckt das Team, dass die Mappings fehlerhafte Beträge erzeugen. 200 Rechnungen müssen storniert und neu erstellt werden. Aufwand: 2 Tage.",
        activityLog: [
          "17:55 – Junior-Entwickler übernimmt",
          "18:45 – Schnittstelle läuft wieder (teilweise Lösung)",
          "18:50 – Bosch-Batchlauf gestartet, Rechnungen scheinbar OK",
          "25.03 – FI-Team entdeckt fehlerhafte Beträge in 200 Rechnungen",
          "26.03 – Storno und Neubuchung aller 200 Rechnungen (2 Tage Aufwand)",
        ],
        impact: { budget: -5, timeline: -3, stress: +22 },
      },
    ],
  },
  {
    id: "doku_schulden",
    priority: "P3",
    system: "SAP Solution Manager / ITSM",
    category: "Qualität / Audit",
    title: "ISO-Audit: 68% der Z-Entwicklungen undokumentiert",
    description:
      "Das interne Audit im Rahmen der ISO-27001-Rezertifizierung hat ergeben: 68 von 100 SAP-Customizing-Einträge und Z-Entwicklungen haben keine technische Dokumentation im SAP Solution Manager. Frist laut Auditbericht: 6 Wochen. Ohne Korrekturen: Verlust der ISO-27001-Zertifizierung.",
    reportedBy: { name: "Markus Steiner", role: "IT-Security / ISO-Beauftragter", initials: "MS" },
    timestamp: "Mo, 24.03.2025 · 10:00",
    choices: [
      {
        id: "doku_sprint",
        icon: "BookOpen",
        label: "Dedizierter Dokumentations-Sprint",
        sublabel: "Entwicklungsstopp für 2 Wochen, alle dokumentieren",
        consequence:
          "Das Team dokumentiert alle 68 Einträge in 12 Arbeitstagen. Der Qualitätsstandard ist hoch. Das ISO-Audit-Follow-up bescheinigt vollständige Konformität. Die ISO-27001-Zertifizierung bleibt erhalten. Nebeneffekt: Wiki wird tatsächlich gepflegt.",
        activityLog: [
          "24.03 – Sprint-Kickoff: alle Entwickler 2 Wochen freigestellt",
          "25.03 – Templates für Solution Manager erstellt",
          "04.04 – 50/68 Einträge dokumentiert",
          "07.04 – 68/68 abgeschlossen, interne QA abgenommen",
          "10.04 – ISO-Follow-up-Audit: keine Abweichungen",
        ],
        impact: { budget: -14, timeline: -15, stress: +10 },
      },
      {
        id: "ki_tool",
        icon: "Cpu",
        label: "KI-gestützte Code-Dokumentation testen",
        sublabel: "ABAP-Dokumentationstool aus SAP BTP pilotieren",
        consequence:
          "Das KI-Tool generiert Dokumentation für 82% der Einträge automatisch. 18% sind unbrauchbar und werden manuell ergänzt. Die Qualität ist 'ausreichend' laut Auditor. ISO bleibt — mit einem 'Beobachtungspunkt'. Tool wird dauerhaft lizenziert.",
        activityLog: [
          "24.03 – SAP BTP ABAP-Doc-Tool lizenziert und eingerichtet",
          "25.03 – Automatischer Dokumentationslauf: 82% Erfolgsquote",
          "31.03 – Manuelle Nacharbeit: 12 kritische Einträge überarbeitet",
          "08.04 – Audit-Follow-up: ISO bestätigt mit 1 Beobachtungspunkt",
          "09.04 – Tool dauerhaft im Team-Prozess integriert",
        ],
        impact: { budget: -18, timeline: +5, stress: -5 },
      },
      {
        id: "risiko",
        icon: "AlertTriangle",
        label: "Risiko formal akzeptieren",
        sublabel: "Risikoakzeptanz ins Risikoregister eintragen, nach Go-Live dokumentieren",
        consequence:
          "Der Auditor stellt eine 'schwerwiegende Abweichung' fest. Die ISO-27001-Zertifizierung wird für 3 Monate ausgesetzt. Kunden und Partner werden informiert. Reputationsschaden. Das Management eskaliert — der Projektleiter wird zu einem Klärungsgespräch gebeten.",
        activityLog: [
          "24.03 – Risikoakzeptanz im Risikoregister eingetragen",
          "27.03 – ISO-Auditor wird über offene Punkte informiert",
          "28.03 – Abweichungsbericht: 'Schwerwiegende Abweichung' festgestellt",
          "05.04 – ISO-27001-Zertifizierung ausgesetzt (3 Monate)",
          "06.04 – Kundenkommunikation und Management-Eskalation",
        ],
        impact: { budget: 0, timeline: 0, stress: +20 },
      },
    ],
  },
  {
    id: "key_user",
    priority: "P2",
    system: "Projektorganisation",
    category: "Change Management",
    title: "3 Key User beantragen Rückzug aus dem Projekt",
    description:
      "Von den 15 nominierten SAP Key Usern haben drei Mitarbeiter (aus Logistik, Einkauf und FI) formell bei ihren Führungskräften eine 'Entpflichtung' beantragt. Begründung: Reguläre Arbeitsbelastung + Projektaufgaben + Schulungsunterlagen = nicht leistbar ohne Freistellung.",
    reportedBy: { name: "Andrea Hofbauer", role: "PMO / Projektcontrolling", initials: "AH" },
    timestamp: "Di, 25.03.2025 · 09:30",
    choices: [
      {
        id: "freistellung",
        icon: "CalendarCheck",
        label: "Formelle Freistellung (50%) erwirken",
        sublabel: "Mit Abteilungsleitern verbindliche Kapazitätsregelung vereinbaren",
        consequence:
          "Nach Verhandlungen mit Abteilungsleitern werden alle 15 Key User zu 50% freigestellt. Die Key User sind motiviert und investiert. Die Trainingsqualität steigt messbar. 3 Key User beantragen nach Go-Live eine dauerhafte SAP-Rolle.",
        activityLog: [
          "26.03 – Gespräche mit 6 Abteilungsleitern geführt",
          "28.03 – Freistellungsvereinbarungen für alle 15 Key User unterzeichnet",
          "01.04 – Key User vollständig entlastet, Projektarbeit erhöht",
          "30.04 – Schulungsunterlagen vollständig, Qualität: sehr gut",
          "Go-Live – 3 Key User beantragen permanente SAP-Rolle im Betrieb",
        ],
        impact: { budget: -12, timeline: 0, stress: -18 },
      },
      {
        id: "trainer",
        icon: "GraduationCap",
        label: "Professionelle SAP-Trainer beauftragen",
        sublabel: "Schulungsunterlagen extern erstellen lassen (SAP Education)",
        consequence:
          "SAP Education erstellt alle Trainingsunterlagen professionell. Key User müssen nur noch Inhalte reviewen. Drei der Key User bleiben gern im Projekt. Die Trainingsqualität ist exzellent — Abnahme durch alle Fachbereiche ohne Änderungswünsche.",
        activityLog: [
          "26.03 – SAP Education-Auftrag erteilt (€65k)",
          "15.04 – Erster Entwurf Schulungsunterlagen geliefert",
          "22.04 – Review durch Key User abgeschlossen (minimale Anpassungen)",
          "30.04 – Finale Unterlagen abgenommen",
          "Key User – Fokus auf Fach-Testing und Endanwender-Support",
        ],
        impact: { budget: -22, timeline: +5, stress: -20 },
      },
      {
        id: "bonus",
        icon: "Award",
        label: "Projektbonus vereinbaren",
        sublabel: "Einmalige Prämie bei erfolgreichem Go-Live",
        consequence:
          "Der Bonus motiviert kurzfristig. Die Belastung bleibt jedoch unverändert. Im Mai melden sich 2 Key User krank (Burnout). Ein Key User wird kurzfristig durch eine uneingearbeitete Kollegin ersetzt — 3 Wochen vor Go-Live eine Katastrophe.",
        activityLog: [
          "26.03 – Bonusvereinbarung: €1.500 pro Key User bei Go-Live",
          "März–April – Überlastung weiterhin vorhanden",
          "12.05 – 2 Key User krankgeschrieben (Burnout)",
          "15.05 – Notbesetzung durch ungeschulte Mitarbeiter",
          "Go-Live – Qualitätsprobleme in Logistik und Einkauf",
        ],
        impact: { budget: -15, timeline: 0, stress: -5 },
      },
    ],
  },
  {
    id: "golive_druck",
    priority: "P1",
    system: "Projektmanagement / Steering",
    category: "Go-Live Entscheidung",
    title: "Steering Committee: 47 offene Punkte, Go-Live in 3 Wochen",
    description:
      "Im wöchentlichen Steering-Committee-Meeting präsentiert Andrea Hofbauer: 47 offene Punkte im Backlog, davon 12 als kritisch klassifiziert. Go-Live-Termin 12.04.2025 wurde auf der Hauptversammlung kommuniziert. CEO Dr. Klaus Richter: 'Der Termin steht.' Ihr Risikoregister sagt: 'Not Ready.'",
    reportedBy: { name: "Dr. Klaus Richter", role: "CEO / Lenkungsausschuss", initials: "KR" },
    timestamp: "Mi, 26.03.2025 · 16:00",
    choices: [
      {
        id: "warroom",
        icon: "Zap",
        label: "War-Room einrichten, Termin halten",
        sublabel: "12 kritische Punkte in 3 Wochen im War-Room schließen",
        consequence:
          "Der War-Room schließt 10 von 12 kritischen Punkten. Go-Live findet statt. In Woche 1 nach Go-Live: 8 kritische Incidents, Hypercare-Team arbeitet 16-Stunden-Schichten. Nach 4 Wochen stabil. Das Projekt gilt offiziell als Erfolg — intern weiß man es besser.",
        activityLog: [
          "27.03 – War-Room konstituiert: 8 Senior-Entwickler, Täglich 08:00–22:00",
          "10.04 – 10/12 kritische Punkte geschlossen, 2 als 'akzeptables Risiko' deklariert",
          "12.04 – Go-Live plangemäß — unter erheblichem Druck",
          "15.04 – 8 P1-Incidents im Hypercare, War-Room verlängert",
          "10.05 – System stabil, Hypercare abgeschlossen",
        ],
        impact: { budget: -22, timeline: +10, stress: +28 },
      },
      {
        id: "pilotwerk",
        icon: "Factory",
        label: "Soft-Launch: Pilot-Werk zuerst",
        sublabel: "Go-Live zunächst für Werk München (300 User), dann Rollout",
        consequence:
          "Der Pilot-Start in München verläuft kontrolliert. 8 weitere kritische Punkte werden in der Realumgebung identifiziert. Der vollständige Rollout erfolgt 5 Wochen später und ist deutlich stabiler. CEO ist nach anfänglichem Widerstand zufrieden.",
        activityLog: [
          "27.03 – Pilot-Konzept erstellt und von Steering gebilligt",
          "12.04 – Go-Live Werk München (300 User, geplant)",
          "12.04 – 8 weitere Punkte in Produktivumgebung entdeckt",
          "14.04–30.04 – Korrekturen in kontrollierter Umgebung",
          "17.05 – Vollständiger Rollout, stabil und professionell",
        ],
        impact: { budget: -12, timeline: -20, stress: -10 },
      },
      {
        id: "formelle_verschiebung",
        icon: "FileWarning",
        label: "Formellen Risikoantrag stellen",
        sublabel: "Schriftliche Empfehlung: Go-Live-Verschiebung um 4 Wochen",
        consequence:
          "Der CFO unterstützt nach Lektüre des Risikoberichts die Verschiebung. CEO ist frustriert, akzeptiert aber den Bericht. 4 Wochen werden genutzt, alle 47 Punkte zu schließen. Go-Live am 10.05. läuft sauber durch — nahezu keine Hypercare-Incidents.",
        activityLog: [
          "27.03 – 12-seitiger Risikobericht an Steering übermittelt",
          "28.03 – CFO unterstützt Verschiebung, CEO stimmte zu (widerwillig)",
          "Offizielle Kommunikation: Go-Live verschoben auf 10.05.2025",
          "April – Alle 47 Punkte geschlossen, UAT wiederholt",
          "10.05 – Go-Live: 0 P1-Incidents in Woche 1",
        ],
        impact: { budget: -8, timeline: -28, stress: -18 },
      },
    ],
  },
  {
    id: "security",
    priority: "P1",
    system: "SAP Kernel / NetWeaver",
    category: "IT-Sicherheit",
    title: "BSI-Warnung: Aktive Ausnutzung von CVE-2025-0142",
    description:
      "Das BSI (Bundesamt für Sicherheit in der Informationstechnik) warnt vor aktiver Ausnutzung der kritischen Schwachstelle CVE-2025-0142 im SAP NetWeaver AS ABAP. CVSS-Score: 9.8 (kritisch). Ihr System läuft auf SAP Kernel 785 — der Patch ist ab 789 verfügbar. Aktueller Freeze wegen Go-Live-Vorbereitung.",
    reportedBy: { name: "BSI-Warnung #2025-117", role: "Bundesamt für Sicherheit in der IT", initials: "BSI" },
    timestamp: "Do, 27.03.2025 · 08:00",
    choices: [
      {
        id: "notfallpatch",
        icon: "ShieldCheck",
        label: "Notfall-Patch einspielen (Freeze aufheben)",
        sublabel: "24h-Testlauf in QAS, dann Deployment in PRD",
        consequence:
          "Patch 789 wird nach 18-stündigem Testlauf eingespielt. Eine Z-Funktion benötigt Anpassung. System läuft nach 22 Stunden vollständig auf Patch 789. CISO stellt dem Projektteam ein formelles Lob aus. BSI-Meldung: 'Maßnahme zeitgerecht umgesetzt.'",
        activityLog: [
          "27.03 08:00 – Freeze-Aufhebung genehmigt (CISO-Unterschrift)",
          "27.03 09:00 – Kernel-Patch 789 in DEV eingespielt",
          "27.03 14:00 – QAS-Tests gestartet (Regressions-Testsuite)",
          "28.03 04:00 – PRD-Deployment: Kernel 789 aktiv",
          "28.03 06:00 – Alle Systeme stabil, BSI-Meldung geschlossen",
        ],
        impact: { budget: -18, timeline: -5, stress: +15 },
      },
      {
        id: "kompensatorisch",
        icon: "Lock",
        label: "Kompensatorische Maßnahmen implementieren",
        sublabel: "WAF-Regeln + Netzwerksegmentierung bis nächstes Wartungsfenster",
        consequence:
          "Firewall-Regeln blockieren die spezifischen Angriffsvektoren. CISO zeichnet die Maßnahme ab. Beim nächsten regulären Patch-Dienstag (4 Wochen) wird Kernel 789 regulär eingespielt. Kein Security-Incident. Pragmatisch und vertretbar.",
        activityLog: [
          "27.03 09:00 – WAF-Regeln für CVE-2025-0142 aktiviert",
          "27.03 10:00 – Netzwerksegmentierung SAP-System angepasst",
          "27.03 11:00 – CISO zeichnet kompensatorische Maßnahmen ab",
          "24.04 – Reguläres Patch-Fenster: Kernel 789 eingespielt",
          "24.04 – CVE geschlossen, Maßnahmen zurückgenommen",
        ],
        impact: { budget: -10, timeline: 0, stress: +8 },
      },
      {
        id: "risiko_akzeptanz",
        icon: "FileX",
        label: "Risiko formal akzeptieren (CISO-Unterschrift)",
        sublabel: "Risikoakzeptanz bis Go-Live, dann patchen",
        consequence:
          "Der CISO unterschreibt zögerlich. 12 Tage später identifiziert ein externer Pentester einen Angriffsversuch über die ungepatchte Schwachstelle. Die Risikoakzeptanz wird sofort zurückgezogen. Notfallpatch wird unter doppeltem Druck eingespielt. CISO ist fassungslos.",
        activityLog: [
          "27.03 – CISO unterzeichnet Risikoakzeptanz (widerwillig)",
          "08.04 – Externer Pentester meldet Angriffsversuch auf CVE-2025-0142",
          "08.04 – Risikoakzeptanz sofort widerrufen",
          "09.04 – Notfall-Patch unter Krisenbedingungen",
          "10.04 – System gepatcht, Security-Incident-Report erstellt",
        ],
        impact: { budget: 0, timeline: 0, stress: +22 },
      },
    ],
  },
  {
    id: "ust_fehler",
    priority: "P1",
    system: "SAP S/4HANA FI/CO",
    category: "Steuer-Compliance",
    title: "Umsatzsteuer-Konfiguration fehlerhaft: 7% statt 19%",
    description:
      "Das FI/CO-Team stellt fest: Für eine ganze Warengruppe wurden im Customizing der reduzierte Steuersatz 7% (Steuerkennzeichen V1) statt des Regelsteuersatzes 19% (V2) konfiguriert. Betroffen: 2 Monate Testdaten, Buchungsbelege Nr. 1000042–1003817. Steuerberater informiert. Das Finanzamt würde das als Fehler in der Buchführung werten.",
    reportedBy: { name: "Claudia Meier", role: "FI/CO Lead / Steuerreferentin", initials: "CM" },
    timestamp: "Fr, 28.03.2025 · 15:20",
    choices: [
      {
        id: "vollkorrektur",
        icon: "CheckCircle",
        label: "Vollständige Neukonfiguration mit Testlauf",
        sublabel: "DEV → QAS → PRD mit vollständiger Regressionstestung",
        consequence:
          "Die Konfiguration wird korrekt in DEV angepasst, vollständig getestet und über den regulären Transport-Pfad eingespielt. Der externe Steuerberater prüft und zertifiziert die SAP-Steuerkonfiguration. Ergebnis: einwandfrei und finanzamtstauglich.",
        activityLog: [
          "28.03 – Korrekte Konfiguration in DEV erstellt",
          "31.03 – Volles Regressionstesting in QAS (Steuerkennzeichen V1–V9)",
          "02.04 – Transport in PRD eingespielt",
          "03.04 – Steuerberater Dr. Fischer prüft und zertifiziert",
          "04.04 – DSGVO-konforme Korrektur aller Test-Buchungsbelege",
        ],
        impact: { budget: -15, timeline: -18, stress: +10 },
      },
      {
        id: "quickfix",
        icon: "Wrench",
        label: "Direktkorrektur im QAS-System",
        sublabel: "Schnellkorrektur ohne vollen Transportpfad",
        consequence:
          "Die Schnellkorrektur funktioniert für V1/V2, übersieht aber eine abhängige Konditionstabelle. Beim UAT werden 3 weitere Steuerfehler entdeckt. Die Nacharbeit kostet mehr Zeit als die ordentliche Lösung. Der Steuerberater ist unzufrieden.",
        activityLog: [
          "29.03 – Direktkorrektur in QAS (Transportpfad übersprungen)",
          "01.04 – UAT-Phase: 3 weitere Steuer-Fehlkonfigurationen entdeckt",
          "02.04 – Nacharbeit: 3 weitere Transporte erstellt",
          "07.04 – Alle Korrekturen eingespielt (doppelter Aufwand)",
          "08.04 – Steuerberater moniert fehlende Dokumentation",
        ],
        impact: { budget: -8, timeline: +5, stress: +15 },
      },
      {
        id: "steuerberater",
        icon: "Briefcase",
        label: "Steuerberater mit Vollkonfiguration beauftragen",
        sublabel: "SAP FI Tax Consultant für komplettes Tax-Audit",
        consequence:
          "Der SAP-FI-Spezialist führt ein vollständiges Tax-Audit durch und entdeckt 3 weitere Steuer-Issues zusätzlich zum gemeldeten. Alle werden behoben. Ergebnis: Der SAP-Tax-Report ist der sauberste im ganzen Konzern. Auditor lobt explizit.",
        activityLog: [
          "29.03 – SAP FI Tax Consultant Müller & Partner beauftragt",
          "01.04 – Tax-Audit gestartet: 3 weitere Issues gefunden",
          "08.04 – Alle Issues behoben, vollständige Dokumentation",
          "10.04 – Steuerberater zertifiziert Konfiguration",
          "12.04 – Tax-Report im Konzernvergleich: 'Best Practice'",
        ],
        impact: { budget: -25, timeline: -5, stress: -12 },
      },
    ],
  },
  {
    id: "wissenstransfer",
    priority: "P2",
    system: "Projektorganisation",
    category: "Wissensmanagement",
    title: "SAP-Berater kündigt – kritisches Wissen droht verloren zu gehen",
    description:
      "Herr Ibrahim Al-Hassan (Senior SAP ABAP-Entwickler, 3 Jahre im Projekt) hat zum 30.04. gekündigt. Er ist alleiniger Wissensträger für 14 kritische ABAP-Eigenentwicklungen und die gesamte RFC-Architektur. Nachfolger nicht vorhanden. Go-Live: 12.04.",
    reportedBy: { name: "Ibrahim Al-Hassan", role: "Senior SAP ABAP Developer", initials: "IA" },
    timestamp: "Mo, 31.03.2025 · 09:00",
    choices: [
      {
        id: "intensiv_doku",
        icon: "BookMarked",
        label: "Intensiver Wissenstransfer sofort starten",
        sublabel: "Ibrahim vollständig für Transfer freistellen (bis 30.04.)",
        consequence:
          "Ibrahim dokumentiert alle 14 Eigenentwicklungen, erstellt RFC-Architektur-Diagramme und hält 5 Übergabesessions ab. Sein Nachfolger (Frau Katja Müller, intern) übernimmt 90% des Wissens. Das Risiko sinkt von kritisch auf moderat.",
        activityLog: [
          "01.04 – Intensiv-Transfer gestartet: Ibrahim 100% freigestellt",
          "01.–10.04 – Dokumentation aller 14 ABAP-Entwicklungen",
          "14.–18.04 – 5 Übergabesessions mit Katja Müller",
          "25.04 – RFC-Architektur vollständig dokumentiert",
          "30.04 – Ibrahim scheidet aus: Wissensrisiko stark reduziert",
        ],
        impact: { budget: -8, timeline: 0, stress: -10 },
      },
      {
        id: "verlaengern",
        icon: "UserCheck",
        label: "Vertragsverlängerung anbieten",
        sublabel: "Zusatzvertrag bis 30.06. mit Prämie anbieten",
        consequence:
          "Ibrahim nimmt das Angebot an und bleibt bis 30.06. Der Go-Live läuft mit vollem ABAP-Support. Nach seinem Abgang ist der Wissenstransfer immer noch unvollständig — diesmal war schlicht zu wenig Zeit. Lessons Learned: Frühzeitiger Wissenstransfer.",
        activityLog: [
          "01.04 – Angebot: +€8.000 Prämie für Verlängerung bis 30.06.",
          "02.04 – Ibrahim nimmt an",
          "12.04 – Go-Live mit vollem ABAP-Support",
          "Mai–Jun – Partieller Wissenstransfer läuft nebenher",
          "30.06 – Ibrahim geht: 60% Transfer dokumentiert",
        ],
        impact: { budget: -20, timeline: +5, stress: -5 },
      },
      {
        id: "externer",
        icon: "Search",
        label: "Externen ABAP-Spezialisten rekrutieren",
        sublabel: "Sofortsuche über SAP-Partnerunternehmen",
        consequence:
          "Ein externer Spezialist wird gefunden, aber erst ab 01.05. verfügbar. 4 Tage Einarbeitung. Der Go-Live läuft ohne ABAP-Backup. Ein kritisches RFC-Problem am Go-Live-Tag kann nicht sofort gelöst werden — 6 Stunden Systemstillstand.",
        activityLog: [
          "01.04 – Suche über 3 SAP-Partnerunternehmen gestartet",
          "14.04 – Kandidat gefunden: Start 01.05.",
          "12.04 – Go-Live ohne ABAP-Backup",
          "12.04 – RFC-Problem: 6h Systemstillstand (kein ABAP-Know-how vor Ort)",
          "01.05 – Neuer Spezialist beginnt, RFC-Problem endgültig gelöst",
        ],
        impact: { budget: -15, timeline: -10, stress: +18 },
      },
    ],
  },
];

// ─── Endings ────────────────────────────────────────────────────────
export const ENDINGS = {
  success: {
    grade: "A",
    kpiStatus: "Alle KPIs im grünen Bereich",
    title: "Musterprojekt erfolgreich abgeschlossen",
    summary:
      "Das S/4HANA-Projekt wurde professionell und strukturiert durchgeführt. Budget eingehalten, Timeline respektiert, Team motiviert. Der Vorstand spricht von einem 'Vorzeigeprojekt'. Das System läuft stabil — keine P1-Incidents in den ersten 30 Tagen.",
    recommendation:
      "Empfehlung des Lenkungsausschusses: Dieses Projekt als interne Best Practice dokumentieren und als Template für Phase 2 verwenden.",
    color: "#107E3E",
    bgColor: "#F5FAF6",
  },
  good: {
    grade: "B",
    kpiStatus: "KPIs weitgehend eingehalten",
    title: "Projekt erfolgreich abgeschlossen",
    summary:
      "Das SAP-System ist live und stabil. Einige Kompromisse wurden gemacht, aber das Ergebnis ist solide. Der Betriebsrat hat sein Einverständnis gegeben, das Finanzamt hat nichts zu beanstanden, und die Endanwender kommen mit dem System zurecht.",
    recommendation:
      "Empfehlung: Lessons-Learned-Workshop durchführen und Ergebnisse in die Phase-2-Planung einbeziehen.",
    color: "#0070F2",
    bgColor: "#EBF5FE",
  },
  average: {
    grade: "C",
    kpiStatus: "KPIs mit Abweichungen",
    title: "Projektabschluss mit Nachbesserungsbedarf",
    summary:
      "Das SAP-System läuft, aber der Weg war holprig. Mehrere Hypercare-Incidents, offene Compliance-Punkte und ein erschöpftes Team prägen das Bild. Das System ist stabil — aber die Narben sind sichtbar.",
    recommendation:
      "Pflichtmaßnahme: Corrective Action Plan für offene Compliance-Punkte innerhalb von 90 Tagen erstellen.",
    color: "#E9730C",
    bgColor: "#FEF7F1",
  },
  poor: {
    grade: "D",
    kpiStatus: "KPIs deutlich verfehlt",
    title: "Projektabschluss mit erheblichen Mängeln",
    summary:
      "Budget überschritten, Timeline massiv verzögert, Team mit hohem Krankenstand. Das System läuft technisch, aber die organisatorischen und rechtlichen Folgen beschäftigen das Unternehmen noch Monate nach Go-Live.",
    recommendation:
      "Krisenmaßnahme: Stabsstelle zur Projektaufarbeitung einsetzen. Alle offenen Betriebsvereinbarungen, ISO-Abweichungen und Compliancepunkte innerhalb von 60 Tagen klären.",
    color: "#BB0000",
    bgColor: "#FFF0F0",
  },
  failure: {
    grade: "F",
    kpiStatus: "Projekt in kritischem Zustand",
    title: "Projektnotstand — externer Krisenmanager eingesetzt",
    summary:
      "Der Lenkungsausschuss hat einen externen Krisenmanager beauftragt. Das Projekt wird in einem strukturierten Review-Prozess aufgearbeitet. Das SAP-System ist instabil, mehrere Compliance-Verstöße sind aktenkundig, und das Team ist faktisch handlungsunfähig.",
    recommendation:
      "Notfallmaßnahme: Systemstabilisierung Vorrang vor allem anderen. Externe Revision innerhalb von 2 Wochen. Alle Schlüsselpersonen für Befragung verfügbar halten.",
    color: "#BB0000",
    bgColor: "#FFF0F0",
  },
};
