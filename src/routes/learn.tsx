import { createFileRoute, Outlet } from "@tanstack/react-router";
import { pageMeta } from "@/lib/pageMeta";
export const Route = createFileRoute("/learn")({ head: () => pageMeta("فهرست دوره‌های انگلیسی", "دوره‌های مدرسه و کتاب‌های انگلیسی با تمرین‌های بازبینی‌شده و وضعیت واقعی آمادگی محتوا."), component: () => <Outlet /> });