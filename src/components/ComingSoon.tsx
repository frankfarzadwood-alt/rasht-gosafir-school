import { Link } from "@tanstack/react-router";
import { COMING_SOON } from "@/lib/presentation-mode";

export function ComingSoonBadge() {
  return <span className="inline-block whitespace-nowrap rounded-full bg-amber-100 px-3 py-1.5 text-xs font-extrabold text-amber-950">{COMING_SOON}</span>;
}

export function ComingSoonPage({ title }: { title: string }) {
  return <section className="card-soft space-y-4 p-6">
    <ComingSoonBadge />
    <h1 lang="en" dir="ltr" className="text-2xl font-extrabold">{title}</h1>
    <Link to="/learn" className="btn bg-primary text-primary-foreground">انتخاب محتوا</Link>
  </section>;
}
