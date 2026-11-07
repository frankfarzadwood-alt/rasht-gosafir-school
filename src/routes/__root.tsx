import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Home, BookOpen, Gamepad2, ChartNoAxesCombined, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadLocalOverlay } from "@/lib/localBank";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useProgress, totalXp } from "@/lib/progress";
import { fa, isSenior } from "@/lib/fa";
import { publicAssetUrl } from "@/lib/public-asset";

const logo = publicAssetUrl("/brand/safir-logo.png");

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">۴۰۴</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">صفحه پیدا نشد</h2>
        <div className="mt-6">
          <Link to="/" className="btn bg-primary text-primary-foreground">بازگشت به خانه</Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">این صفحه بارگذاری نشد</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="btn bg-primary text-primary-foreground">دوباره امتحان کن</button>
          <Link to="/" className="btn border border-border">خانه</Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "GO SAFIR | ماجراجویی انگلیسی" },
      { name: "description", content: "یادگیری انگلیسی با بازی؛ مدرسه، Evolve، Project، Oxford Word Skills و IELTS در سفیر." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: logo, type: "image/png" },
      { rel: "apple-touch-icon", href: logo },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&family=Vazirmatn:wght@400;500;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  if (import.meta.env.MODE === "pages") return <><HeadContent />{children}</>;
  return (
    <html lang="fa" dir="rtl">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const p = useProgress();
  useEffect(() => {
    document.documentElement.classList.toggle("dark", p.settings.dark);
    document.documentElement.dataset["band"] = p.grade && isSenior(p.grade) ? "senior" : "junior";
  }, [p.settings.dark, p.grade]);
  useEffect(() => { void loadLocalOverlay(); }, []);
  return (
    <QueryClientProvider client={queryClient}>
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/95 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-3" aria-label="سربرگ سفیر">
          <Link to="/" className="flex min-h-11 items-center gap-3 whitespace-nowrap text-primary">
            <img src={logo} width="48" height="48" alt="نشان آموزشگاه زبان سفیر" className="h-12 w-12 rounded-full bg-white" />
            <span><span lang="en" dir="ltr" className="block text-base font-extrabold tracking-widest">GO SAFIR</span><span className="block text-xs font-bold text-muted-foreground">ماجراجویی انگلیسی</span></span>
          </Link>
          <span className="flex-1" />
          {p.nickname && <span className="whitespace-nowrap rounded-2xl border border-gold/50 bg-gold/20 px-3 py-2 text-xs font-extrabold" aria-label="امتیاز">⭐ {fa(totalXp(p))}</span>}
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6 pb-36"><Outlet /></main>
      <nav aria-label="ناوبری اصلی" className="app-dock fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto grid max-w-3xl grid-cols-5 gap-1 rounded-3xl border-2 border-border bg-card/95 p-2 shadow-xl backdrop-blur">
          {([{ to: "/", label: "خانه", icon: Home }, { to: "/learn", label: "یادگیری", icon: BookOpen }, { to: "/games", label: "بازی‌ها", icon: Gamepad2 }, { to: "/progress", label: "پیشرفت", icon: ChartNoAxesCombined }, { to: "/profile", label: "پروفایل", icon: User }] as const).map(item => <Button asChild key={item.to} variant="ghost" className="h-14 min-w-0 rounded-xl px-1"><Link to={item.to} activeOptions={{ exact: item.to === "/" }} activeProps={{ className: "bg-secondary text-primary" }} inactiveProps={{ className: "text-muted-foreground" }} className="flex flex-col gap-1 text-xs font-bold"><item.icon aria-hidden className="h-5 w-5" />{item.label}</Link></Button>)}
        </div>
      </nav>
    </QueryClientProvider>
  );
}
