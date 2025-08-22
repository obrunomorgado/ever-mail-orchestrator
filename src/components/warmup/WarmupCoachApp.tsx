import { useState } from "react";
import { WizardSetup } from "./WizardSetup";
import { Dashboard } from "./Dashboard";
import { PlanView } from "./PlanView";
import { Templates } from "./Templates";

type AppView = "wizard" | "dashboard" | "plan" | "templates";

interface WizardData {
  projeto: string;
  ipPool: string;
  dominio: string;
  sender: string;
  vertical: string;
  pais: string;
  metaDiaria: number;
  metaSemanal?: number;
  janelasDisparo: string[];
  ressenciaGlobal: number;
  segmentosGerados: boolean;
  planoConfirmado: boolean;
}

export function WarmupCoachApp() {
  const [currentView, setCurrentView] = useState<AppView>("wizard");
  const [projectData, setProjectData] = useState<WizardData | null>(null);

  const handleWizardComplete = (data: WizardData) => {
    setProjectData(data);
    setCurrentView("dashboard");
  };

  const handleViewPlan = () => {
    setCurrentView("plan");
  };

  const handleViewTemplates = () => {
    setCurrentView("templates");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
  };

  // Navigation breadcrumb
  const renderNavigation = () => {
    if (currentView === "wizard") return null;

    return (
      <div className="mb-6 flex items-center gap-2 text-sm">
        <button
          onClick={handleBackToDashboard}
          className={`px-3 py-1 rounded transition-colors ${
            currentView === "dashboard"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Dashboard
        </button>
        <span className="text-muted-foreground">•</span>
        <button
          onClick={handleViewPlan}
          className={`px-3 py-1 rounded transition-colors ${
            currentView === "plan"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Plano
        </button>
        <span className="text-muted-foreground">•</span>
        <button
          onClick={handleViewTemplates}
          className={`px-3 py-1 rounded transition-colors ${
            currentView === "templates"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Templates
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-7xl mx-auto p-6">
        {renderNavigation()}
        
        {currentView === "wizard" && (
          <WizardSetup onComplete={handleWizardComplete} />
        )}
        
        {currentView === "dashboard" && projectData && (
          <Dashboard
            projectName={projectData.projeto || "Projeto Warmup"}
            onViewPlan={handleViewPlan}
            onViewTemplates={handleViewTemplates}
          />
        )}
        
        {currentView === "plan" && (
          <PlanView />
        )}
        
        {currentView === "templates" && (
          <Templates />
        )}
      </div>
    </div>
  );
}