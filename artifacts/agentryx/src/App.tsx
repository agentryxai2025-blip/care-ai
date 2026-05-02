import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Participants from "@/pages/Participants";
import ParticipantDetail from "@/pages/ParticipantDetail";
import Providers from "@/pages/Providers";
import ProviderDetail from "@/pages/ProviderDetail";
import Requests from "@/pages/Requests";
import RequestDetail from "@/pages/RequestDetail";
import Matching from "@/pages/Matching";
import Bookings from "@/pages/Bookings";
import Claims from "@/pages/Claims";
import Compliance from "@/pages/Compliance";
import Reports from "@/pages/Reports";
import Architecture from "@/pages/Architecture";
import DataSources from "@/pages/DataSources";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/participants" component={Participants} />
        <Route path="/participants/:id" component={ParticipantDetail} />
        <Route path="/providers" component={Providers} />
        <Route path="/providers/:id" component={ProviderDetail} />
        <Route path="/requests" component={Requests} />
        <Route path="/requests/:id" component={RequestDetail} />
        <Route path="/matching" component={Matching} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/claims" component={Claims} />
        <Route path="/compliance" component={Compliance} />
        <Route path="/reports" component={Reports} />
        <Route path="/architecture" component={Architecture} />
        <Route path="/data-sources" component={DataSources} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
