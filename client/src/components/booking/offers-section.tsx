import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Offer } from "@shared/schema"

export function OffersSection() {
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  })

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Offers</h3>
            <p className="text-gray-600">Promotions, deals, and special offers for you</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="h-48 animate-pulse bg-gray-200" />
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!offers || offers.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Offers</h3>
            <p className="text-gray-600">Promotions, deals, and special offers for you</p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">No offers available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-offers-title">Offers</h3>
          <p className="text-gray-600" data-testid="text-offers-subtitle">Promotions, deals, and special offers for you</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {offers.map((offer) => (
            <Card key={offer.id} className="bg-white rounded-lg overflow-hidden shadow-sm offer-card" data-testid={`card-offer-${offer.id}`}>
              <div className="md:flex">
                <div className="md:w-1/2">
                  <img 
                    src={offer.imageUrl} 
                    alt={offer.title}
                    className="w-full h-48 md:h-full object-cover" 
                    data-testid={`img-offer-${offer.id}`}
                  />
                </div>
                <div className="p-6 md:w-1/2">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded" data-testid={`text-offer-category-${offer.id}`}>
                    {offer.category}
                  </span>
                  <h4 className="text-xl font-bold mt-3 mb-2" data-testid={`text-offer-title-${offer.id}`}>{offer.title}</h4>
                  <p className="text-gray-600 mb-4" data-testid={`text-offer-description-${offer.id}`}>{offer.description}</p>
                  <Button 
                    className="bg-booking-blue-light text-white px-4 py-2 rounded font-medium hover:bg-booking-blue transition-colors"
                    data-testid={`button-offer-${offer.id}`}
                  >
                    {offer.buttonText}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
