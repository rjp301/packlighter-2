import { RouterProvider, createRouter } from "@tanstack/react-router";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import ErrorPage from "@/app/components/base/error-page";
import { queryClient } from "./lib/client";

// Set up a Router instance
const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: "intent",
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: ErrorPage,
});
// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster richColors />
    <RouterProvider router={router} />
  </QueryClientProvider>
);

export default App;
