export function SubjectChip({
  name,
  icon,
  color,
  size = "sm",
}: {
  name: string;
  icon: string;
  color: string;
  size?: "sm" | "md";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${
        size === "sm" ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5"
      }`}
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span>{icon}</span>
      {name}
    </span>
  );
}
