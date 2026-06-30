interface Props {
  code: string; // ISO 3166-1 alpha-2
  size?: number;
}

export default function FlagEmoji({ code, size = 64 }: Props) {
  const lower = code.toLowerCase();
  const width = size;
  const height = Math.round((size * 2) / 3);
  return (
    <img
      src={`https://flagcdn.com/${lower}.svg`}
      alt={code}
      width={width}
      height={height}
      style={{
        display: 'inline-block',
        width,
        height,
        objectFit: 'contain',
        borderRadius: 2,
        flexShrink: 0,
      }}
      loading="lazy"
    />
  );
}
