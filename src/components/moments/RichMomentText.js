import Link from "next/link";

function normalizeMention(value = "") {
  return String(value || "").trim().replace(/^@+/, "").toLowerCase();
}

function normalizeHashtag(value = "") {
  return String(value || "").trim().replace(/^#+/, "").toLowerCase();
}

function splitTrailingPunctuation(token = "") {
  const marks = /[.,!?;:،؛'"`)>\]}>»…]+$/u;
  const match = String(token || "").match(marks);
  if (!match) return { core: token, tail: "" };
  const tail = match[0];
  return { core: token.slice(0, token.length - tail.length), tail };
}

function parseMomentTokens(text) {
  const raw = String(text || "");
  if (!raw) return [];
  const regex = /(https?:\/\/[^\s]+|[#@][\p{L}\p{N}_]{1,64})/gu;
  const chunks = [];
  let cursor = 0;
  let match;

  while ((match = regex.exec(raw)) !== null) {
    const token = String(match[0] || "");
    const start = Number(match.index || 0);
    const end = start + token.length;
    const prevChar = start > 0 ? raw[start - 1] : "";

    if (start > cursor) {
      chunks.push({ type: "text", value: raw.slice(cursor, start) });
    }

    if ((token.startsWith("#") || token.startsWith("@")) && /[\p{L}\p{N}_]/u.test(prevChar)) {
      chunks.push({ type: "text", value: token });
      cursor = end;
      continue;
    }

    if (/^https?:\/\//i.test(token)) {
      const { core, tail } = splitTrailingPunctuation(token);
      chunks.push({ type: "url", value: core });
      if (tail) chunks.push({ type: "text", value: tail });
      cursor = end;
      continue;
    }

    if (token.startsWith("#")) {
      chunks.push({ type: "hashtag", value: token });
      cursor = end;
      continue;
    }

    chunks.push({ type: "mention", value: token });
    cursor = end;
  }

  if (cursor < raw.length) {
    chunks.push({ type: "text", value: raw.slice(cursor) });
  }
  return chunks;
}

export default function RichMomentText({
  text = "",
  className = "",
  urlClassName = "font-semibold text-blue-700 hover:underline",
  hashtagClassName = "font-bold text-blue-700 hover:underline",
  mentionClassName = "font-bold text-indigo-700 hover:underline",
}) {
  const chunks = parseMomentTokens(text);
  if (!chunks.length) return null;

  return (
    <span className={className}>
      {chunks.map((part, index) => {
        const key = `${part.type}-${index}`;
        if (part.type === "text") return <span key={key}>{part.value}</span>;
        if (part.type === "url") {
          return (
            <a key={key} href={part.value} target="_blank" rel="noreferrer" className={urlClassName}>
              {part.value}
            </a>
          );
        }
        if (part.type === "hashtag") {
          const tag = normalizeHashtag(part.value);
          if (!tag) return <span key={key}>{part.value}</span>;
          return (
            <Link key={key} href={`/hashtag/${encodeURIComponent(tag)}`} className={hashtagClassName}>
              {part.value}
            </Link>
          );
        }

        const username = normalizeMention(part.value);
        if (!username) return <span key={key}>{part.value}</span>;
        return (
          <Link key={key} href={`/${encodeURIComponent(username)}`} className={mentionClassName}>
            {part.value}
          </Link>
        );
      })}
    </span>
  );
}
