import {
  blowfishEncrypt,
  caesarEncode,
  toBase64,
  toMorse,
  reverseStr,
} from "./ciphers";

export type Variant = {
  id: string;
  prompt: string;       // what the player sees (the puzzle text)
  ciphertext: string;   // the encoded data
  meta: string;         // small label like "BLOWFISH / ECB / KEY: ..."
  answer: string;       // the expected plaintext (case-insensitive trimmed)
  hints: string[];      // progressive hints (1..n)
};

export type Challenge = {
  id: string;
  title: string;
  intro: string;
  technique: string;
  variants: Variant[];
};

const norm = (s: string) => s.trim().toLowerCase();
export function isCorrect(answer: string, expected: string) {
  return norm(answer) === norm(expected);
}

// ---- Challenge 1: BASE / CAESAR foundations ----
const c1: Challenge = {
  id: "fragment-01",
  title: "FRAGMENTO 01 // SINAL CIFRADO",
  intro:
    "Um sinal interceptado em uma frequência abandonada. Decifre a palavra-chave que abre a próxima porta.",
  technique: "Base64 / Caesar / Morse",
  variants: [
    {
      id: "c1-v1",
      prompt: "Mensagem capturada em transmissão de rádio amador:",
      ciphertext: toBase64("sombra"),
      meta: "ENCODING: BASE64",
      answer: "sombra",
      hints: [
        "Não é criptografia real — apenas codificação reversível.",
        "Os caracteres '=' no fim são típicos de Base64.",
        "Decodifique como Base64 para revelar uma palavra em português.",
      ],
    },
    {
      id: "c1-v2",
      prompt: "Cartão postal antigo, sem remetente:",
      ciphertext: caesarEncode("ENIGMA", 7),
      meta: "ENCODING: CAESAR / SHIFT DESCONHECIDO",
      answer: "enigma",
      hints: [
        "Cada letra foi deslocada o mesmo número de posições no alfabeto.",
        "Tente forças brutas: shifts de 1 a 25.",
        "O deslocamento é 7. Resultado: uma palavra de 6 letras.",
      ],
    },
    {
      id: "c1-v3",
      prompt: "Pulsos elétricos gravados de um cabo enterrado:",
      ciphertext: toMorse("CORVO"),
      meta: "ENCODING: MORSE",
      answer: "corvo",
      hints: [
        "Pontos e traços. Algo do século XIX.",
        "Cada grupo separado por espaço é uma letra.",
        "Em Morse: -.-. --- .-. ...- ---  →  uma ave preta.",
      ],
    },
  ],
};

// ---- Challenge 2: BLOWFISH ----
const c2: Challenge = {
  id: "fragment-02",
  title: "FRAGMENTO 02 // CHAVE DO PEIXE",
  intro:
    "O protocolo se aprofunda. Aqui você precisa de uma cifra simétrica real: BLOWFISH em modo ECB com chave fornecida. Recupere a palavra oculta.",
  technique: "Blowfish (ECB, PKCS5)",
  variants: [
    {
      id: "c2-v1",
      prompt: "Bloco hexadecimal transmitido em loop:",
      ciphertext: blowfishEncrypt("liberdade", "abismo"),
      meta: 'BLOWFISH / ECB / KEY: "abismo" / PADDING: PKCS5 / OUTPUT: HEX',
      answer: "liberdade",
      hints: [
        "Use uma biblioteca de Blowfish ECB com PKCS5/PKCS7 e converta a chave em UTF-8.",
        'A chave é a palavra "abismo" (sem aspas).',
        'O texto cifrado decodifica para uma palavra de 9 letras: "liberdade".',
      ],
    },
    {
      id: "c2-v2",
      prompt: "Arquivo recuperado de um disquete sem etiqueta:",
      ciphertext: blowfishEncrypt("verdade", "cicada"),
      meta: 'BLOWFISH / ECB / KEY: "cicada" / PADDING: PKCS5 / OUTPUT: HEX',
      answer: "verdade",
      hints: [
        "Modo ECB, mesma chave para cifrar e decifrar.",
        'A chave é o nome de um inseto que canta no verão: "cicada".',
        'A resposta é uma palavra portuguesa de 7 letras: "verdade".',
      ],
    },
    {
      id: "c2-v3",
      prompt: "Mensagem oculta em metadados de uma imagem queimada:",
      ciphertext: blowfishEncrypt("silencio", "labirinto"),
      meta: 'BLOWFISH / ECB / KEY: "labirinto" / PADDING: PKCS5 / OUTPUT: HEX',
      answer: "silencio",
      hints: [
        "Blowfish aceita chaves de 4 a 56 bytes.",
        'A chave é "labirinto" — o caminho sem saída.',
        'A resposta é uma palavra de 8 letras, sem acento: "silencio".',
      ],
    },
  ],
};

// ---- Challenge 3: COMPOSTO (multi-camada) ----
const c3: Challenge = {
  id: "fragment-03",
  title: "FRAGMENTO 03 // CAMADAS",
  intro:
    "A última porta exige paciência. O texto foi processado por mais de uma técnica — você precisa desfazê-las na ordem inversa.",
  technique: "Camadas combinadas",
  variants: [
    {
      id: "c3-v1",
      // Caesar(+5) then Base64
      prompt: "Texto extraído de um manuscrito digital corrompido:",
      ciphertext: toBase64(caesarEncode("ABISMO", 5)),
      meta: "PIPELINE: CAESAR(+5) → BASE64",
      answer: "abismo",
      hints: [
        "Duas camadas. Primeiro decodifique Base64.",
        "O resultado parece embaralhado: aplique Caesar na direção contrária.",
        "Shift = 5, e a resposta tem 6 letras.",
      ],
    },
    {
      id: "c3-v2",
      // reverse then Blowfish key "noite"
      prompt: "Bloco final transmitido às 03:33:",
      ciphertext: blowfishEncrypt(reverseStr("revelacao"), "noite"),
      meta: 'PIPELINE: REVERSE → BLOWFISH / KEY: "noite"',
      answer: "revelacao",
      hints: [
        'Decifre Blowfish primeiro com a chave "noite".',
        "O texto resultante está escrito de trás para frente.",
        'Inverta a string: "oacaleve r" → "revelacao".',
      ],
    },
    {
      id: "c3-v3",
      // base64 then blowfish key "espelho"
      prompt: "Fragmento encontrado num espelho digital:",
      ciphertext: blowfishEncrypt(toBase64("oraculo"), "espelho"),
      meta: 'PIPELINE: BASE64 → BLOWFISH / KEY: "espelho"',
      answer: "oraculo",
      hints: [
        'Decifre Blowfish com a chave "espelho".',
        "O texto resultante ainda parece codificado: terminadores '=' indicam Base64.",
        'Decodifique Base64 para obter a resposta de 7 letras: "oraculo".',
      ],
    },
  ],
};

export const CHALLENGES: Challenge[] = [c1, c2, c3];

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
