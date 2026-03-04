import { useState, useCallback, useMemo } from "react";
import {
  Bell, User, ChevronRight, RotateCcw, AlertTriangle,
  CheckCircle, Clock, TrendingDown, DollarSign, Calendar,
  Shield, FileText, Users, Phone, Monitor, Scale, FileSignature,
  CalendarCheck, GraduationCap, Award, Zap, Factory, FileWarning,
  ShieldCheck, Lock, FileX, Wrench, Headphones, Cpu, BookOpen,
  AlertCircle, FlaskConical, GitBranch, CheckSquare, CalendarRange,
  PauseCircle, UserPlus, BookMarked, UserCheck, Search, Briefcase,
  Activity, BarChart3, CalendarOff, Building2,
} from "lucide-react";
import {
  EVENTS, ENDINGS,
  budgetDisplay, daysLeft, goLiveDate, riskInfo, moraleInfo,
} from "./gameData";

// ─── Constants ───────────────────────────────────────────────────────
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
  if (score >= 90) return "good";
  if (score >= 50) return "average";
  if (score >= 10) return "poor";
  return "failure";
}

// ─── Priority badge ───────────────────────────────────────────────────
function PriorityBadge({ priority }) {
  const map = {
    P1: { bg: "#FFEAEA", color: "#BB0000", border: "#FFCCCC" },
    P2: { bg: "#FFF4E5", color: "#E9730C", border: "#FFD9AA" },
    P3: { bg: "#EBF5FE", color: "#0070F2", border: "#B8D9F8" },
  };
  const s = map[priority] || map.P3;
  return (
    <span style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
      className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded border">
      {priority === "P1" && <span className="w-1.5 h-1.5 rounded-full bg-current inline-block" />}
      {priority}
    </span>
  );
}

// ─── KPI Tile ─────────────────────────────────────────────────────────
function KPITile({ icon: Icon, label, value, subvalue, statusColor, statusLabel, fillPct, children }) {
  return (
    <div className="bg-white rounded-xl p-3.5 border border-gray-200 flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Icon size={13} style={{ color: statusColor || "#6B7280" }} />
          <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        </div>
        {statusLabel && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
            style={{ color: statusColor, backgroundColor: statusColor + "18" }}>
            {statusLabel}
          </span>
        )}
      </div>
      <div className="text-xl font-black text-gray-900 leading-none">{value}</div>
      {subvalue && <div className="text-[11px] text-gray-400">{subvalue}</div>}
      {fillPct !== undefined && (
        <div className="h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${fillPct}%`, backgroundColor: statusColor || "#0070F2" }} />
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Shell Bar ────────────────────────────────────────────────────────
function ShellBar({ notifCount, round, phase }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 text-white"
      style={{ backgroundColor: "#1D2D3E" }}>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: "#0070F2" }}>
          <Building2 size={16} className="text-white" />
        </div>
        <div>
          <div className="text-[13px] font-bold leading-none">S/4HANA Migration DE</div>
          <div className="text-[10px] mt-0.5" style={{ color: "#8BA3BB" }}>
            SIEMENS AG · Thomas Becker, PM
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {phase !== PHASES.INTRO && phase !== PHASES.GAME_OVER && (
          <div className="text-[10px] px-2 py-1 rounded" style={{ backgroundColor: "#0070F220", color: "#7EC8F8" }}>
            Ereignis {round}/{TOTAL_ROUNDS}
          </div>
        )}
        <div className="relative">
          <Bell size={18} style={{ color: "#8BA3BB" }} />
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center"
              style={{ backgroundColor: "#BB0000", color: "#fff" }}>
              {notifCount}
            </span>
          )}
        </div>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
          style={{ backgroundColor: "#0070F2" }}>
          TB
        </div>
      </div>
    </div>
  );
}

// ─── KPI Dashboard Strip ──────────────────────────────────────────────
function KPIDashboard({ stats }) {
  const risk = riskInfo(stats.stress);
  const morale = moraleInfo(stats.stress);
  const budgetPct = Math.round(stats.budget);
  const days = daysLeft(stats.timeline);
  const glDate = goLiveDate(stats.timeline);
  const openIssues = Math.max(0, Math.round((100 - stats.budget) / 10) + Math.round(stats.stress / 20));

  return (
    <div className="grid grid-cols-2 gap-2.5 mb-3">
      <KPITile
        icon={DollarSign}
        label="Projektbudget"
        value={budgetDisplay(stats.budget)}
        subvalue={`von €3.0M verbraucht`}
        statusColor={budgetPct >= 60 ? "#107E3E" : budgetPct >= 35 ? "#E9730C" : "#BB0000"}
        statusLabel={`${budgetPct}%`}
        fillPct={budgetPct}
      />
      <KPITile
        icon={Calendar}
        label="Go-Live"
        value={`${days}d`}
        subvalue={glDate}
        statusColor={days >= 40 ? "#107E3E" : days >= 20 ? "#E9730C" : "#BB0000"}
        statusLabel={days >= 40 ? "On Track" : days >= 20 ? "Gefährdet" : "Kritisch"}
        fillPct={Math.round((days / 90) * 100)}
      />
      <KPITile
        icon={Shield}
        label="Risikolevel"
        value={risk.label}
        subvalue="Projektrisiko"
        statusColor={risk.color}
        statusLabel={risk.level}
      />
      <KPITile
        icon={Activity}
        label="Team"
        value={`${morale.icon} ${morale.label}`}
        subvalue={`${openIssues} offene Punkte`}
        statusColor={morale.color}
      />
    </div>
  );
}

// ─── Incident Card ────────────────────────────────────────────────────
function IncidentCard({ event }) {
  return (
    <div className="rounded-xl border overflow-hidden mb-3" style={{ borderColor: "#E5E7EB" }}>
      {/* Incident header */}
      <div className="px-4 py-3 flex items-start justify-between gap-3"
        style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E5E7EB" }}>
        <div className="flex items-start gap-2.5 min-w-0">
          <PriorityBadge priority={event.priority} />
          <div className="min-w-0">
            <div className="text-[11px] font-semibold" style={{ color: "#0070F2" }}>{event.system}</div>
            <div className="text-[11px] text-gray-400">{event.category}</div>
          </div>
        </div>
        <div className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">{event.timestamp}</div>
      </div>

      {/* Title */}
      <div className="px-4 pt-3 pb-1">
        <h2 className="text-[15px] font-bold text-gray-900 leading-snug">{event.title}</h2>
      </div>

      {/* Description */}
      <div className="px-4 pb-3">
        <p className="text-[13px] text-gray-700 leading-relaxed">{event.description}</p>
      </div>

      {/* Reporter */}
      <div className="px-4 py-2.5 flex items-center gap-2.5 border-t" style={{ borderColor: "#F0F0F0", backgroundColor: "#FAFAFA" }}>
        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0"
          style={{ backgroundColor: "#0070F2" }}>
          {event.reportedBy.initials}
        </div>
        <div>
          <div className="text-[11px] font-semibold text-gray-800">{event.reportedBy.name}</div>
          <div className="text-[10px] text-gray-400">{event.reportedBy.role}</div>
        </div>
        <div className="ml-auto flex items-center gap-1 text-[10px]" style={{ color: "#BB0000" }}>
          <AlertTriangle size={11} />
          Entscheidung erforderlich
        </div>
      </div>
    </div>
  );
}

// ─── Action Panel ──────────────────────────────────────────────────────
function ActionPanel({ choices, onSelect, disabled }) {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500 uppercase tracking-wide px-0.5">
        <ChevronRight size={13} style={{ color: "#0070F2" }} />
        Ihre Handlungsoptionen
      </div>
      {choices.map((choice) => {
        const Icon = ICON_MAP[choice.icon] || CheckCircle;
        return (
          <button
            key={choice.id}
            onClick={() => onSelect(choice)}
            disabled={disabled}
            className={`w-full text-left rounded-xl border-2 transition-all duration-150 overflow-hidden
              ${disabled
                ? "opacity-40 cursor-not-allowed border-gray-200 bg-gray-50"
                : "border-gray-200 bg-white hover:shadow-md cursor-pointer active:scale-[0.985]"
              }`}
            style={!disabled ? { "--hover-border": "#0070F2" } : {}}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.borderColor = "#0070F2"; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.borderColor = "#E5E7EB"; }}
          >
            <div className="flex items-start gap-3 p-3.5">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#EBF5FE" }}>
                <Icon size={17} style={{ color: "#0070F2" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold text-gray-900">{choice.label}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">{choice.sublabel}</div>
              </div>
              <ChevronRight size={16} className="text-gray-300 mt-1 shrink-0" />
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ─── Consequence View ─────────────────────────────────────────────────
function ConsequenceView({ event, choice, oldStats, newStats, onNext, isLastRound }) {
  const Icon = ICON_MAP[choice.icon] || CheckCircle;

  const deltas = [
    {
      label: "Budget",
      delta: choice.impact.budget,
      oldVal: budgetDisplay(oldStats.budget),
      newVal: budgetDisplay(newStats.budget),
      good: choice.impact.budget >= 0,
    },
    {
      label: "Timeline",
      delta: choice.impact.timeline,
      oldVal: `${daysLeft(oldStats.timeline)}d`,
      newVal: `${daysLeft(newStats.timeline)}d`,
      good: choice.impact.timeline >= 0,
    },
    {
      label: "Risiko",
      delta: choice.impact.stress,
      oldVal: riskInfo(oldStats.stress).label,
      newVal: riskInfo(newStats.stress).label,
      good: choice.impact.stress <= 0,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Decision taken */}
      <div className="flex items-center gap-3 p-3 rounded-xl border"
        style={{ backgroundColor: "#F5FAF6", borderColor: "#C5E0CC" }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: "#D6EED9" }}>
          <Icon size={17} style={{ color: "#107E3E" }} />
        </div>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#107E3E" }}>
            Entscheidung umgesetzt
          </div>
          <div className="text-[13px] font-bold text-gray-900">{choice.label}</div>
        </div>
      </div>

      {/* Activity log */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100" style={{ backgroundColor: "#F8FAFC" }}>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-600 uppercase tracking-wide">
            <Clock size={11} />
            Aktivitätsprotokoll
          </div>
        </div>
        <div className="divide-y divide-gray-50">
          {choice.activityLog.map((entry, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                style={{ backgroundColor: i === 0 ? "#0070F2" : i === choice.activityLog.length - 1 ? "#107E3E" : "#D1D5DB" }} />
              <span className="text-[12px] text-gray-700 leading-snug">{entry}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Consequence text */}
      <div className="px-4 py-3 rounded-xl border text-[13px] text-gray-800 leading-relaxed"
        style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber-700 mb-1.5">
          <AlertTriangle size={10} /> Ergebnis
        </div>
        {choice.consequence}
      </div>

      {/* KPI impact */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100" style={{ backgroundColor: "#F8FAFC" }}>
          <div className="text-[11px] font-semibold text-gray-600 uppercase tracking-wide">KPI-Auswirkung</div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-gray-100">
          {deltas.map(({ label, delta, oldVal, newVal, good }) => {
            const color = delta === 0 ? "#6B7280" : good ? "#107E3E" : "#BB0000";
            return (
              <div key={label} className="p-3 text-center">
                <div className="text-[10px] text-gray-400 mb-1">{label}</div>
                <div className="text-[13px] font-black" style={{ color }}>
                  {delta > 0 ? "+" : ""}{label === "Risiko" ? (delta > 0 ? "↑" : delta < 0 ? "↓" : "–") : delta}
                </div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {oldVal} → {newVal}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <button
        onClick={onNext}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] text-white transition-all duration-150 active:scale-[0.98]"
        style={{ backgroundColor: "#0070F2" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#005FCC"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0070F2"}
      >
        {isLastRound ? "Projektabschlussbericht öffnen" : "Nächste Situation →"}
      </button>
    </div>
  );
}

// ─── Intro Screen ──────────────────────────────────────────────────────
function IntroScreen({ onStart }) {
  return (
    <div className="space-y-5 py-2">
      {/* Project brief */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100" style={{ backgroundColor: "#F8FAFC" }}>
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Projektauftrag</div>
            <div className="text-[10px] px-2 py-0.5 rounded font-semibold"
              style={{ backgroundColor: "#EBF5FE", color: "#0070F2" }}>Vertraulich</div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide">Projekt</div>
            <div className="text-[14px] font-black text-gray-900">S/4HANA Migration · SIEMENS AG Deutschland</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Ihre Rolle", value: "Thomas Becker, Projektleiter" },
              { label: "Projektlaufzeit", value: "Jan 2025 – Jun 2025" },
              { label: "Gesamtbudget", value: "€3,0 Mio." },
              { label: "Projektteam", value: "42 Mitarbeiter + externe" },
              { label: "Scope", value: "FI/CO, MM, SD, HCM, PI/PO" },
              { label: "Standorte", value: "München, Berlin, Hamburg" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div className="text-[10px] text-gray-400 mb-0.5">{label}</div>
                <div className="text-[12px] font-semibold text-gray-800">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">So funktioniert die Simulation</div>
        {[
          { icon: AlertTriangle, text: "Sie erhalten reale SAP-Projektsituationen als System-Alerts, Meldungen und Eskalationen." },
          { icon: Users, text: "Jede Entscheidung hat Konsequenzen für Budget, Timeline und Ihr Team — wie im echten Projekt." },
          { icon: BarChart3, text: "KPIs zeigen den Projektstatus in Echtzeit. Keine Punkte — nur Projektmanagement." },
          { icon: TrendingDown, text: "Es gibt keine perfekte Entscheidung. Nur Trade-offs — wie im echten SAP-Projekt." },
        ].map(({ icon: Icon, text }, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: "#EBF5FE" }}>
              <Icon size={14} style={{ color: "#0070F2" }} />
            </div>
            <p className="text-[12px] text-gray-700 leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      {/* Starting KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Budget", value: "€3,0M", sub: "Vollständig verfügbar", color: "#107E3E" },
          { label: "Go-Live", value: "90 Tage", sub: "23.06.2025", color: "#0070F2" },
          { label: "Risiko", value: "Niedrig", sub: "Ausgangslage", color: "#107E3E" },
        ].map(({ label, value, sub, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 p-3 text-center bg-white">
            <div className="text-[10px] text-gray-400 mb-1">{label}</div>
            <div className="text-[14px] font-black" style={{ color }}>{value}</div>
            <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full py-4 rounded-xl font-bold text-[14px] text-white transition-all duration-150 active:scale-[0.98]"
        style={{ backgroundColor: "#0070F2" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#005FCC"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#0070F2"}
      >
        Projekt übernehmen →
      </button>
    </div>
  );
}

// ─── Project Report (End Screen) ───────────────────────────────────────
function ProjectReport({ stats, history, onRestart }) {
  const endingKey = calcEnding(stats);
  const ending = ENDINGS[endingKey];
  const days = daysLeft(stats.timeline);
  const risk = riskInfo(stats.stress);

  const gradeConfig = {
    A: { color: "#107E3E", bg: "#F5FAF6", border: "#C5E0CC" },
    B: { color: "#0070F2", bg: "#EBF5FE", border: "#B8D9F8" },
    C: { color: "#E9730C", bg: "#FEF7F1", border: "#FFDDB8" },
    D: { color: "#BB0000", bg: "#FFF0F0", border: "#FFCCCC" },
    F: { color: "#BB0000", bg: "#FFF0F0", border: "#FFCCCC" },
  };
  const gc = gradeConfig[ending.grade];

  return (
    <div className="space-y-3">
      {/* Report header */}
      <div className="rounded-xl border overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between"
          style={{ backgroundColor: "#F8FAFC" }}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Projektabschlussbericht</div>
          <div className="text-[10px] text-gray-400">S/4HANA Migration DE · SIEMENS AG</div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl font-black shrink-0 border-2"
            style={{ color: gc.color, backgroundColor: gc.bg, borderColor: gc.border }}>
            {ending.grade}
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{ color: gc.color }}>
              {ending.kpiStatus}
            </div>
            <div className="text-[14px] font-black text-gray-900 leading-snug">{ending.title}</div>
          </div>
        </div>
        <div className="px-4 pb-4">
          <p className="text-[12px] text-gray-700 leading-relaxed">{ending.summary}</p>
        </div>
        <div className="px-4 py-3 border-t flex items-start gap-2"
          style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}>
          <AlertTriangle size={13} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[11px] text-amber-800 leading-relaxed">{ending.recommendation}</p>
        </div>
      </div>

      {/* Final KPIs */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Budget übrig", value: budgetDisplay(stats.budget), color: stats.budget >= 50 ? "#107E3E" : "#BB0000" },
          { label: "Restlaufzeit", value: `${days}d`, color: days >= 20 ? "#107E3E" : "#BB0000" },
          { label: "Risikolevel", value: risk.label, color: risk.color },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-3 text-center">
            <div className="text-[10px] text-gray-400 mb-1">{label}</div>
            <div className="text-[16px] font-black" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Decision log */}
      <div className="rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-gray-100" style={{ backgroundColor: "#F8FAFC" }}>
          <div className="text-[11px] font-bold uppercase tracking-wide text-gray-500">Entscheidungsprotokoll</div>
        </div>
        <div className="divide-y divide-gray-50">
          {history.map((item, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-2.5">
              <div className="w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: "#EBF5FE", color: "#0070F2" }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-semibold text-gray-700 leading-snug">{item.event}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">→ {item.choice}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[13px] text-white transition-all duration-150 active:scale-[0.98]"
        style={{ backgroundColor: "#1D2D3E" }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = "#0070F2"}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = "#1D2D3E"}
      >
        <RotateCcw size={15} />
        Neues Projekt starten
      </button>
    </div>
  );
}

// ─── Round Progress Bar ───────────────────────────────────────────────
function RoundProgress({ round, total, phase }) {
  if (phase === PHASES.INTRO || phase === PHASES.GAME_OVER) return null;
  return (
    <div className="flex gap-1 px-4 pb-3">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="flex-1 h-1 rounded-full transition-all duration-500"
          style={{
            backgroundColor: i < round
              ? "#0070F2"
              : i === round
              ? "#7EC8F8"
              : "#E5E7EB"
          }} />
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────
export default function SAPGame() {
  const [phase, setPhase] = useState(PHASES.INTRO);
  const [stats, setStats] = useState(INITIAL);
  const [round, setRound] = useState(0);
  const [queue, setQueue] = useState([]);
  const [taken, setTaken] = useState(null); // { choice, oldStats, newStats }
  const [history, setHistory] = useState([]);

  const currentEvent = queue[round] || null;
  const notifCount = phase === PHASES.PLAYING ? 1 : 0;

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
      budget: clamp(stats.budget + choice.impact.budget),
      timeline: clamp(stats.timeline + choice.impact.timeline),
      stress: clamp(stats.stress + choice.impact.stress),
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
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F7F7F7", fontFamily: "system-ui, Arial, sans-serif" }}>
      {/* Shell bar */}
      <ShellBar notifCount={notifCount} round={round + 1} phase={phase} />

      {/* Progress bar */}
      <div style={{ backgroundColor: "#F7F7F7" }}>
        <RoundProgress round={round} total={TOTAL_ROUNDS} phase={phase} />
      </div>

      {/* Main content */}
      <div className="flex-1 flex justify-center px-4 pb-8 pt-4">
        <div className="w-full max-w-lg space-y-0">

          {/* KPI dashboard (all phases except intro) */}
          {phase !== PHASES.INTRO && (
            <KPIDashboard stats={stats} />
          )}

          {/* Content card */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            {phase === PHASES.INTRO && <IntroScreen onStart={startGame} />}

            {phase === PHASES.PLAYING && currentEvent && (
              <>
                <IncidentCard event={currentEvent} />
                <ActionPanel choices={currentEvent.choices} onSelect={handleChoice} disabled={false} />
              </>
            )}

            {phase === PHASES.CONSEQUENCE && taken && currentEvent && (
              <ConsequenceView
                event={currentEvent}
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

          {/* Footer */}
          <p className="text-center text-[10px] mt-3" style={{ color: "#A0A0A0" }}>
            SAP Training Simulation · Alle Szenarien sind fiktiv
          </p>
        </div>
      </div>
    </div>
  );
}
