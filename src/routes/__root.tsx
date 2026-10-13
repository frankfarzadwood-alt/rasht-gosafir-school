import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter, HeadContent, Scripts, type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { useProgress, totalXp } from "@/lib/progress";
import { fa, isSenior } from "@/lib/fa";

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
          <a href="/" className="btn border border-border">خانه</a>
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
      { title: "ماجراجویی انگلیسی | English Quest" },
      { name: "description", content: "تمرین امتحان انگلیسی پایهٔ هفتم تا دوازدهم با بازی‌های آموزشی." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
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
  return (
    <QueryClientProvider client={queryClient}>
      <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
        <nav className="mx-auto flex max-w-3xl items-center gap-2 px-3 py-2" aria-label="ناوبری اصلی">
          <Link to="/" className="flex min-h-11 items-center gap-1.5 whitespace-nowrap text-sm font-extrabold text-primary sm:text-base">
            <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" className="fill-primary" /><path d="M9 20 L16 8 L23 20 Z" className="fill-gold" /><circle cx="16" cy="22" r="3" className="fill-teal" /></svg>
            ماجراجویی انگلیسی
          </Link>
          <span className="flex-1" />
          {p.nickname && <span className="whitespace-nowrap rounded-full bg-gold/25 px-2 py-1 text-xs font-bold" aria-label="امتیاز">⭐ {fa(totalXp(p))}</span>}
          <Link to="/profile" className="btn px-2 text-xs sm:text-sm" activeProps={{ className: "bg-secondary" }}>👤 پروفایل</Link>
          <Link to="/admin" className="btn px-2 text-xs sm:text-sm" activeProps={{ className: "bg-secondary" }}>🛠 مدیریت</Link>
        </nav>
      </header>
      <main className="mx-auto max-w-3xl px-3 py-5"><Outlet /></main>
    </QueryClientProvider>
  );
}
