import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Calendar, User, Bed, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { DatePicker } from "@/components/ui/date-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { insertSearchRequestSchema } from "@shared/schema"
import { apiRequest } from "@/lib/queryClient"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type SearchFormData = {
  destination: string
  checkInDate: string
  checkOutDate: string
  adults: number
  children: number
  rooms: number
  searchForFlights: string
}

export function HeroSection() {
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [guestSelectorOpen, setGuestSelectorOpen] = useState(false)
  const [adults, setAdults] = useState(2)
  const [children, setChildren] = useState(0)
  const [rooms, setRooms] = useState(1)
  const { toast } = useToast()

  const form = useForm<SearchFormData>({
    resolver: zodResolver(insertSearchRequestSchema),
    defaultValues: {
      destination: "",
      checkInDate: "",
      checkOutDate: "",
      adults: 2,
      children: 0,
      rooms: 1,
      searchForFlights: "false",
    },
  })

  const onSubmit = async (data: SearchFormData) => {
    try {
      await apiRequest("POST", "/api/search", {
        ...data,
        checkInDate: checkInDate ? format(checkInDate, "yyyy-MM-dd") : "",
        checkOutDate: checkOutDate ? format(checkOutDate, "yyyy-MM-dd") : "",
        adults,
        children,
        rooms,
      })
      toast({
        title: "Search submitted",
        description: "We're searching for the best options for you!",
      })
    } catch (error) {
      toast({
        title: "Search failed",
        description: "Please try again later.",
        variant: "destructive",
      })
    }
  }

  return (
    <section className="bg-booking-blue text-white pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero content */}
        <div className="mb-8">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">
            Find your next stay
          </h2>
          <p className="text-xl text-white/90" data-testid="text-hero-subtitle">
            Search deals on hotels, homes, and much more...
          </p>
        </div>
        
        {/* Search form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="bg-white rounded-lg p-1 search-form-shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                {/* Destination input */}
                <div className="relative md:col-span-1">
                  <div className="border-2 border-booking-orange rounded p-3 bg-white">
                    <div className="flex items-center space-x-2">
                      <Bed className="w-4 h-4 text-gray-500" />
                      <FormField
                        control={form.control}
                        name="destination"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="Where are you going?"
                                className="w-full text-gray-700 placeholder-gray-500 border-none outline-none p-0 h-auto focus-visible:ring-0"
                                data-testid="input-destination"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Date inputs */}
                <div className="relative md:col-span-2">
                  <div className="border-2 border-booking-orange rounded p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <DatePicker
                        date={checkInDate}
                        onSelect={setCheckInDate}
                        placeholder="Check-in date"
                        className="text-gray-700"
                      />
                      <span className="text-gray-400">—</span>
                      <DatePicker
                        date={checkOutDate}
                        onSelect={setCheckOutDate}
                        placeholder="Check-out date"
                        className="text-gray-700"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Guests selector and Search button */}
                <div className="relative md:col-span-1 flex">
                  <Popover open={guestSelectorOpen} onOpenChange={setGuestSelectorOpen}>
                    <PopoverTrigger asChild>
                      <div className="border-2 border-booking-orange rounded-l p-3 bg-white flex-1 cursor-pointer" data-testid="button-guest-selector">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700 text-sm">
                            {adults} adults · {children} children · {rooms} room
                          </span>
                          <ChevronDown className="w-4 h-4 text-gray-500 ml-auto" />
                        </div>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-4" data-testid="popover-guest-selector">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Adults</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAdults(Math.max(1, adults - 1))}
                              disabled={adults <= 1}
                              data-testid="button-adults-decrease"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center" data-testid="text-adults-count">{adults}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setAdults(adults + 1)}
                              data-testid="button-adults-increase"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Children</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setChildren(Math.max(0, children - 1))}
                              disabled={children <= 0}
                              data-testid="button-children-decrease"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center" data-testid="text-children-count">{children}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setChildren(children + 1)}
                              data-testid="button-children-increase"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Rooms</span>
                          <div className="flex items-center space-x-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setRooms(Math.max(1, rooms - 1))}
                              disabled={rooms <= 1}
                              data-testid="button-rooms-decrease"
                            >
                              -
                            </Button>
                            <span className="w-8 text-center" data-testid="text-rooms-count">{rooms}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setRooms(rooms + 1)}
                              data-testid="button-rooms-increase"
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    type="submit"
                    className="bg-booking-blue-light hover:bg-booking-blue text-white px-8 py-3 rounded-r font-semibold transition-colors"
                    data-testid="button-search"
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Search for flights checkbox */}
              <div className="mt-4 px-3">
                <FormField
                  control={form.control}
                  name="searchForFlights"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2">
                      <FormControl>
                        <Checkbox
                          checked={field.value === "true"}
                          onCheckedChange={(checked) => field.onChange(checked ? "true" : "false")}
                          data-testid="checkbox-search-flights"
                        />
                      </FormControl>
                      <span className="text-sm text-gray-700">Search for flights</span>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </section>
  )
}
