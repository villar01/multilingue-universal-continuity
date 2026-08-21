import { trpc } from "@/lib/trpc";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
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

// Erros globais não navegam. Cada rota protegida preserva o próprio contexto e
// apresenta a recuperação apropriada, evitando que um 401 transitório descarte
// uma cena, lição ou formulário em andamento.
queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    if (isAuthError(error)) {
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
