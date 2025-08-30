import { useQuery } from "@tanstack/react-query"
import type { Destination } from "@shared/schema"

export function TrendingDestinationsSection() {
  const { data: destinations, isLoading } = useQuery<Destination[]>({
    queryKey: ["/api/destinations"],
  })

  if (isLoading) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trending destinations</h3>
            <p className="text-gray-600">Most popular choices for travelers from Spain</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-32 rounded-lg mb-2" />
                <div className="bg-gray-200 h-4 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!destinations || destinations.length === 0) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trending destinations</h3>
            <p className="text-gray-600">Most popular choices for travelers from Spain</p>
          </div>
          <div className="text-center py-12">
            <p className="text-gray-500">No trending destinations available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2" data-testid="text-destinations-title">
            Trending destinations
          </h3>
          <p className="text-gray-600" data-testid="text-destinations-subtitle">
            Most popular choices for travelers from Spain
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((destination) => (
            <div 
              key={destination.id} 
              className="cursor-pointer group"
              data-testid={`card-destination-${destination.id}`}
            >
              <img 
                src={destination.imageUrl} 
                alt={`${destination.name} cityscape`}
                className="w-full h-32 object-cover rounded-lg group-hover:opacity-90 transition-opacity" 
                data-testid={`img-destination-${destination.id}`}
              />
              <h4 className="text-sm font-medium mt-2 group-hover:underline" data-testid={`text-destination-name-${destination.id}`}>
                {destination.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
