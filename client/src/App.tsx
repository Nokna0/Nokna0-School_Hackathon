import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import StudyPage from "@/pages/StudyPage";
import MathStudyPage from "@/pages/MathStudyPage";
import EnglishStudyPage from "@/pages/EnglishStudyPage";
import ChemistryStudyPage from "@/pages/ChemistryStudyPage";
import StudyRecordsPage from "@/pages/StudyRecordsPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/math" component={MathStudyPage} />
      <Route path="/english" component={EnglishStudyPage} />
      <Route path="/chemistry" component={ChemistryStudyPage} />
      <Route path="/study/math" component={MathStudyPage} />
      <Route path="/study/english" component={EnglishStudyPage} />
      <Route path="/study/chemistry" component={ChemistryStudyPage} />
      <Route path="/study/:subject" component={StudyPage} />
      <Route path="/records" component={StudyRecordsPage} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
