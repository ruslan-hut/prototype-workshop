import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppState } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Star, 
  Euro, 
  Calendar, 
  Users,
  Filter,
  ArrowLeft,
  Eye,
  Settings,
  BarChart3
} from 'lucide-react'
import type { TravelOffer } from '@shared/schema'

export default function OffersList() {
  const { state, dispatch } = useAppState()
  const [, setLocation] = useLocation()
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([0, 3000])
  const [filteredStayTypes, setFilteredStayTypes] = useState<string[]>(['hotel', 'apartment', 'hostel'])
  const [filteredTransports, setFilteredTransports] = useState<string[]>(['flight', 'train', 'bus', 'car'])
  const [filteredPace, setFilteredPace] = useState<string[]>(['chill', 'balanced', 'intense'])

  const filteredOffers = state.offers.filter(offer => {
    return offer.price.total >= priceRange[0] && offer.price.total <= priceRange[1]
  })

  const handleViewOffer = (offerId: string) => {
    dispatch({ type: 'SET_SELECTED_OFFER_ID', payload: offerId })
    setLocation('/offer-details')
  }

  const handleRefineOffer = async (offer: TravelOffer) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const response = await fetch('/ai/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          constraints: { priceRange, stayTypes: filteredStayTypes },
          currentOffer: offer
        })
      })
      
      if (!response.ok) throw new Error('Failed to refine offer')
      
      const refinedOffers = await response.json()
      dispatch({ type: 'SET_OFFERS', payload: [...state.offers, ...refinedOffers] })
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Не вдалося уточнити пропозицію' })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  if (state.offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Немає доступних пропозицій</h2>
          <p className="text-gray-600 mb-8">Спробуйте змінити параметри пошуку</p>
          <Button onClick={() => setLocation('/survey')} data-testid="button-back-to-survey">
            Повернутися до форми
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-booking-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="title-offers">Рекомендовані варіанти</h1>
              <p className="text-blue-100 mt-2">Знайдено {filteredOffers.length} пропозицій</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation('/survey')}
              className="text-white hover:bg-white/10"
              data-testid="button-back-to-survey"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Змінити параметри
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters Bar */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="mb-4"
            data-testid="button-toggle-filters"
          >
            <Filter className="w-4 h-4 mr-2" />
            Фільтри
          </Button>

          {showFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Ціна: {priceRange[0]}€ - {priceRange[1]}€</Label>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={3000}
                    min={0}
                    step={50}
                    className="mt-2"
                    data-testid="slider-price-filter"
                  />
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Offers Grid */}
        <div className="grid gap-6">
          {filteredOffers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden hover:shadow-lg transition-shadow" data-testid={`card-offer-${offer.id}`}>
              <CardContent className="p-0">
                <div className="md:flex">
                  {/* Left side - Image placeholder */}
                  <div className="md:w-1/3 bg-gradient-to-br from-blue-400 to-purple-500 h-48 md:h-auto">
                    <div className="h-full flex items-center justify-center text-white text-lg font-semibold">
                      {offer.title.split(':')[0]}
                    </div>
                  </div>

                  {/* Right side - Content */}
                  <div className="md:w-2/3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2" data-testid={`text-offer-title-${offer.id}`}>
                          {offer.title}
                        </h3>
                        <p className="text-gray-600 mb-3" data-testid={`text-offer-summary-${offer.id}`}>
                          {offer.summary}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-4">
                          {offer.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" data-testid={`badge-tag-${tag}`}>
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-booking-blue" data-testid={`text-offer-price-${offer.id}`}>
                          {offer.price.total}€
                        </div>
                        <div className="text-sm text-gray-500">
                          {offer.price.perPerson}€ за особу
                        </div>
                      </div>
                    </div>

                    {/* Flight and Stay Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {offer.flights && offer.flights[0] && (
                        <div className="flex items-start space-x-2">
                          <Plane className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm">{offer.flights[0].carrier}</div>
                            <div className="text-sm text-gray-600">
                              {offer.flights[0].from} → {offer.flights[0].to}
                            </div>
                            <div className="text-sm text-gray-600">
                              {offer.flights[0].dep} - {offer.flights[0].ret}
                            </div>
                          </div>
                        </div>
                      )}

                      {offer.stay && offer.stay[0] && (
                        <div className="flex items-start space-x-2">
                          <Hotel className="w-4 h-4 mt-1 text-gray-500" />
                          <div>
                            <div className="font-medium text-sm flex items-center gap-1">
                              {offer.stay[0].name}
                              {offer.stay[0].stars && (
                                <div className="flex">
                                  {Array.from({ length: offer.stay[0].stars }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">{offer.stay[0].area}</div>
                            <div className="text-sm text-gray-600">{offer.stay[0].nights} ночей</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Itinerary Preview */}
                    {offer.itineraryPreview && (
                      <div className="mb-4">
                        <h4 className="font-medium text-sm mb-2">Короткий маршрут:</h4>
                        {offer.itineraryPreview.slice(0, 2).map((day) => (
                          <div key={day.day} className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">День {day.day}:</span> {day.items.join(', ')}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewOffer(offer.id)}
                        className="flex-1"
                        data-testid={`button-view-offer-${offer.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Деталі
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleRefineOffer(offer)}
                        data-testid={`button-refine-offer-${offer.id}`}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Уточнити
                      </Button>
                      <Button
                        variant="outline"
                        data-testid={`button-compare-offer-${offer.id}`}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Порівняти
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}