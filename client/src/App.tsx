import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/app-context";
import SurveyBasics from "@/pages/survey-basics";
import OffersList from "@/pages/offers-list";
import OfferDetails from "@/pages/offer-details";
import ItineraryBuilder from "@/pages/itinerary-builder";
import CheckoutStub from "@/pages/checkout-stub";
import Done from "@/pages/done";
import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Redirect root to survey */}
      <Route path="/">
        {() => <Redirect to="/survey" />}
      </Route>
      
      {/* AI Travel Assistant Flow */}
      <Route path="/survey" component={SurveyBasics}/>
      <Route path="/offers" component={OffersList}/>
      <Route path="/offer-details" component={OfferDetails}/>
      <Route path="/itinerary" component={ItineraryBuilder}/>
      <Route path="/checkout" component={CheckoutStub}/>
      <Route path="/done" component={Done}/>
      
      {/* Original Booking.com clone (for reference) */}
      <Route path="/booking-clone" component={Home}/>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
