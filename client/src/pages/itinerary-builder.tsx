import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppState } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  Clock, 
  Euro, 
  Plus, 
  Minus, 
  Edit, 
  ArrowLeft,
  Share,
  CreditCard,
  MapPin,
  Utensils,
  Camera,
  Bed
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'move': return <MapPin className="w-4 h-4" />
    case 'activity': return <Camera className="w-4 h-4" />
    case 'rest': return <Bed className="w-4 h-4" />
    default: return <Calendar className="w-4 h-4" />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'move': return 'bg-blue-100 text-blue-800'
    case 'activity': return 'bg-green-100 text-green-800'
    case 'rest': return 'bg-gray-100 text-gray-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default function ItineraryBuilder() {
  const { state, dispatch } = useAppState()
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleGenerateShareLink = () => {
    const shareHash = Math.random().toString(36).substring(2, 15)
    const shareLink = `https://example.local/trip/${shareHash}`
    dispatch({ type: 'SET_SHARE_LINK', payload: shareLink })
    
    toast({
      title: 'Посилання створено',
      description: 'Тепер ви можете поділитися своїм планом подорожі',
    })
  }

  if (state.itinerary.days.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Маршрут не знайдено</h2>
          <Button onClick={() => setLocation('/offers')} data-testid="button-back-to-offers">
            Повернутися до пропозицій
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
              <h1 className="text-3xl font-bold" data-testid="title-itinerary">Маршрут по днях</h1>
              <p className="text-blue-100 mt-2">Детальний план вашої подорожі</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation('/offer-details')}
              className="text-white hover:bg-white/10"
              data-testid="button-back-to-details"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Day Accordion */}
          <div className="lg:col-span-2">
            <Accordion type="multiple" defaultValue={state.itinerary.days.map((_, i) => `day-${i}`)} className="space-y-4">
              {state.itinerary.days.map((day, dayIndex) => (
                <AccordionItem key={dayIndex} value={`day-${dayIndex}`} className="border rounded-lg bg-white">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline" data-testid={`accordion-day-${dayIndex}`}>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-booking-blue" />
                      <span className="font-semibold">День {dayIndex + 1}</span>
                      <Badge variant="outline">{new Date(day.date).toLocaleDateString('uk-UA')}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4">
                    <div className="space-y-3">
                      {day.segments.map((segment, segmentIndex) => (
                        <div key={segmentIndex} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          <div className={`p-2 rounded-full ${getActivityColor(segment.type)}`}>
                            {getActivityIcon(segment.type)}
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{segment.title}</div>
                            {segment.time && (
                              <div className="text-sm text-gray-600 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {segment.time}
                              </div>
                            )}
                          </div>
                          {segment.price && (
                            <Badge variant="outline">{segment.price}€</Badge>
                          )}
                          <div className="flex gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-edit-segment-${dayIndex}-${segmentIndex}`}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              data-testid={`button-remove-segment-${dayIndex}-${segmentIndex}`}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <Button
                        variant="outline"
                        className="w-full mt-3"
                        data-testid={`button-add-activity-${dayIndex}`}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Додати активність
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Sidebar - Summary Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Euro className="w-5 h-5" />
                  Загальна вартість
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-booking-blue mb-2">
                    {state.itinerary.totals.price}€
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    {state.userProfile.travelers.length > 0 
                      ? `${Math.round(state.itinerary.totals.price / state.userProfile.travelers.length)}€ за особу`
                      : 'Загальна сума'
                    }
                  </div>
                  
                  <div className="space-y-2">
                    <Button
                      onClick={() => setLocation('/checkout')}
                      className="w-full"
                      size="lg"
                      data-testid="button-proceed-booking"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Перейти до бронювання
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={handleGenerateShareLink}
                      className="w-full"
                      data-testid="button-save-share"
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Зберегти / Поділитись
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trip Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Підсумок подорожі</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Напрямки:</span>
                    <span>{state.searchInput.to.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Тривалість:</span>
                    <span>{state.itinerary.days.length} днів</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Мандрівники:</span>
                    <span>{state.userProfile.travelers.length} осіб</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Темп:</span>
                    <Badge variant="outline">
                      {state.searchInput.pace === 'chill' ? 'Спокійно' : 
                       state.searchInput.pace === 'balanced' ? 'Збалансовано' : 'Насичено'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}