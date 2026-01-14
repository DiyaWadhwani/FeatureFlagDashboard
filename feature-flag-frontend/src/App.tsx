import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Checkout from "./pages/Checkout";
// import { useThemeFromFlags } from "./hooks/useThemeFromFlags";
import { useConfig } from "./hooks/useConfig";
import { useEffect } from "react";

function App() {
  const { config } = useConfig();

  useEffect(() => {
    if (!config) return;

    if (config.dark_mode_v2) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [config]);

  // useThemeFromFlags();
  return (
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
