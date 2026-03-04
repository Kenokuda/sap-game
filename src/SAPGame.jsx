import { useState, useCallback } from "react";
import {
  Bell, ChevronRight, RotateCcw, AlertTriangle,
  CheckCircle, Clock, DollarSign, Calendar,
  Shield, FileText, Users, Phone, Monitor, Scale, FileSignature,
  CalendarCheck, GraduationCap, Award, Zap, Factory, FileWarning,
  ShieldCheck, Lock, FileX, Wrench, Headphones, Cpu, BookOpen,
  FlaskConical, GitBranch, CheckSquare, CalendarRange,
  PauseCircle, UserPlus, BookMarked, UserCheck, Search, Briefcase,
  BarChart3, CalendarOff, Building2, TrendingDown, Activity,
} from "lucide-react";
import {
  EVENTS, ENDINGS,
  budgetDisplay, daysLeft, goLiveDate, riskInfo,
} from "./gameData";

// ─── Constants ────────────────────────────────────────────────────────
const TOTAL_ROUNDS = 8;
const INITIAL = { budget: 100, timeline: 100, stress: 0 };

const ICON_MAP = {
  RotateCcw, Wrench, Headphones, FileSignature, Scale, Monitor,
  FileText, CalendarRange, PauseCircle, UserPlus, GitBranch, FlaskConical,
  CheckSquare, Phone, Clock, UserCheck, BookOpen, Cpu, AlertTriangle,
  ShieldCheck, Lock, FileX, CalendarCheck, GraduationCap, Award,
  Zap, Factory, FileWarning, CheckCircle, BookMarked, Search, Briefcase, CalendarOff,
};

const PHASES = { INTRO: "intro", PLAYING: "playing", CONSEQUENCE: "consequence", GAME_OVER: "game_over" };

// ─── SAP Fiori Horizon Design Tokens ─────────────────────────────────
const S = {
  shell:  "#1C2129",
  bg:     "#F5F6F7",
  white:  "#FFFFFF",
  blue:   "#0070F2",
  green:  "#107E3E",
  orange: "#E9730C",
  red:    "#BB0000",
  border: "#E4E4E4",
  text:   "#32363A",
  sub:    "#6A6D70",
  muted:  "#A9AAAB",
};

// ─── Helpers ──────────────────────────────────────────────────────────
function clamp(v) { return Math.max(0, Math.min(100, v)); }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function calcEnding(s) {
  const score = s.budget + s.timeline - s.stress;
  if (score >= 130) return "success";
  if (score >= 90)  return "good";
  if (score >= 50)  return "average";
  if (score >= 10)  return "poor";
  return "failure";
}

function teamStatus(stress) {
  if (stress < 25) return { label: "Gut",      color: S.green };
  if (stress < 50) return { label: "Stabil",   color: S.orange };
  if (stress < 75) return { label: "Belastet", color: S.red };
  return              { label: "Kritisch",  color: S.red };
}

const PRIORITY = {
  P1: { color: S.red,    label: "P1 – Kritisch" },
  P2: { color: S.orange, label: "P2 – Hoch"     },
  P3: { color: S.blue,   label: "P3 – Mittel"   },
};

// ─── Shell Bar ────────────────────────────────────────────────────────
function ShellBar({ notifCount, round, phase }) {
  return (
    <div style={{ backgroundColor: S.shell }}>
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 flex items-center justify-center"
            style={{ backgroundColor: S.blue, borderRadius: 3 }}>
            <Building2 size={15} className="text-white" />
          </div>
          <div>
            <div className="text-[13px] font-bold text-white leading-tight">S/4HANA Migration DE</div>
            <div className="text-[10px] leading-tight" style={{ color: "#7A9AB5" }}>
              SIEMENS AG · Thomas Becker, PM
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {phase !== PHASES.INTRO && phase !== PHASES.GAME_OVER && (
            <span className="text-[11px] font-semibold px-2 py-0.5"
              style={{ backgroundColor: "rgba(0,112,242,0.18)", color: "#7EC8F8", borderRadius: 2 }}>
              Runde {round} / {TOTAL_ROUNDS}
            </span>
          )}
          <div className="relative">
            <Bell size={17} style={{ color: "#7A9AB5" }} />
            {notifCount > 0 && (
              <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center"
                style={{ backgroundColor: S.red, color: "#fff" }}>
                {notifCount}
              </span>
            )}
          </div>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style={{ backgroundColor: S.blue }}>
            TB
          </div>
        </div>
      </div>
      {/* Round progress strip — integrated into shell */}
      {phase !== PHASES.INTRO && phase !== PHASES.GAME_OVER && (
        <div className="flex gap-0.5 px-4 pb-2">
          {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
            <div key={i} className="flex-1 h-0.5"
              style={{
                backgroundColor: i < round ? S.blue : i === round ? "#4AABF0" : "rgba(255,255,255,0.12)",
                borderRadius: 1,
              }} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── KPI Tile ─────────────────────────────────────────────────────────
function KPITile({ icon: Icon, label, value, sub, statusColor, statusLabel, fillPct }) {
  const sc = statusColor || S.border;
  return (
    <div style={{
      backgroundColor: S.white,
      border: `1px solid ${S.border}`,
      borderLeft: `3px solid ${sc}`,
      borderRadius: 4,
      padding: "10px 12px",
    }}>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1">
          {Icon && <Icon size={10} style={{ color: S.muted }} />}
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: S.sub }}>
            {label}
          </span>
        </div>
        {statusLabel && (
          <span className="text-[9px] font-bold px-1.5 py-0.5"
            style={{ color: sc, backgroundColor: `${sc}18`, borderRadius: 2 }}>
            {statusLabel}
          </span>
        )}
      </div>
      <div className="text-[20px] font-black leading-none mb-1" style={{ color: S.text }}>{value}</div>
      {sub && <div className="text-[10px]" style={{ color: S.muted }}>{sub}</div>}
      {fillPct !== undefined && (
        <div className="mt-2" style={{ height: 2, backgroundColor: S.border, borderRadius: 1 }}>
          <div style={{
            height: "100%",
            width: `${fillPct}%`,
            backgroundColor: sc,
            borderRadius: 1,
            transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
      )}
    </div>
  );
}

// ─── KPI Dashboard ────────────────────────────────────────────────────
function KPIDashboard({ stats }) {
  const risk   = riskInfo(stats.stress);
  const team   = teamStatus(stats.stress);
  const bPct   = Math.round(stats.budget);
  const days   = daysLeft(stats.timeline);
  const glDate = goLiveDate(stats.timeline);
  const issues = Math.max(0, Math.round((100 - stats.budget) / 10) + Math.round(stats.stress / 20));

  const bColor = bPct >= 60 ? S.green : bPct >= 35 ? S.orange : S.red;
  const tColor = days >= 40 ? S.green : days >= 20 ? S.orange : S.red;

  return (
    <div className="grid grid-cols-2 gap-2 mb-3">
      <KPITile
        icon={DollarSign}
        label="Projektbudget"
        value={budgetDisplay(stats.budget)}
        sub={`${bPct}% verbleibend`}
        statusColor={bColor}
        statusLabel={bPct >= 60 ? "OK" : bPct >= 35 ? "Gefährdet" : "Kritisch"}
        fillPct={bPct}
      />
      <KPITile
        icon={Calendar}
        label="Go-Live"
        value={`${days}d`}
        sub={glDate}
        statusColor={tColor}
        statusLabel={days >= 40 ? "On Track" : days >= 20 ? "Gefährdet" : "Überschritten"}
        fillPct={Math.round((days / 90) * 100)}
      />
      <KPITile
        icon={Shield}
        label="Risikolevel"
        value={risk.label}
        sub="Gesamtrisiko"
        statusColor={risk.color}
        statusLabel={risk.level}
      />
      <KPITile
        icon={Users}
        label="Teamstatus"
        value={team.label}
        sub={`${issues} offene Punkte`}
        statusColor={team.color}
      />
    </div>
  );
}

// ─── Priority Badge ───────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const p = PRIORITY[priority] || PRIORITY.P3;
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5"
      style={{ color: p.color, backgroundColor: `${p.color}12`, border: `1px solid ${p.color}50`, borderRadius: 2 }}>
      <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />
      {p.label}
    </span>
  );
}

// ─── Incident Card ────────────────────────────────────────────────────
function IncidentCard({ event }) {
  const p = PRIORITY[event.priority] || PRIORITY.P3;
  return (
    <div className="mb-4 overflow-hidden"
      style={{
        border: `1px solid ${S.border}`,
        borderLeft: `4px solid ${p.color}`,
        borderRadius: 4,
        backgroundColor: S.white,
      }}>
      {/* Header row */}
      <div className="px-4 py-2.5 flex items-center gap-2 flex-wrap"
        style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${S.border}` }}>
        <PriorityBadge priority={event.priority} />
        <span className="text-[11px] font-semibold" style={{ color: S.blue }}>{event.system}</span>
        <span style={{ color: S.muted, fontSize: 11 }}>·</span>
        <span className="text-[11px]" style={{ color: S.sub }}>{event.category}</span>
        <span className="ml-auto text-[10px] shrink-0" style={{ color: S.muted }}>{event.timestamp}</span>
      </div>

      {/* Body */}
      <div className="px-4 pt-3 pb-3">
        <h2 className="text-[15px] font-bold leading-snug mb-2" style={{ color: S.text }}>
          {event.title}
        </h2>
        <p className="text-[13px] leading-relaxed" style={{ color: "#4B5563" }}>
          {event.description}
        </p>
      </div>

      {/* Reporter footer */}
      <div className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderTop: `1px solid ${S.border}`, backgroundColor: "#FAFAFA" }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
          style={{ backgroundColor: S.blue }}>
          {event.reportedBy.initials}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold" style={{ color: S.text }}>{event.reportedBy.name}</span>
          <span className="mx-1 text-[11px]" style={{ color: S.muted }}>·</span>
          <span className="text-[11px]" style={{ color: S.sub }}>{event.reportedBy.role}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] font-semibold shrink-0" style={{ color: S.red }}>
          <AlertTriangle size={11} />
          Entscheidung erforderlich
        </div>
      </div>
    </div>
  );
}

// ─── Impact Chips ─────────────────────────────────────────────────────
function ImpactChips({ impact }) {
  const items = [
    { label: "Budget",   val: impact.budget,   isRisk: false, good: impact.budget >= 0   },
    { label: "Timeline", val: impact.timeline,  isRisk: false, good: impact.timeline >= 0  },
    { label: "Risiko",   val: impact.stress,    isRisk: true,  good: impact.stress <= 0   },
  ];
  const visible = items.filter(i => i.val !== 0);
  if (!visible.length) return null;
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {visible.map(({ label, val, isRisk, good }) => {
        const color = good ? S.green : S.red;
        const display = isRisk
          ? `${label}: ${val > 0 ? "↑" : "↓"}`
          : `${label}: ${val > 0 ? "+" : ""}${val}`;
        return (
          <span key={label} className="text-[10px] font-bold px-1.5 py-0.5"
            style={{ color, backgroundColor: `${color}12`, border: `1px solid ${color}30`, borderRadius: 2 }}>
            {display}
          </span>
        );
      })}
    </div>
  );
}

// ─── Action Panel ─────────────────────────────────────────────────────
function ActionPanel({ choices, onSelect, disabled }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-3">
        <ChevronRight size={12} style={{ color: S.blue }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: S.sub }}>
          Handlungsoptionen ({choices.length})
        </span>
      </div>
      <div className="space-y-2">
        {choices.map((choice) => {
          const Icon = ICON_MAP[choice.icon] || CheckCircle;
          return (
            <button
              key={choice.id}
              onClick={() => onSelect(choice)}
              disabled={disabled}
              className="w-full text-left"
              style={{
                border: `1px solid ${S.border}`,
                borderRadius: 4,
                backgroundColor: S.white,
                opacity: disabled ? 0.4 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
                transition: "border-color 0.15s",
                display: "block",
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = S.blue; }}
              onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = S.border; }}
            >
              <div className="flex items-start gap-3 p-3.5">
                <div className="w-8 h-8 flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#EBF5FE", borderRadius: 4 }}>
                  <Icon size={16} style={{ color: S.blue }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-bold" style={{ color: S.text }}>{choice.label}</div>
                  <div className="text-[11px] mt-0.5" style={{ color: S.sub }}>{choice.sublabel}</div>
                  <ImpactChips impact={choice.impact} />
                </div>
                <ChevronRight size={15} className="mt-1 shrink-0" style={{ color: S.muted }} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Consequence View ─────────────────────────────────────────────────
function ConsequenceView({ choice, oldStats, newStats, onNext, isLastRound }) {
  const Icon = ICON_MAP[choice.icon] || CheckCircle;

  const deltas = [
    { label: "Budget",   delta: choice.impact.budget,   oldVal: budgetDisplay(oldStats.budget),  newVal: budgetDisplay(newStats.budget),  good: choice.impact.budget >= 0   },
    { label: "Timeline", delta: choice.impact.timeline,  oldVal: `${daysLeft(oldStats.timeline)}d`, newVal: `${daysLeft(newStats.timeline)}d`, good: choice.impact.timeline >= 0  },
    { label: "Risiko",   delta: choice.impact.stress,    oldVal: riskInfo(oldStats.stress).label,  newVal: riskInfo(newStats.stress).label,  good: choice.impact.stress <= 0   },
  ];

  return (
    <div className="space-y-3">
      {/* Decision confirmed */}
      <div className="flex items-center gap-3 p-3"
        style={{ backgroundColor: "#F5FAF6", border: `1px solid #B8D9C4`, borderRadius: 4 }}>
        <div className="w-8 h-8 flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#D6EED9", borderRadius: 4 }}>
          <Icon size={16} style={{ color: S.green }} />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: S.green }}>
            Entscheidung umgesetzt
          </div>
          <div className="text-[13px] font-bold" style={{ color: S.text }}>{choice.label}</div>
        </div>
      </div>

      {/* Activity log */}
      <div style={{ border: `1px solid ${S.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div className="px-4 py-2 flex items-center gap-1.5"
          style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${S.border}` }}>
          <Clock size={11} style={{ color: S.sub }} />
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: S.sub }}>
            Aktivitätsprotokoll
          </span>
        </div>
        {choice.activityLog.map((entry, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5"
            style={{ borderBottom: i < choice.activityLog.length - 1 ? `1px solid ${S.border}` : "none" }}>
            <div className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
              style={{
                backgroundColor: i === 0 ? S.blue
                  : i === choice.activityLog.length - 1 ? S.green
                  : S.border,
              }} />
            <span className="text-[12px] leading-snug" style={{ color: S.text }}>{entry}</span>
          </div>
        ))}
      </div>

      {/* Consequence text */}
      <div className="px-4 py-3"
        style={{ backgroundColor: "#FFFBEB", border: `1px solid #FDE68A`, borderRadius: 4 }}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <AlertTriangle size={11} className="text-amber-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Ergebnis</span>
        </div>
        <p className="text-[12px] leading-relaxed text-amber-900">{choice.consequence}</p>
      </div>

      {/* KPI impact */}
      <div style={{ border: `1px solid ${S.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div className="px-4 py-2" style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${S.border}` }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: S.sub }}>
            KPI-Auswirkung
          </span>
        </div>
        <div className="grid grid-cols-3 divide-x" style={{ borderColor: S.border }}>
          {deltas.map(({ label, delta, oldVal, newVal, good }) => {
            const color  = delta === 0 ? S.sub : good ? S.green : S.red;
            const sign   = delta > 0 ? "+" : "";
            const indicator = label === "Risiko"
              ? (delta > 0 ? "↑ Höher" : delta < 0 ? "↓ Niedriger" : "— Gleich")
              : `${sign}${delta}`;
            return (
              <div key={label} className="p-3 text-center">
                <div className="text-[10px] mb-1" style={{ color: S.muted }}>{label}</div>
                <div className="text-[13px] font-black" style={{ color }}>{indicator}</div>
                <div className="text-[10px] mt-0.5" style={{ color: S.muted }}>
                  {oldVal} → {newVal}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-3 font-bold text-[13px] text-white"
        style={{ backgroundColor: S.blue, borderRadius: 4, transition: "background-color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#005FCC"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = S.blue}
      >
        {isLastRound ? "Projektabschlussbericht öffnen" : "Nächste Situation"}
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

// ─── Intro Screen ──────────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  return (
    <div className="space-y-4 py-1">
      {/* Header */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: S.sub }}>
          Projektauftrag
        </div>
        <h1 className="text-[20px] font-black leading-tight mb-0.5" style={{ color: S.text }}>
          S/4HANA Migration
        </h1>
        <div className="text-[13px]" style={{ color: S.sub }}>SIEMENS AG Deutschland</div>
      </div>

      {/* Project brief */}
      <div style={{ border: `1px solid ${S.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div className="px-4 py-2.5 flex items-center justify-between"
          style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${S.border}` }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: S.sub }}>
            Projektdaten
          </span>
          <span className="text-[10px] font-bold px-2 py-0.5"
            style={{ backgroundColor: "#EBF5FE", color: S.blue, borderRadius: 2 }}>
            Vertraulich
          </span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            { label: "Ihre Rolle",   value: "Thomas Becker, Projektleiter" },
            { label: "Laufzeit",     value: "Jan 2025 – Jun 2025" },
            { label: "Gesamtbudget", value: "€3,0 Mio." },
            { label: "Projektteam",  value: "42 Mitarbeiter + Externe" },
            { label: "Scope",        value: "FI/CO, MM, SD, HCM, PI/PO" },
            { label: "Standorte",    value: "München, Berlin, Hamburg" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div className="text-[10px] mb-0.5" style={{ color: S.muted }}>{label}</div>
              <div className="text-[12px] font-semibold" style={{ color: S.text }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Starting KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Budget",     value: "€3,0M",    sub: "verfügbar",   color: S.green },
          { label: "Go-Live",    value: "90 Tage",  sub: "23.06.2025",  color: S.blue  },
          { label: "Risikolevel", value: "Niedrig", sub: "Ausgangslage", color: S.green },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="p-3 text-center"
            style={{
              backgroundColor: S.white,
              border: `1px solid ${S.border}`,
              borderTop: `3px solid ${color}`,
              borderRadius: 4,
            }}>
            <div className="text-[10px] mb-1" style={{ color: S.muted }}>{label}</div>
            <div className="text-[14px] font-black" style={{ color }}>{value}</div>
            <div className="text-[10px] mt-0.5" style={{ color: S.muted }}>{sub}</div>
          </div>
        ))}
      </div>

      {/* How it works — compact */}
      <div className="p-3.5"
        style={{ backgroundColor: "#EBF5FE", border: `1px solid #B8D9F8`, borderRadius: 4 }}>
        <div className="text-[11px] font-bold mb-2" style={{ color: S.blue }}>Spielmechanik</div>
        <div className="space-y-1.5">
          {[
            "8 reale SAP-Projektsituationen — Alerts, Eskalationen, Konflikte",
            "Jede Entscheidung beeinflusst Budget, Timeline und Teamrisiko",
            "Keine Punkte — nur echte Projektmanagement-Kennzahlen",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="font-bold mt-0.5 shrink-0" style={{ color: S.blue, fontSize: 13 }}>·</span>
              <span className="text-[11px]" style={{ color: "#1A4A8A" }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full py-3.5 font-bold text-[14px] text-white"
        style={{ backgroundColor: S.blue, borderRadius: 4, transition: "background-color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#005FCC"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = S.blue}
      >
        Projekt übernehmen →
      </button>
    </div>
  );
}

// ─── Project Report ───────────────────────────────────────────────────
function ProjectReport({ stats, history, onRestart }) {
  const endingKey = calcEnding(stats);
  const ending    = ENDINGS[endingKey];
  const days      = daysLeft(stats.timeline);
  const risk      = riskInfo(stats.stress);

  const gradeColor = { A: S.green, B: S.blue, C: S.orange, D: S.red, F: S.red }[ending.grade];

  return (
    <div className="space-y-3">
      {/* Report title */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-widest mb-0.5" style={{ color: S.sub }}>
          Projektabschlussbericht
        </div>
        <div className="text-[11px]" style={{ color: S.muted }}>
          S/4HANA Migration DE · SIEMENS AG
        </div>
      </div>

      {/* Grade card */}
      <div style={{
        border: `1px solid ${S.border}`,
        borderLeft: `4px solid ${gradeColor}`,
        borderRadius: 4,
        overflow: "hidden",
        backgroundColor: S.white,
      }}>
        <div className="p-4 flex items-center gap-4">
          <div className="w-14 h-14 flex items-center justify-center text-2xl font-black shrink-0"
            style={{
              color: gradeColor,
              border: `2px solid ${gradeColor}`,
              backgroundColor: `${gradeColor}12`,
              borderRadius: 4,
            }}>
            {ending.grade}
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: gradeColor }}>
              {ending.kpiStatus}
            </div>
            <div className="text-[15px] font-black leading-snug" style={{ color: S.text }}>
              {ending.title}
            </div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <p className="text-[12px] leading-relaxed" style={{ color: S.text }}>{ending.summary}</p>
        </div>
        <div className="px-4 py-3 flex items-start gap-2"
          style={{ backgroundColor: "#FFFBEB", borderTop: `1px solid #FDE68A` }}>
          <AlertTriangle size={12} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-relaxed">{ending.recommendation}</p>
        </div>
      </div>

      {/* Final KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Budget übrig",  value: budgetDisplay(stats.budget), color: stats.budget >= 50 ? S.green : S.red },
          { label: "Restlaufzeit",  value: `${days}d`,                  color: days >= 20 ? S.green : S.red },
          { label: "Risikolevel",   value: risk.label,                  color: risk.color },
        ].map(({ label, value, color }) => (
          <div key={label} className="p-3 text-center"
            style={{ backgroundColor: S.white, border: `1px solid ${S.border}`, borderRadius: 4 }}>
            <div className="text-[10px] mb-1" style={{ color: S.muted }}>{label}</div>
            <div className="text-[15px] font-black" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Decision log */}
      <div style={{ border: `1px solid ${S.border}`, borderRadius: 4, overflow: "hidden" }}>
        <div className="px-4 py-2.5"
          style={{ backgroundColor: "#F8FAFC", borderBottom: `1px solid ${S.border}` }}>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: S.sub }}>
            Entscheidungsprotokoll ({history.length})
          </span>
        </div>
        {history.map((item, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-2.5"
            style={{ borderBottom: i < history.length - 1 ? `1px solid ${S.border}` : "none" }}>
            <span className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: "#EBF5FE", color: S.blue }}>
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold leading-snug" style={{ color: S.text }}>{item.event}</div>
              <div className="text-[11px] mt-0.5" style={{ color: S.sub }}>→ {item.choice}</div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 py-3.5 font-bold text-[13px] text-white"
        style={{ backgroundColor: S.shell, borderRadius: 4, transition: "background-color 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = S.blue}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = S.shell}
      >
        <RotateCcw size={14} />
        Neues Projekt starten
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function SAPGame() {
  const [phase,   setPhase]   = useState(PHASES.INTRO);
  const [stats,   setStats]   = useState(INITIAL);
  const [round,   setRound]   = useState(0);
  const [queue,   setQueue]   = useState([]);
  const [taken,   setTaken]   = useState(null);
  const [history, setHistory] = useState([]);

  const currentEvent = queue[round] || null;
  const notifCount   = phase === PHASES.PLAYING ? 1 : 0;

  const startGame = useCallback(() => {
    setStats(INITIAL);
    setRound(0);
    setHistory([]);
    setTaken(null);
    setQueue(shuffle(EVENTS).slice(0, TOTAL_ROUNDS));
    setPhase(PHASES.PLAYING);
  }, []);

  const handleChoice = useCallback((choice) => {
    const newStats = {
      budget:   clamp(stats.budget   + choice.impact.budget),
      timeline: clamp(stats.timeline + choice.impact.timeline),
      stress:   clamp(stats.stress   + choice.impact.stress),
    };
    setTaken({ choice, oldStats: stats, newStats });
    setStats(newStats);
    setHistory(h => [...h, { event: currentEvent.title, choice: choice.label }]);
    setPhase(PHASES.CONSEQUENCE);
  }, [stats, currentEvent]);

  const handleNext = useCallback(() => {
    const next = round + 1;
    if (next >= TOTAL_ROUNDS) {
      setPhase(PHASES.GAME_OVER);
    } else {
      setRound(next);
      setTaken(null);
      setPhase(PHASES.PLAYING);
    }
  }, [round]);

  return (
    <div className="min-h-screen flex flex-col"
      style={{ backgroundColor: S.bg, fontFamily: "'72', '72full', Arial, Helvetica, sans-serif" }}>

      <ShellBar notifCount={notifCount} round={round + 1} phase={phase} />

      <div className="flex-1 flex justify-center px-4 pb-8 pt-4">
        <div className="w-full max-w-lg">

          {phase !== PHASES.INTRO && phase !== PHASES.GAME_OVER && (
            <KPIDashboard stats={stats} />
          )}

          <div style={{ backgroundColor: S.white, border: `1px solid ${S.border}`, borderRadius: 4, padding: 16 }}>
            {phase === PHASES.INTRO && <IntroScreen onStart={startGame} />}

            {phase === PHASES.PLAYING && currentEvent && (
              <>
                <IncidentCard event={currentEvent} />
                <ActionPanel choices={currentEvent.choices} onSelect={handleChoice} disabled={false} />
              </>
            )}

            {phase === PHASES.CONSEQUENCE && taken && (
              <ConsequenceView
                choice={taken.choice}
                oldStats={taken.oldStats}
                newStats={taken.newStats}
                onNext={handleNext}
                isLastRound={round + 1 >= TOTAL_ROUNDS}
              />
            )}

            {phase === PHASES.GAME_OVER && (
              <ProjectReport stats={stats} history={history} onRestart={startGame} />
            )}
          </div>

          <p className="text-center text-[10px] mt-3" style={{ color: S.muted }}>
            SAP Training Simulation · Alle Szenarien sind fiktiv
          </p>
        </div>
      </div>
    </div>
  );
}
