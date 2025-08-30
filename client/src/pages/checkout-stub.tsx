import { useState } from 'react'
import { useLocation } from 'wouter'
import { useAppState } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  ArrowLeft,
  CheckCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react'

const steps = [
  { id: 1, title: 'Перевірка деталей', completed: true },
  { id: 2, title: 'Контакти', completed: false },
  { id: 3, title: 'Оплата (заглушка)', completed: false }
]

export default function CheckoutStub() {
  const { state } = useAppState()
  const [, setLocation] = useLocation()
  const [currentStep, setCurrentStep] = useState(1)

  const selectedOffer = state.offers.find(offer => offer.id === state.selectedOfferId)

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      setLocation('/done')
    }
  }

  const progress = (currentStep / 3) * 100

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-booking-blue text-white">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" data-testid="title-checkout">Бронювання (прототип)</h1>
              <p className="text-blue-100 mt-2">Крок {currentStep} з 3</p>
            </div>
            <Button
              variant="ghost"
              onClick={() => setLocation('/itinerary')}
              className="text-white hover:bg-white/10"
              data-testid="button-back-to-itinerary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep ? 'bg-booking-blue text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id < currentStep ? <CheckCircle className="w-4 h-4" /> : step.id}
                </div>
                <span className="ml-2 text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Перевірка деталей
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedOffer && (
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedOffer.title}</h3>
                        <p className="text-gray-600">{selectedOffer.summary}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedOffer.flights?.map((flight, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="font-medium">{flight.carrier}</div>
                            <div className="text-sm text-gray-600">
                              {flight.from} → {flight.to}
                            </div>
                            <div className="text-sm text-gray-600">
                              {flight.dep} - {flight.ret}
                            </div>
                          </div>
                        ))}
                        
                        {selectedOffer.stay?.map((stay, index) => (
                          <div key={index} className="border rounded-lg p-3">
                            <div className="font-medium">{stay.name}</div>
                            <div className="text-sm text-gray-600">{stay.area}</div>
                            <div className="text-sm text-gray-600">{stay.nights} ночей</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Контактна інформація
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Ім'я</label>
                        <div className="border rounded p-3 bg-gray-100 text-gray-500">
                          Іван Петренко (демо)
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Прізвище</label>
                        <div className="border rounded p-3 bg-gray-100 text-gray-500">
                          Петренко (демо)
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <div className="border rounded p-3 bg-gray-100 text-gray-500 flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        ivan.petrenko@example.com (демо)
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Телефон</label>
                      <div className="border rounded p-3 bg-gray-100 text-gray-500 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        +380 67 123 45 67 (демо)
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Оплата (заглушка)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Це демонстраційний прототип</span>
                    </div>
                    <p className="text-yellow-700 mt-2 text-sm">
                      У прототипі це демонстраційний крок. Кнопка нижче завершує сценарій.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gray-100">
                    <div className="text-center text-gray-600">
                      <CreditCard className="w-12 h-12 mx-auto mb-4" />
                      <div className="text-lg font-medium mb-2">Демо-оплата</div>
                      <div className="text-sm">Форма оплати буде реалізована в повній версії</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Підсумок замовлення</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Подорож:</span>
                    <span className="font-medium">{state.searchInput.to.join(', ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Дати:</span>
                    <span className="font-medium">
                      {state.searchInput.dateFrom} - {state.searchInput.dateTo}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Мандрівники:</span>
                    <span className="font-medium">{state.userProfile.travelers.length} осіб</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Загалом:</span>
                    <span>{state.itinerary.totals.price}€</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between mt-8">
          <Button 
            variant="outline"
            onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : setLocation('/itinerary')}
            data-testid="button-checkout-back"
          >
            Назад
          </Button>
          <Button 
            onClick={handleNextStep}
            size="lg"
            data-testid="button-checkout-next"
          >
            {currentStep === 3 ? 'Завершити' : 'Далі'}
          </Button>
        </div>
      </div>
    </div>
  )
}