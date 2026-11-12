import Link from "next/link";
import { SubjectChip } from "@/components/SubjectChip";

export function ContentCard({
  href,
  title,
  summary,
  grade,
  minutes,
  subjectName,
  subjectIcon,
  subjectColor,
  done,
}: {
  href: string;
  title: string;
  summary: string;
  grade: number;
  minutes: number;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  done?: boolean;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-gray-100 bg-white p-4 shadow-card hover:shadow-cardHover transition-shadow"
    >
      <div className="flex items-center justify-between">
        <SubjectChip name={subjectName} icon={subjectIcon} color={subjectColor} />
        {done && <span className="text-xs font-semibold text-emerald-600">✓ Erledigt</span>}
      </div>
      <h3 className="mt-3 font-bold text-gray-900 group-hover:text-brand-700 transition-colors leading-snug">
        {title}
      </h3>
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{summary}</p>
      <div className="mt-3 flex items-center gap-3 text-xs text-gray-400 font-medium">
        <span>Klasse {grade}</span>
        <span>·</span>
        <span>⏱ {minutes} Min.</span>
      </div>
    </Link>
  );
}
