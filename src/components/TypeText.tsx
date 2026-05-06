import { useEffect, useState } from "react";
import { sfx } from "@/lib/sound";

type Props = {
  text: string;
  speed?: number;
  className?: string;
  caret?: boolean;
  sound?: boolean;
  onDone?: () => void;
};

export function TypeText({ text, speed = 18, className, caret = true, sound = false, onDone }: Props) {
  const [out, setOut] = useState("");
  useEffect(() => {
    setOut("");
    let i = 0;
    const id = setInterval(() => {
      i++;
      setOut(text.slice(0, i));
      if (sound && i % 2 === 0) sfx.type();
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, sound, onDone]);
  return (
    <span className={className}>
      {out}
      {caret && out.length < text.length ? <span className="blink-caret" /> : null}
    </span>
  );
}
