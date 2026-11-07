import { createHashHistory, RouterProvider } from "@tanstack/react-router";
import { createRoot } from "react-dom/client";
import { getRouter } from "./router";

const router = getRouter(createHashHistory());
createRoot(document.getElementById("root")!).render(<RouterProvider router={router} />);
