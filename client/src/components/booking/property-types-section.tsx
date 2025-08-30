import { useQuery } from "@tanstack/react-query"
import { Card } from "@/components/ui/card"
import type { PropertyType } from "@shared/schema"

export function PropertyTypesSection() {
  const { data: propertyTypes, isLoading } = useQuery<PropertyType[]>({
    queryKey: ["/api/property-types"],
  })

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Browse by property type</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-48 rounded-lg mb-3" />
                <div className="bg-gray-200 h-4 rounded w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!propertyTypes || propertyTypes.length === 0) {
    return (
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Browse by property type</h3>
          <div className="text-center py-12">
            <p className="text-gray-500">No property types available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-8" data-testid="text-property-types-title">
          Browse by property type
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {propertyTypes.map((propertyType) => (
            <div 
              key={propertyType.id} 
              className="property-card cursor-pointer"
              data-testid={`card-property-type-${propertyType.id}`}
            >
              <img 
                src={propertyType.imageUrl} 
                alt={propertyType.name}
                className="w-full h-48 object-cover rounded-lg" 
                data-testid={`img-property-type-${propertyType.id}`}
              />
              <h4 className="text-lg font-semibold mt-3" data-testid={`text-property-type-name-${propertyType.id}`}>
                {propertyType.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
