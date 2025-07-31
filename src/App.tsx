import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { GlobalProvider } from "@/contexts/GlobalContext";
import { DataProvider } from "@/contexts/DataContext";
import { AppHeader } from "@/components/AppHeader";
import Dashboard from "./pages/Dashboard";
import { PlannerPage } from "./pages/PlannerPage";
import { AudiencePanel } from "./pages/AudiencePanel";
import { HeatMapPanel } from "./pages/HeatMapPanel";
import { WarmupWizard } from "./pages/WarmupWizard";
import { AutomationCanvas } from "./pages/AutomationCanvas";
import { ListCleaningPage } from "./pages/ListCleaningPage";
import { MacrosPage } from "./pages/MacrosPage";
import { RecipesPage } from "./pages/RecipesPage";
import { BackfillPage } from "./pages/BackfillPage";
import { RFMAnalysisPage } from "./pages/RFMAnalysisPage";
import Audiences from "./pages/Audiences";
import Automations from "./pages/Automations";
import AutomationsFlow from "./pages/AutomationsFlow";
import WarmUp from "./pages/WarmUp";
import Guardrails from "./pages/Guardrails";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <GlobalProvider>
        <DataProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="min-h-screen flex w-full">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <AppHeader />
                <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/planner-new" element={<PlannerPage />} />
                  <Route path="/audiencias/:tipo" element={<AudiencePanel />} />
                  <Route path="/heatmap" element={<HeatMapPanel />} />
                  <Route path="/warmup" element={<WarmupWizard />} />
                  <Route path="/automation" element={<AutomationCanvas />} />
                  <Route path="/cleaning" element={<ListCleaningPage />} />
                  <Route path="/macros" element={<MacrosPage />} />
                  <Route path="/receitas" element={<RecipesPage />} />
                  <Route path="/backfill" element={<BackfillPage />} />
                  <Route path="/rfm-analysis" element={<RFMAnalysisPage />} />
                  <Route path="/audiences" element={<Audiences />} />
                  <Route path="/automations" element={<Automations />} />
                  <Route path="/automations-flow" element={<AutomationsFlow />} />
                  <Route path="/warm-up" element={<WarmUp />} />
                  <Route path="/guardrails" element={<Guardrails />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
        </TooltipProvider>
        </DataProvider>
      </GlobalProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
