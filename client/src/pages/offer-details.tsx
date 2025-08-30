import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppState } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plane, 
  Hotel, 
  MapPin, 
  Star, 
  Euro, 
  Calendar, 
  Clock,
  ArrowLeft,
  RefreshCw,
  Map,
  Route
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function OfferDetails() {
  const { state, dispatch } = useAppState()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  
  const selectedOffer = state.offers.find(offer => offer.id === state.selectedOfferId)

  if (!selectedOffer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Пропозицію не знайдено</h2>
          <Button onClick={() => setLocation('/offers')} data-testid="button-back-to-offers">
            Повернутися до пропозицій
          </Button>
        </div>
      </div>
    )
  }

  const handleBuildItinerary = async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const response = await fetch('/ai/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedOffer)
      })
      
      if (!response.ok) throw new Error('Failed to generate itinerary')
      
      const itinerary = await response.json()
      dispatch({ type: 'SET_ITINERARY', payload: itinerary })
      setLocation('/itinerary')
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Не вдалося створити маршрут' })
      toast({
        title: 'Помилка',
        description: 'Не вдалося створити маршрут. Спробуйте ще раз.',
        variant: 'destructive'
      })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-booking-blue text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="title-offer-details">Деталі пакету</h1>
              <p className="text-blue-100 mt-2">{selectedOffer.title}</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation('/offers')}
              className="text-white hover:bg-white/10"
              data-testid="button-back-to-offers"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="flights" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="flights" data-testid="tab-flights">Перельоти</TabsTrigger>
                <TabsTrigger value="accommodation" data-testid="tab-accommodation">Проживання</TabsTrigger>
                <TabsTrigger value="itinerary" data-testid="tab-itinerary">Маршрут</TabsTrigger>
                <TabsTrigger value="price" data-testid="tab-price">Ціна</TabsTrigger>
              </TabsList>

              <TabsContent value="flights" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plane className="w-5 h-5" />
                      Перельоти
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOffer.flights?.map((flight, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">{flight.carrier}</h4>
                          <Badge variant="outline">{flight.price}€</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div>{flight.from} → {flight.to}</div>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Відправлення: {flight.dep}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Повернення: {flight.ret}
                            </span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          data-testid={`button-swap-flight-${index}`}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Замінити переліт
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="accommodation" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="w-5 h-5" />
                      Проживання
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOffer.stay?.map((stay, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            {stay.name}
                            {stay.stars && (
                              <div className="flex">
                                {Array.from({ length: stay.stars }).map((_, i) => (
                                  <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                              </div>
                            )}
                          </h4>
                          <Badge variant="outline">{stay.price}€/ніч</Badge>
                        </div>
                        <div className="text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {stay.area}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3" />
                            {stay.nights} ночей
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="mt-3"
                          data-testid={`button-swap-stay-${index}`}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Замінити проживання
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="itinerary" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Route className="w-5 h-5" />
                      Попередній маршрут
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedOffer.itineraryPreview?.map((day) => (
                      <div key={day.day} className="border rounded-lg p-4 mb-4">
                        <h4 className="font-semibold mb-2">День {day.day}</h4>
                        <ul className="space-y-1">
                          {day.items.map((item, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center gap-2">
                              <div className="w-2 h-2 bg-booking-blue rounded-full" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm"
                      data-testid="button-tune-activities"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Налаштувати активності
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="price" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Euro className="w-5 h-5" />
                      Деталізація ціни
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {selectedOffer.flights?.map((flight, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Переліт ({flight.carrier})</span>
                          <span>{flight.price}€</span>
                        </div>
                      ))}
                      {selectedOffer.stay?.map((stay, index) => (
                        <div key={index} className="flex justify-between">
                          <span>Проживання ({stay.nights} ночей)</span>
                          <span>{stay.price * stay.nights}€</span>
                        </div>
                      ))}
                      <div className="border-t pt-3 flex justify-between font-bold text-lg">
                        <span>Загалом</span>
                        <span>{selectedOffer.price.total}€</span>
                      </div>
                      <div className="text-sm text-gray-600 text-right">
                        {selectedOffer.price.perPerson}€ за особу
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Map Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Карта
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-200 h-48 rounded-lg flex items-center justify-center">
                  <div className="text-gray-500 text-center">
                    <Map className="w-8 h-8 mx-auto mb-2" />
                    <div className="text-sm">Попередній перегляд карти</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-booking-blue">
                      {selectedOffer.price.total}€
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedOffer.price.perPerson}€ за особу
                    </div>
                  </div>
                  
                  <Button
                    onClick={handleBuildItinerary}
                    disabled={state.flags.loading}
                    className="w-full"
                    size="lg"
                    data-testid="button-build-itinerary"
                  >
                    {state.flags.loading ? 'Створюємо маршрут...' : 'Створити маршрут'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}