import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  blowfishDecrypt,
  blowfishEncrypt,
  caesarDecode,
  caesarEncode,
  fromBase64,
  toBase64,
  toMorse,
} from "@/lib/ciphers";
import { sfx } from "@/lib/sound";

export const Route = createFileRoute("/tutorial")({
  head: () => ({
    meta: [
      { title: "Tutorial // PROTOCOLO_NOX" },
      { name: "description", content: "Aprenda Blowfish, Base64, Caesar e Morse." },
      { property: "og:title", content: "Tutorial — PROTOCOLO_NOX" },
      { property: "og:description", content: "Fundamentos rápidos para decifrar os fragmentos." },
    ],
  }),
  component: Tutorial,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-border/60 bg-card/40 p-5 rounded-sm">
      <h2 className="text-primary text-glow tracking-widest text-sm mb-3">// {title}</h2>
      <div className="text-sm text-foreground/85 space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}

function Demo({
  label,
  initial,
  run,
}: {
  label: string;
  initial: string;
  run: (input: string) => { encoded: string; decoded: string };
}) {
  const [v, setV] = useState(initial);
  const r = (() => {
    try { return run(v); } catch { return { encoded: "—", decoded: "—" }; }
  })();
  return (
    <div className="bg-background/60 border border-border/60 p-3 text-xs space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">{label}</span>
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          className="flex-1 bg-input/50 border border-border px-2 py-1 outline-none focus:border-primary"
        />
      </div>
      <div><span className="text-muted-foreground">cifrado: </span><span className="text-primary break-all">{r.encoded}</span></div>
      <div><span className="text-muted-foreground">decifrado: </span><span className="break-all">{r.decoded}</span></div>
    </div>
  );
}

function Tutorial() {
  return (
    <main className="min-h-screen px-6 py-10 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <Link to="/" onClick={() => sfx.click()} className="text-xs tracking-widest text-muted-foreground hover:text-primary">
          &lt; VOLTAR
        </Link>
        <span className="text-[10px] tracking-[0.4em] text-muted-foreground">// MANUAL DE CAMPO</span>
      </div>
      <h1 className="text-3xl text-primary text-glow tracking-widest mb-8">TUTORIAL</h1>

      <div className="space-y-6">
        <Section title="BASE64">
          <p>Codificação reversível (não é criptografia). Converte bytes em letras/números/+,/. Frequentemente termina com '='.</p>
          <Demo
            label="texto"
            initial="enigma"
            run={(t) => ({ encoded: toBase64(t), decoded: (() => { try { return fromBase64(toBase64(t)); } catch { return "—"; } })() })}
          />
        </Section>

        <Section title="CIFRA DE CÉSAR">
          <p>Desloca cada letra um número fixo de posições no alfabeto. Quebrar = testar todos os 25 deslocamentos.</p>
          <Demo
            label="texto (shift=3)"
            initial="CORVO"
            run={(t) => ({ encoded: caesarEncode(t, 3), decoded: caesarDecode(caesarEncode(t, 3), 3) })}
          />
        </Section>

        <Section title="CÓDIGO MORSE">
          <p>Pontos e traços. Cada letra separada por espaço, palavras por '/'.</p>
          <Demo label="texto" initial="NOX" run={(t) => ({ encoded: toMorse(t), decoded: t.toUpperCase() })} />
        </Section>

        <Section title="BLOWFISH (modo ECB)">
          <p>
            Cifra simétrica real, projetada por Bruce Schneier (1993). Mesma chave cifra e decifra. Aqui usamos modo ECB com padding PKCS5
            e saída em hexadecimal — formato comum em CTFs.
          </p>
          <p className="text-muted-foreground">
            Para decifrar você precisa de: <span className="text-primary">o texto em hex</span>, <span className="text-primary">a chave</span> e o modo (ECB/PKCS5).
            Use uma lib como <code className="text-primary">egoroof-blowfish</code>, <code className="text-primary">CryptoJS</code> ou um site online de Blowfish ECB.
          </p>
          <Demo
            label='texto (chave="nox")'
            initial="enigma"
            run={(t) => {
              const enc = blowfishEncrypt(t, "nox");
              return { encoded: enc, decoded: blowfishDecrypt(enc, "nox") };
            }}
          />
        </Section>

        <Section title="CAMADAS">
          <p>
            Em desafios reais o texto passa por <em>várias</em> técnicas em sequência. A regra de ouro: identifique cada camada pelo formato
            (hex? base64? letras embaralhadas?) e desfaça na <span className="text-primary">ordem inversa</span>.
          </p>
        </Section>

        <div className="pt-4">
          <Link
            to="/missao"
            onClick={() => sfx.click()}
            className="inline-block px-6 py-3 bg-primary text-primary-foreground font-bold tracking-widest text-sm border-glow"
          >
            &gt; ESTOU PRONTO
          </Link>
        </div>
      </div>
    </main>
  );
}
