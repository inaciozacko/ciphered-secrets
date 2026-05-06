import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { CHALLENGES, isCorrect, pickRandom, type Variant } from "@/lib/challenges";
import { TypeText } from "@/components/TypeText";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/missao")({
  head: () => ({
    meta: [
      { title: "Missão // PROTOCOLO_NOX" },
      { name: "description", content: "Três fragmentos. Dez minutos cada. Decifre." },
      { property: "og:title", content: "Missão — PROTOCOLO_NOX" },
      { property: "og:description", content: "Decifre os três fragmentos antes do tempo expirar." },
    ],
  }),
  component: Mission,
});

const TIME_LIMIT = 10 * 60; // seconds
const MAX_HINTS_VISIBLE = 3;

type Status = "playing" | "solved" | "failed" | "revealed" | "expired";

function Mission() {
  const [stage, setStage] = useState(0); // 0..2
  const [seed, setSeed] = useState(0); // forces variant re-pick on restart
  const [completed, setCompleted] = useState<boolean[]>([false, false, false]);

  const challenge = CHALLENGES[stage];
  const variant: Variant = useMemo(
    () => pickRandom(challenge.variants),
    [challenge, seed, stage],
  );

  const allDone = completed.every(Boolean);

  if (allDone) return <Finale onRestart={() => { setStage(0); setSeed((s) => s + 1); setCompleted([false, false, false]); }} />;

  return (
    <ChallengeView
      key={`${stage}-${seed}`}
      stageIndex={stage}
      total={CHALLENGES.length}
      challenge={challenge}
      variant={variant}
      onSolved={() => {
        setCompleted((c) => { const n = [...c]; n[stage] = true; return n; });
      }}
      onNext={() => setStage((s) => Math.min(s + 1, CHALLENGES.length - 1))}
      onRestart={() => setSeed((s) => s + 1)}
      isLast={stage === CHALLENGES.length - 1}
    />
  );
}

function Finale({ onRestart }: { onRestart: () => void }) {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <p className="text-xs tracking-[0.4em] text-muted-foreground mb-6">// PROTOCOLO COMPLETO</p>
        <h1 className="text-4xl md:text-5xl text-primary text-glow tracking-widest mb-6">VOCÊ OUVIU O SINAL.</h1>
        <p className="text-foreground/80 leading-relaxed mb-8">
          <TypeText text="Os três fragmentos foram decifrados. Algo se moveu na escuridão. Aguarde. Novas transmissões em breve." />
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => { sfx.click(); onRestart(); }}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold tracking-widest text-sm border-glow"
          >
            &gt; REINICIAR
          </button>
          <Link to="/" onClick={() => sfx.click()} className="px-6 py-3 border border-primary/60 text-primary tracking-widest text-sm hover:bg-primary/10">
            &gt; SAIR
          </Link>
        </div>
      </div>
    </main>
  );
}

function ChallengeView({
  stageIndex, total, challenge, variant, onSolved, onNext, onRestart, isLast,
}: {
  stageIndex: number;
  total: number;
  challenge: (typeof CHALLENGES)[number];
  variant: Variant;
  onSolved: () => void;
  onNext: () => void;
  onRestart: () => void;
  isLast: boolean;
}) {
  const [answer, setAnswer] = useState("");
  const [status, setStatus] = useState<Status>("playing");
  const [hintsUsed, setHintsUsed] = useState(0);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "err" | "info"; text: string } | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(TIME_LIMIT);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(intervalRef.current!);
          setStatus("expired");
          sfx.error();
          return 0;
        }
        if (s <= 10) sfx.tick();
        return s - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [variant.id]);

  useEffect(() => {
    if (status !== "playing" && intervalRef.current) clearInterval(intervalRef.current);
  }, [status]);

  const submit = () => {
    if (status !== "playing") return;
    if (!answer.trim()) return;
    if (isCorrect(answer, variant.answer)) {
      sfx.success();
      setStatus("solved");
      setFeedback({ kind: "ok", text: "ACESSO CONCEDIDO. fragmento decifrado." });
      onSolved();
    } else {
      sfx.error();
      setFeedback({ kind: "err", text: "RESPOSTA INVÁLIDA. tente novamente." });
    }
  };

  const useHint = () => {
    if (status !== "playing") return;
    if (hintsUsed >= Math.min(MAX_HINTS_VISIBLE, variant.hints.length)) return;
    sfx.click();
    setHintsUsed((h) => h + 1);
  };

  const reveal = () => {
    if (status !== "playing") return;
    sfx.click();
    setStatus("revealed");
    setFeedback({ kind: "info", text: `RESPOSTA REVELADA: ${variant.answer.toUpperCase()} — desafio invalidado.` });
  };

  const restart = () => {
    sfx.click();
    onRestart();
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const timerCritical = secondsLeft <= 30;

  return (
    <main className="min-h-screen px-6 py-8 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6 text-xs tracking-widest">
        <Link to="/" onClick={() => sfx.click()} className="text-muted-foreground hover:text-primary">&lt; ABORTAR</Link>
        <span className="text-muted-foreground">FRAGMENTO {stageIndex + 1} / {total}</span>
        <span className={timerCritical ? "text-destructive text-glow" : "text-primary"}>
          ⏱ {mm}:{ss}
        </span>
      </div>

      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl text-primary text-glow tracking-widest mb-2">{challenge.title}</h1>
        <p className="text-xs text-muted-foreground tracking-widest mb-3">// TÉCNICA: {challenge.technique}</p>
        <p className="text-foreground/85 text-sm leading-relaxed">{challenge.intro}</p>
      </header>

      <section className="border border-border/60 bg-card/40 p-5 rounded-sm space-y-4">
        <p className="text-xs text-muted-foreground tracking-widest">{variant.meta}</p>
        <p className="text-sm text-foreground/85">{variant.prompt}</p>
        <pre className="text-primary text-glow text-sm bg-background/60 p-4 border border-border/60 overflow-x-auto whitespace-pre-wrap break-all">
{variant.ciphertext}
        </pre>

        <div className="flex flex-col md:flex-row gap-2">
          <input
            value={answer}
            onChange={(e) => { setAnswer(e.target.value); sfx.type(); }}
            onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
            disabled={status !== "playing"}
            placeholder="> resposta..."
            className="flex-1 bg-input/40 border border-border px-3 py-2 outline-none focus:border-primary text-foreground placeholder:text-muted-foreground/70"
          />
          <button
            onClick={submit}
            disabled={status !== "playing"}
            className="px-5 py-2 bg-primary text-primary-foreground font-bold tracking-widest text-sm border-glow disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ENVIAR
          </button>
        </div>

        <div className="flex flex-wrap gap-2 text-xs tracking-widest">
          <button
            onClick={useHint}
            disabled={status !== "playing" || hintsUsed >= Math.min(MAX_HINTS_VISIBLE, variant.hints.length)}
            className="px-3 py-2 border border-warning/60 text-warning hover:bg-warning/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            DICA ({hintsUsed}/{Math.min(MAX_HINTS_VISIBLE, variant.hints.length)})
          </button>
          <button
            onClick={reveal}
            disabled={status !== "playing"}
            className="px-3 py-2 border border-destructive/60 text-destructive hover:bg-destructive/10 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            RESPOSTA
          </button>
          <button
            onClick={restart}
            className="px-3 py-2 border border-border text-muted-foreground hover:text-primary hover:border-primary/60"
          >
            REINICIAR
          </button>
        </div>

        {hintsUsed > 0 && (
          <ul className="space-y-2 pt-2 border-t border-border/60">
            {variant.hints.slice(0, hintsUsed).map((h, i) => (
              <li key={i} className="text-xs text-warning/90">
                <span className="text-muted-foreground mr-2">&gt; dica {i + 1}:</span>{h}
              </li>
            ))}
          </ul>
        )}

        {feedback && (
          <div
            className={
              "text-sm tracking-widest pt-2 " +
              (feedback.kind === "ok" ? "text-success text-glow" : feedback.kind === "err" ? "text-destructive" : "text-warning")
            }
          >
            &gt; {feedback.text}
          </div>
        )}

        {status === "expired" && (
          <div className="text-sm text-destructive tracking-widest">
            &gt; TEMPO ESGOTADO. fragmento perdido.
          </div>
        )}
      </section>

      {(status === "solved" || status === "revealed" || status === "expired") && (
        <div className="mt-6 flex gap-3 justify-end">
          {(status === "revealed" || status === "expired") && (
            <button onClick={restart} className="px-5 py-2 border border-primary/60 text-primary tracking-widest text-sm hover:bg-primary/10">
              TENTAR OUTRA VARIAÇÃO
            </button>
          )}
          {status === "solved" && !isLast && (
            <button
              onClick={() => { sfx.click(); onNext(); }}
              className="px-5 py-2 bg-primary text-primary-foreground tracking-widest text-sm border-glow"
            >
              PRÓXIMO FRAGMENTO &gt;
            </button>
          )}
          {status === "solved" && isLast && (
            <button
              onClick={() => { sfx.click(); onNext(); }}
              className="px-5 py-2 bg-primary text-primary-foreground tracking-widest text-sm border-glow"
            >
              FINALIZAR &gt;
            </button>
          )}
        </div>
      )}
    </main>
  );
}
