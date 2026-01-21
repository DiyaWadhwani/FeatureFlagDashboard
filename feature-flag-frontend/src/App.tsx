import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
import Audit from "./pages/Audit";
import { useConfig } from "./hooks/useConfig";
import { useEffect } from "react";
import { FEATURE_FLAGS } from "./constants";

function App() {
  const { config, loading } = useConfig();

  useEffect(() => {
    if (!config) return;
    document.documentElement.classList.toggle(
      "dark",
      !!config[FEATURE_FLAGS.DARK_MODE],
    );
  }, [config]);

  if (loading) return null;

  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/checkout" element={<Checkout />} />

            {config?.[FEATURE_FLAGS.AUDIT_LOG_VISIBILITY] && (
              <Route path="/audit" element={<Audit />} />
            )}
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
