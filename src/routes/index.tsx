import { createFileRoute, Link } from "@tanstack/react-router";
import { TypeText } from "@/components/TypeText";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "PROTOCOLO NOX // sinal recebido" },
      { name: "description", content: "Um desafio criptográfico imersivo. Decifre os fragmentos." },
      { property: "og:title", content: "PROTOCOLO NOX" },
      { property: "og:description", content: "Decifre os fragmentos. A escuridão escuta." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 py-12 scan-flicker">
      <div className="max-w-2xl w-full">
        <p className="text-xs tracking-[0.3em] text-muted-foreground mb-6">
          [ TRANSMISSÃO ENTRANTE — 03:33:07 ]
        </p>
        <h1 className="text-4xl md:text-6xl font-bold text-primary text-glow mb-8 leading-tight glitch">
          PROTOCOLO_NOX
        </h1>

        <div className="text-foreground/90 text-sm md:text-base leading-relaxed space-y-4 min-h-[10rem]">
          <p>
            <TypeText
              text="Você não chegou aqui por acaso. Alguém deixou um rastro — coordenadas, cifras, silêncio."
              speed={22}
            />
          </p>
          <p className="text-muted-foreground">
            <TypeText
              text="Três fragmentos. Dez minutos cada. A verdade não pertence a quem desiste."
              speed={22}
            />
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            to="/missao"
            onClick={() => sfx.click()}
            className="px-6 py-3 bg-primary text-primary-foreground font-bold tracking-widest text-sm border-glow hover:brightness-110 transition"
          >
            &gt; INICIAR
          </Link>
          <Link
            to="/tutorial"
            onClick={() => sfx.click()}
            className="px-6 py-3 border border-primary/60 text-primary tracking-widest text-sm hover:bg-primary/10 transition"
          >
            &gt; TUTORIAL
          </Link>
        </div>

        <p className="mt-16 text-[10px] tracking-[0.4em] text-muted-foreground/60">
          // a escuridão escuta. mantenha a calma.
        </p>
      </div>
    </main>
  );
}
