import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Dashboard from "@/pages/Dashboard";
import Hospedes from "@/pages/Hospedes";
import Tipos from "@/pages/Tipos";
import Quartos from "@/pages/Quartos";
import Funcionarios from "@/pages/Funcionarios";
import Reservas from "@/pages/Reservas";
import ReservaDetail from "@/pages/ReservaDetail";
import Servicos from "@/pages/Servicos";
import Consumos from "@/pages/Consumos";
import Pagamentos from "@/pages/Pagamentos";
import Avaliacoes from "@/pages/Avaliacoes";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/hospedes"} component={Hospedes} />
      <Route path={"/tipos"} component={Tipos} />
      <Route path={"/quartos"} component={Quartos} />
      <Route path={"/funcionarios"} component={Funcionarios} />
      <Route path={"/reservas"} component={Reservas} />
      <Route path={"/reservas/:id"} component={ReservaDetail} />
      <Route path={"/servicos"} component={Servicos} />
      <Route path={"/consumos"} component={Consumos} />
      <Route path={"/pagamentos"} component={Pagamentos} />
      <Route path={"/avaliacoes"} component={Avaliacoes} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
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
