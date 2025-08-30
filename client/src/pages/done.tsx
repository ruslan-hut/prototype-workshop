import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { useAppState } from '@/contexts/app-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  CheckCircle, 
  Share, 
  RotateCcw,
  PartyPopper,
  Link as LinkIcon,
  Copy
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function Done() {
  const { state, dispatch } = useAppState()
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  // Simple confetti effect using CSS animations
  useEffect(() => {
    const timer = setTimeout(() => {
      // Add confetti class to body
      document.body.classList.add('confetti-animation')
    }, 100)

    return () => {
      document.body.classList.remove('confetti-animation')
      clearTimeout(timer)
    }
  }, [])

  const handleCopyShareLink = () => {
    if (state.shareLink) {
      navigator.clipboard.writeText(state.shareLink)
      toast({
        title: 'Посилання скопійовано',
        description: 'Тепер ви можете поділитися своїм планом',
      })
    }
  }

  const handleStartOver = () => {
    dispatch({ type: 'RESET_ALL' })
    setLocation('/survey')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-8">
          {/* Success Icon with Animation */}
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4" data-testid="title-done">
            Готово! 🎉
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Ваш план подорожі успішно створено
          </p>
        </div>

        <div className="grid gap-6 max-w-2xl mx-auto">
          {/* Trip Summary Card */}
          <Card className="border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2 text-green-800">
                <PartyPopper className="w-5 h-5" />
                Ваша подорож готова!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Напрямки:</span>
                  <span className="font-medium">{state.searchInput.to.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Тривалість:</span>
                  <span className="font-medium">{state.itinerary.days.length} днів</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Загальна вартість:</span>
                  <span className="font-bold text-green-600 text-lg">{state.itinerary.totals.price}€</span>
                </div>
                {state.userProfile.travelers.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">За особу:</span>
                    <span className="font-medium">
                      {Math.round(state.itinerary.totals.price / state.userProfile.travelers.length)}€
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Share Link Card */}
          {state.shareLink && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share className="w-5 h-5" />
                  Поділитися планом
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <LinkIcon className="w-4 h-4 text-gray-500" />
                  <code className="flex-1 text-sm text-gray-700" data-testid="text-share-link">
                    {state.shareLink}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyShareLink}
                    data-testid="button-copy-link"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Надішліть це посилання друзям або збережіть для себе
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleStartOver}
              className="w-full bg-booking-blue hover:bg-booking-blue-light"
              size="lg"
              data-testid="button-start-over"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Створити нову поїздку
            </Button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setLocation('/itinerary')}
                data-testid="button-view-itinerary"
              >
                Переглянути маршрут
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocation('/offers')}
                data-testid="button-view-offers"
              >
                Інші варіанти
              </Button>
            </div>
          </div>

          {/* Fun Fact */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6 text-center">
              <div className="text-blue-800">
                <PartyPopper className="w-8 h-8 mx-auto mb-3" />
                <p className="font-medium">Ви заощадили час на плануванні!</p>
                <p className="text-sm mt-1">
                  Зазвичай планування такої подорожі займає 4-6 годин
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}