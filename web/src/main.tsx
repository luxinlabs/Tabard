import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Intro from "./pages/Intro";
import Merchants from "./pages/Merchants";
import Shop from "./pages/Shop";
import Profile from "./pages/Profile";
import AdPage from "./pages/AdPage";
import "./styles.css";

const qc = new QueryClient({ defaultOptions: { queries: { staleTime: 5_000, refetchOnWindowFocus: false, retry: 1 } } });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/merchants" element={<Merchants />} />
          <Route path="/m/:mid" element={<Shop />} />
          <Route path="/m/:mid/profile" element={<Profile />} />
          <Route path="/m/:mid/ads/:pid" element={<AdPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
