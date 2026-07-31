import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import { getLoginUrl } from "./const";
import { LanguageProvider } from "./contexts/LanguageContext";
import "./index.css";

// Public paths that should NEVER redirect to login even if a query returns 401
const PUBLIC_PATHS = ['/demo', '/dialogue', '/', '/pricing', '/terms', '/prelaunch'];

const isPublicPath = () => {
  if (typeof window === "undefined") return false;
  const path = window.location.pathname;
  return PUBLIC_PATHS.some(p => path === p || path.startsWith(p + '/'));
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Zero retries — if it fails, fail fast. No cascading error badges.
      retry: 0,
      // Stale time: 30s to reduce redundant refetches
      staleTime: 30_000,
    },
    mutations: {
      retry: 0,
    },
  },
});

const isAuthError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) return false;
  return error.message === UNAUTHED_ERR_MSG || error.data?.code === 'UNAUTHORIZED';
};

// Silently handle all query errors — no toasts, no console noise for auth errors
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    if (isAuthError(error)) {
      // On public pages: silently swallow the 401 — user is browsing without login
      if (isPublicPath()) return;
      // On protected pages: redirect to login
      if (typeof window !== "undefined") {
        window.location.href = getLoginUrl();
      }
      return;
    }
    // Suppress all other errors from console — the manus-runtime ErrorCatcher
    // intercepts console.error and shows a red badge. Only log in extreme dev mode.
    // if (import.meta.env.DEV) console.error("[Query Error]", error);
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    if (isAuthError(error)) {
      if (!isPublicPath() && typeof window !== "undefined") {
        window.location.href = getLoginUrl();
      }
      return;
    }
    // if (import.meta.env.DEV) console.error("[Mutation Error]", error);
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
