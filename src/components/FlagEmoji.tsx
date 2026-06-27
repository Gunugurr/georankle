interface Props {
  code: string; // ISO 3166-1 alpha-2
  size?: number;
}

function codeToEmoji(code: string): string {
  return code
    .toUpperCase()
    .split('')
    .map(c => String.fromCodePoint(0x1f1e6 - 65 + c.charCodeAt(0)))
    .join('');
}

export default function FlagEmoji({ code, size = 64 }: Props) {
  return (
    <span style={{ fontSize: size, lineHeight: 1, display: 'inline-block' }} aria-label={code}>
      {codeToEmoji(code)}
    </span>
  );
}
