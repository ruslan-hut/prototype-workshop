import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppState } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Euro, Users, Plane, Hotel, Clock } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SurveyBasics() {
  const { state, dispatch } = useAppState()
  const [, setLocation] = useLocation()
  const { toast } = useToast()
  
  const [adultsCount, setAdultsCount] = useState(2)
  const [childrenCount, setChildrenCount] = useState(0)

  const handleDestinationAdd = (destination: string) => {
    if (destination && !state.searchInput.to.includes(destination)) {
      dispatch({
        type: 'SET_SEARCH_INPUT',
        payload: { to: [...state.searchInput.to, destination] }
      })
    }
  }

  const handleDestinationRemove = (destination: string) => {
    dispatch({
      type: 'SET_SEARCH_INPUT',
      payload: { to: state.searchInput.to.filter(d => d !== destination) }
    })
  }

  const handleInterestToggle = (interest: string) => {
    const interests = state.searchInput.interests.includes(interest)
      ? state.searchInput.interests.filter(i => i !== interest)
      : [...state.searchInput.interests, interest]
    
    dispatch({
      type: 'SET_SEARCH_INPUT',
      payload: { interests }
    })
  }

  const handleStayTypeToggle = (stayType: string) => {
    const types = state.searchInput.stayType.includes(stayType)
      ? state.searchInput.stayType.filter(t => t !== stayType)
      : [...state.searchInput.stayType, stayType]
    
    dispatch({
      type: 'SET_SEARCH_INPUT',
      payload: { stayType: types }
    })
  }

  const handleTransportToggle = (transport: string) => {
    const transports = state.searchInput.transport.includes(transport)
      ? state.searchInput.transport.filter(t => t !== transport)
      : [...state.searchInput.transport, transport]
    
    dispatch({
      type: 'SET_SEARCH_INPUT',
      payload: { transport: transports }
    })
  }

  const handleGenerateOffers = async () => {
    if (state.searchInput.to.length === 0) {
      toast({
        title: 'Оберіть напрямок',
        description: 'Будь ласка, вкажіть хоча б один напрямок подорожі',
        variant: 'destructive'
      })
      return
    }

    if (!state.searchInput.dateFrom || !state.searchInput.dateTo) {
      toast({
        title: 'Вкажіть дати',
        description: 'Будь ласка, оберіть дати подорожі',
        variant: 'destructive'
      })
      return
    }

    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      const response = await fetch('/ai/generate_offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.searchInput)
      })
      
      if (!response.ok) throw new Error('Failed to generate offers')
      
      const offers = await response.json()
      dispatch({ type: 'SET_OFFERS', payload: offers })
      setLocation('/offers')
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Не вдалося згенерувати пропозиції. Спробуйте ще раз.' })
      toast({
        title: 'Помилка',
        description: 'Не вдалося згенерувати пропозиції. Спробуйте ще раз.',
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold" data-testid="title-survey">AI помічник для подорожей</h1>
          <p className="text-blue-100 mt-2">Оберіть параметри вашої подорожі</p>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid gap-8">
          {/* Destination Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Куди подорожуємо?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Наприклад: Барселона, Париж, Рим..."
                  data-testid="input-destination"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDestinationAdd(e.currentTarget.value)
                      e.currentTarget.value = ''
                    }
                  }}
                />
                <Button 
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement
                    handleDestinationAdd(input.value)
                    input.value = ''
                  }}
                  data-testid="button-add-destination"
                >
                  Додати
                </Button>
              </div>
              
              {state.searchInput.to.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {state.searchInput.to.map((destination) => (
                    <Badge 
                      key={destination} 
                      variant="secondary" 
                      className="cursor-pointer"
                      onClick={() => handleDestinationRemove(destination)}
                      data-testid={`badge-destination-${destination}`}
                    >
                      {destination} ×
                    </Badge>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-airport">Звідки летимо</Label>
                  <Select 
                    value={state.searchInput.from || ''} 
                    onValueChange={(value) => dispatch({ type: 'SET_SEARCH_INPUT', payload: { from: value } })}
                  >
                    <SelectTrigger data-testid="select-from-airport">
                      <SelectValue placeholder="Оберіть аеропорт" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KBP">Київ (KBP)</SelectItem>
                      <SelectItem value="LWO">Львів (LWO)</SelectItem>
                      <SelectItem value="ODS">Одеса (ODS)</SelectItem>
                      <SelectItem value="WAW">Варшава (WAW)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Date Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Коли подорожуємо?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-from">Дата виїзду</Label>
                  <Input
                    id="date-from"
                    type="date"
                    value={state.searchInput.dateFrom || ''}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_INPUT', payload: { dateFrom: e.target.value } })}
                    data-testid="input-date-from"
                  />
                </div>
                <div>
                  <Label htmlFor="date-to">Дата повернення</Label>
                  <Input
                    id="date-to"
                    type="date"
                    value={state.searchInput.dateTo || ''}
                    onChange={(e) => dispatch({ type: 'SET_SEARCH_INPUT', payload: { dateTo: e.target.value } })}
                    data-testid="input-date-to"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="flex-dates"
                  checked={state.searchInput.dateFlex.enabled}
                  onCheckedChange={(checked) => 
                    dispatch({ 
                      type: 'SET_SEARCH_INPUT', 
                      payload: { dateFlex: { ...state.searchInput.dateFlex, enabled: !!checked } }
                    })
                  }
                  data-testid="checkbox-flex-dates"
                />
                <Label htmlFor="flex-dates">Гнучкі дати (±{state.searchInput.dateFlex.days} днів)</Label>
              </div>
              
              {state.searchInput.dateFlex.enabled && (
                <div>
                  <Label>Гнучкість: ±{state.searchInput.dateFlex.days} днів</Label>
                  <Slider
                    value={[state.searchInput.dateFlex.days]}
                    onValueChange={([days]) => 
                      dispatch({ 
                        type: 'SET_SEARCH_INPUT', 
                        payload: { dateFlex: { ...state.searchInput.dateFlex, days } }
                      })
                    }
                    max={7}
                    min={1}
                    step={1}
                    className="mt-2"
                    data-testid="slider-flex-days"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Euro className="w-5 h-5" />
                Бюджет
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Бюджет: {state.searchInput.budget.min}€ - {state.searchInput.budget.max}€</Label>
                <Slider
                  value={[state.searchInput.budget.min, state.searchInput.budget.max]}
                  onValueChange={([min, max]) => 
                    dispatch({ 
                      type: 'SET_SEARCH_INPUT', 
                      payload: { budget: { ...state.searchInput.budget, min, max } }
                    })
                  }
                  max={3000}
                  min={0}
                  step={50}
                  className="mt-2"
                  data-testid="slider-budget"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="per-person"
                  checked={state.searchInput.budget.perPerson}
                  onCheckedChange={(checked) => 
                    dispatch({ 
                      type: 'SET_SEARCH_INPUT', 
                      payload: { budget: { ...state.searchInput.budget, perPerson: !!checked } }
                    })
                  }
                  data-testid="checkbox-per-person"
                />
                <Label htmlFor="per-person">Ціна за особу</Label>
              </div>
            </CardContent>
          </Card>

          {/* Travelers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Мандрівники
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">Дорослі</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCount = Math.max(1, adultsCount - 1)
                        setAdultsCount(newCount)
                        dispatch({
                          type: 'SET_USER_PROFILE',
                          payload: { travelers: Array(newCount + childrenCount).fill(null).map((_, i) => ({ type: i < newCount ? 'adult' : 'child' })) }
                        })
                      }}
                      disabled={adultsCount <= 1}
                      data-testid="button-adults-decrease"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center" data-testid="text-adults-count">{adultsCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCount = adultsCount + 1
                        setAdultsCount(newCount)
                        dispatch({
                          type: 'SET_USER_PROFILE',
                          payload: { travelers: Array(newCount + childrenCount).fill(null).map((_, i) => ({ type: i < newCount ? 'adult' : 'child' })) }
                        })
                      }}
                      data-testid="button-adults-increase"
                    >
                      +
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="children">Діти</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCount = Math.max(0, childrenCount - 1)
                        setChildrenCount(newCount)
                        dispatch({
                          type: 'SET_USER_PROFILE',
                          payload: { travelers: Array(adultsCount + newCount).fill(null).map((_, i) => ({ type: i < adultsCount ? 'adult' : 'child' })) }
                        })
                      }}
                      disabled={childrenCount <= 0}
                      data-testid="button-children-decrease"
                    >
                      -
                    </Button>
                    <span className="w-8 text-center" data-testid="text-children-count">{childrenCount}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newCount = childrenCount + 1
                        setChildrenCount(newCount)
                        dispatch({
                          type: 'SET_USER_PROFILE',
                          payload: { travelers: Array(adultsCount + newCount).fill(null).map((_, i) => ({ type: i < adultsCount ? 'adult' : 'child' })) }
                        })
                      }}
                      data-testid="button-children-increase"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Вподобання</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Interests */}
              <div>
                <Label className="text-base font-medium">Що вас цікавить?</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {['пляж', 'їжа', 'музеї', 'з дітьми', 'нічне життя', 'природа', 'шопінг', 'спорт'].map((interest) => (
                    <Button
                      key={interest}
                      variant={state.searchInput.interests.includes(interest) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleInterestToggle(interest)}
                      data-testid={`button-interest-${interest}`}
                    >
                      {interest}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Stay Type */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Hotel className="w-4 h-4" />
                  Тип проживання
                </Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'hotel', label: 'Готель' },
                    { value: 'apartment', label: 'Апартаменти' },
                    { value: 'hostel', label: 'Хостел' }
                  ].map((type) => (
                    <Button
                      key={type.value}
                      variant={state.searchInput.stayType.includes(type.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleStayTypeToggle(type.value)}
                      data-testid={`button-stay-${type.value}`}
                    >
                      {type.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Transport */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Plane className="w-4 h-4" />
                  Транспорт
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                  {[
                    { value: 'flight', label: 'Літак' },
                    { value: 'train', label: 'Поїзд' },
                    { value: 'bus', label: 'Автобус' },
                    { value: 'car', label: 'Авто' }
                  ].map((transport) => (
                    <Button
                      key={transport.value}
                      variant={state.searchInput.transport.includes(transport.value) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTransportToggle(transport.value)}
                      data-testid={`button-transport-${transport.value}`}
                    >
                      {transport.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Pace */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Темп подорожі
                </Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[
                    { value: 'chill', label: 'Спокійно' },
                    { value: 'balanced', label: 'Збалансовано' },
                    { value: 'intense', label: 'Насичено' }
                  ].map((pace) => (
                    <Button
                      key={pace.value}
                      variant={state.searchInput.pace === pace.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => dispatch({ type: 'SET_SEARCH_INPUT', payload: { pace: pace.value as any } })}
                      data-testid={`button-pace-${pace.value}`}
                    >
                      {pace.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            onClick={() => setLocation('/')}
            data-testid="button-back"
          >
            Назад
          </Button>
          <Button 
            onClick={handleGenerateOffers}
            disabled={state.flags.loading}
            size="lg"
            data-testid="button-generate-offers"
          >
            {state.flags.loading ? 'Генеруємо варіанти...' : 'Показати варіанти'}
          </Button>
        </div>
      </div>
    </div>
  )
}