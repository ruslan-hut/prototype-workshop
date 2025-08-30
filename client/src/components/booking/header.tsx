import { Button } from "@/components/ui/button"
import { HelpCircle, Bed, Plane, Package, Car, Ticket, Car as Taxi } from "lucide-react"

export function Header() {
  return (
    <header className="bg-booking-blue text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top navigation bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold" data-testid="logo">Booking.com</h1>
          </div>
          
          {/* Right side navigation */}
          <div className="flex items-center space-x-4">
            {/* Currency selector */}
            <div className="flex items-center space-x-2 text-sm">
              <span data-testid="currency">EUR</span>
              <img 
                src="https://images.unsplash.com/photo-1593642532400-2682810df593?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=32&h=20" 
                alt="US Flag" 
                className="w-6 h-4 rounded-sm" 
              />
            </div>
            
            {/* Help icon */}
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 transition-colors p-0"
              data-testid="button-help"
            >
              <HelpCircle className="w-4 h-4" />
            </Button>
            
            {/* List your property */}
            <a 
              href="#" 
              className="text-sm hover:underline" 
              data-testid="link-list-property"
            >
              List your property
            </a>
            
            {/* Register button */}
            <Button 
              className="bg-white text-booking-blue px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              data-testid="button-register"
            >
              Register
            </Button>
            
            {/* Sign in button */}
            <Button 
              className="bg-white text-booking-blue px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              data-testid="button-signin"
            >
              Sign in
            </Button>
          </div>
        </div>
        
        {/* Navigation tabs */}
        <div className="border-t border-white/20">
          <nav className="flex space-x-8 py-4">
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-2 rounded bg-white/10 text-white font-medium"
              data-testid="nav-stays"
            >
              <Bed className="w-4 h-4" />
              <span>Stays</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              data-testid="nav-flights"
            >
              <Plane className="w-4 h-4" />
              <span>Flights</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              data-testid="nav-flight-hotel"
            >
              <Package className="w-4 h-4" />
              <span>Flight + Hotel</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              data-testid="nav-car-rental"
            >
              <Car className="w-4 h-4" />
              <span>Car rental</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              data-testid="nav-attractions"
            >
              <Ticket className="w-4 h-4" />
              <span>Attractions</span>
            </a>
            <a 
              href="#" 
              className="flex items-center space-x-2 px-3 py-2 rounded text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              data-testid="nav-airport-taxis"
            >
              <Taxi className="w-4 h-4" />
              <span>Airport taxis</span>
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}
