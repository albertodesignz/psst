import { useState } from "react";
import {
  Archive,
  ArrowUpRight,
  Bell,
  BookOpen,
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  Command,
  FileText,
  Focus,
  Hash,
  Inbox,
  LayoutGrid,
  Leaf,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Sun,
  Timer,
  X,
} from "lucide-react";

type Task = { title: string; meta: string; done?: boolean; tone: "lime" | "coral" | "violet" };

const initialTasks: Task[] = [
  { title: "Shape the opening for Field Notes", meta: "Writing · 45 min", tone: "lime" },
  { title: "Reply to Mara about the workshop", meta: "Correspondence · 15 min", tone: "coral" },
  { title: "Review the spring reading list", meta: "Research · 30 min", tone: "violet", done: true },
];

const navItems = [
  { label: "Today", icon: Sun, count: "4" },
  { label: "Inbox", icon: Inbox, count: "7" },
  { label: "Calendar", icon: CalendarDays },
];

function TaskRow({ task, onToggle }: { task: Task; onToggle: () => void }) {
  const tone = {
    lime: "bg-[#d5df74]",
    coral: "bg-[#ec9074]",
    violet: "bg-[#b7a8d8]",
  }[task.tone];
  return (
    <div className={`group flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-200 hover:bg-[#f7f0e4] ${task.done ? "opacity-55" : ""}`}>
      <button onClick={onToggle} aria-label={task.done ? "Mark task incomplete" : "Mark task complete"} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all ${task.done ? "border-[#40514a] bg-[#40514a] text-[#f8f4eb]" : "border-[#a59d8c] hover:border-[#40514a]"}`}>
        {task.done && <Check size={12} strokeWidth={3} />}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-[14px] font-medium tracking-[-0.01em] text-[#283832] ${task.done ? "line-through" : ""}`}>{task.title}</p>
        <p className="mt-1 flex items-center gap-2 text-[11px] text-[#8a897c]">
          <span className={`h-1.5 w-1.5 rounded-full ${tone}`} /> {task.meta}
        </p>
      </div>
      <button aria-label="More task options" className="mt-0.5 rounded-md p-1 text-[#aaa493] opacity-0 transition-opacity hover:bg-[#ebe3d4] group-hover:opacity-100"><MoreHorizontal size={16} /></button>
    </div>
  );
}

export function DirectionOne() {
  const [tasks, setTasks] = useState(initialTasks);
  const [focusMode, setFocusMode] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [activeNav, setActiveNav] = useState("Today");

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((current) => [...current, { title: newTask.trim(), meta: "Personal · just now", tone: "lime" }]);
    setNewTask("");
    setShowAdd(false);
  };

  return (
    <div className="morrow-shell min-h-[100dvh] bg-[#f4eee3] text-[#283832] selection:bg-[#d5df74]">
      <style>{`
        .morrow-shell { font-family: "DM Sans", ui-sans-serif, sans-serif; }
        .morrow-display { font-family: "Fraunces", Georgia, serif; }
        .morrow-mono { font-family: "Space Mono", monospace; }
        .morrow-shell button { cursor: pointer; }
        .morrow-shell::before { content:""; pointer-events:none; position:fixed; inset:0; opacity:.19; z-index:20; background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.12'/%3E%3C/svg%3E"); mix-blend-mode:multiply; }
        @keyframes morrow-rise { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        .morrow-rise { animation:morrow-rise .55s ease-out both; }
        .morrow-delay-1 { animation-delay:.08s } .morrow-delay-2 { animation-delay:.16s } .morrow-delay-3 { animation-delay:.24s }
      `}</style>
      <div className="relative z-10 flex min-h-[100dvh]">
        <aside className="hidden w-[238px] shrink-0 flex-col border-r border-[#ddd4c4] bg-[#eee6d8] px-5 py-6 md:flex">
          <div className="flex items-center gap-2 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#40514a] text-[#d5df74]"><Leaf size={17} strokeWidth={2.2} /></div>
            <span className="morrow-display text-[25px] tracking-[-0.04em] text-[#31433c]">morrow</span>
          </div>
          <div className="mt-10 space-y-1">
            <p className="morrow-mono mb-3 px-3 text-[9px] uppercase tracking-[0.18em] text-[#aaa08f]">Your space</p>
            {navItems.map(({ label, icon: Icon, count }) => (
              <button key={label} onClick={() => setActiveNav(label)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-[13px] transition-colors ${activeNav === label ? "bg-[#e2dacb] font-semibold text-[#31433c]" : "text-[#77776d] hover:bg-[#e7ded0]"}`}>
                <span className="flex items-center gap-3"><Icon size={16} strokeWidth={1.8} />{label}</span>
                {count && <span className="morrow-mono text-[10px] text-[#aaa08f]">{count}</span>}
              </button>
            ))}
          </div>
          <div className="mt-9 space-y-1">
            <p className="morrow-mono mb-3 px-3 text-[9px] uppercase tracking-[0.18em] text-[#aaa08f]">Collections</p>
            {[
              ["Ideas", "#d5df74", Sparkles],
              ["Reading list", "#b7a8d8", BookOpen],
              ["In the works", "#ec9074", LayoutGrid],
            ].map(([label, color, Icon]) => (
              <button key={label as string} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13px] text-[#77776d] transition-colors hover:bg-[#e7ded0]">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color as string }} /><span>{label as string}</span><Icon size={13} className="ml-auto opacity-50" />
              </button>
            ))}
          </div>
          <div className="mt-auto rounded-2xl bg-[#40514a] p-4 text-[#f4eee3]">
            <p className="morrow-mono text-[9px] uppercase tracking-[0.18em] text-[#bfc9a1]">A gentle nudge</p>
            <p className="morrow-display mt-3 text-[19px] leading-[1.15]">Make room for the work that makes room for you.</p>
            <div className="mt-4 h-px bg-[#647269]" />
            <p className="mt-3 text-[10px] text-[#b9c1b5]">Your weekly review is tomorrow</p>
          </div>
          <div className="mt-5 flex items-center gap-3 px-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#d4a98e] text-[10px] font-bold text-[#513d36]">AL</div>
            <div><p className="text-[12px] font-semibold">Alex Liu</p><p className="text-[10px] text-[#979385]">Personal workspace</p></div>
            <ChevronDown size={14} className="ml-auto text-[#979385]" />
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-5 sm:px-8 lg:px-12 lg:py-8">
          <header className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden"><div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#40514a] text-[#d5df74]"><Leaf size={17} /></div><span className="morrow-display text-[24px]">morrow</span></div>
            <div className="hidden items-center gap-2 text-[11px] text-[#999487] md:flex"><span className="h-1.5 w-1.5 rounded-full bg-[#9eae62]" /> Sunday, April 21, 2024 <span className="mx-2 text-[#d2c8b8]">/</span> Week 16</div>
            <div className="ml-auto flex items-center gap-2">
              <button aria-label="Search" className="rounded-lg p-2 text-[#8f8e80] transition-colors hover:bg-[#e9e1d4]"><Search size={17} /></button>
              <button aria-label="Notifications" className="relative rounded-lg p-2 text-[#8f8e80] transition-colors hover:bg-[#e9e1d4]"><Bell size={17} /><span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#ec9074]" /></button>
              <button onClick={() => setFocusMode(!focusMode)} className={`ml-2 flex items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition-colors ${focusMode ? "bg-[#d5df74] text-[#31433c]" : "bg-[#40514a] text-[#f4eee3] hover:bg-[#506159]"}`}><Focus size={14} /> {focusMode ? "Focus on" : "Focus mode"}</button>
            </div>
          </header>

          <section className="morrow-rise mt-12 max-w-[890px] lg:mt-16">
            <p className="morrow-mono text-[10px] uppercase tracking-[0.2em] text-[#989487]">Sunday, April 21</p>
            <h1 className="morrow-display mt-3 text-[clamp(2.8rem,5vw,4.7rem)] leading-[.97] tracking-[-0.055em] text-[#31433c]">Good morning, Alex<span className="text-[#c5ce71]">.</span></h1>
            <p className="mt-5 max-w-[500px] text-[15px] leading-7 text-[#77776d]">A clear place to start. You have <span className="font-semibold text-[#4e5e54]">{tasks.filter((task) => !task.done).length} things</span> waiting, and a little room to think.</p>
          </section>

          <div className="mt-10 grid max-w-[1050px] gap-5 xl:grid-cols-[1.12fr_.88fr]">
            <section className="morrow-rise morrow-delay-1 rounded-2xl border border-[#e0d7c8] bg-[#f8f4eb] p-5 shadow-[0_12px_35px_rgba(74,67,51,.045)] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#e7dfd1] pb-5">
                <div><div className="flex items-center gap-2"><h2 className="morrow-display text-[25px] tracking-[-0.03em] text-[#31433c]">The day ahead</h2><span className="rounded-full bg-[#e4e7bd] px-2 py-0.5 text-[10px] font-semibold text-[#667044]">2 open</span></div><p className="mt-1.5 text-[12px] text-[#a09b8c]">Small steps, considered well.</p></div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-1.5 rounded-lg bg-[#e6ecd0] px-3 py-2 text-[11px] font-semibold text-[#526044] transition-colors hover:bg-[#d5df74]"><Plus size={14} /> Add task</button>
              </div>
              {showAdd && <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#d5dfc0] bg-[#f0f3dc] p-2"><input autoFocus value={newTask} onChange={(event) => setNewTask(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addTask()} placeholder="What deserves your attention?" className="min-w-0 flex-1 bg-transparent px-2 text-[13px] text-[#31433c] outline-none placeholder:text-[#9da28d]" /><button onClick={addTask} className="rounded-md bg-[#40514a] px-3 py-1.5 text-[11px] font-semibold text-[#f4eee3]">Save</button><button onClick={() => setShowAdd(false)} aria-label="Cancel adding task" className="p-1 text-[#818975]"><X size={15} /></button></div>}
              <div className="mt-4 space-y-1">{tasks.map((task, index) => <TaskRow key={`${task.title}-${index}`} task={task} onToggle={() => setTasks((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, done: !item.done } : item))} />)}</div>
              <div className="mt-5 flex items-center gap-2 border-t border-[#e7dfd1] pt-4 text-[11px] text-[#9e998d]"><Timer size={14} className="text-[#c2b8a3]" /> 1h 30m of considered work <span className="ml-auto morrow-mono text-[10px]">03 / 05</span></div>
            </section>

            <div className="space-y-5">
              <section className="morrow-rise morrow-delay-2 overflow-hidden rounded-2xl bg-[#d5df74] p-6 text-[#31433c]">
                <div className="flex items-start justify-between"><div><p className="morrow-mono text-[9px] uppercase tracking-[0.18em] text-[#687344]">The thought garden</p><p className="morrow-display mt-5 max-w-[280px] text-[26px] leading-[1.08] tracking-[-0.035em]">“Attention is the rarest and purest form of generosity.”</p></div><Sparkles size={20} className="text-[#79864b]" /></div>
                <div className="mt-7 flex items-end justify-between"><p className="text-[11px] text-[#687344]">— Simone Weil</p><button className="flex items-center gap-1 text-[11px] font-semibold text-[#53603b] transition-transform hover:translate-x-1">Open ideas <ArrowUpRight size={14} /></button></div>
              </section>
              <section className="morrow-rise morrow-delay-3 rounded-2xl border border-[#e0d7c8] bg-[#eee6d8] p-6">
                <div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#e3d9ef] text-[#72638d]"><FileText size={14} /></div><h3 className="text-[13px] font-semibold text-[#4b554d]">Continue where you left off</h3></div><button aria-label="More options" className="text-[#999487]"><MoreHorizontal size={16} /></button></div>
                <p className="morrow-display mt-6 text-[23px] leading-tight tracking-[-0.025em] text-[#31433c]">Field Notes: the useful edge of uncertainty</p>
                <div className="mt-5 flex items-center justify-between text-[11px] text-[#9b9586]"><span>Edited yesterday · 8 min read</span><button className="flex items-center gap-1 font-semibold text-[#596a5e] hover:text-[#31433c]">Resume <ArrowUpRight size={13} /></button></div>
              </section>
            </div>
          </div>

          <footer className="mt-10 flex max-w-[1050px] items-center justify-between border-t border-[#dfd5c5] pt-4 text-[10px] text-[#a19b8d]">
            <span className="flex items-center gap-2"><Command size={12} /> <span className="morrow-mono">K</span> to search anything</span>
            <span className="hidden items-center gap-4 sm:flex"><span className="flex items-center gap-1.5"><Hash size={12} /> 12 notes this week</span><span className="flex items-center gap-1.5"><Circle size={7} fill="currentColor" /> Synced just now</span></span>
          </footer>
        </main>
      </div>
    </div>
  );
}