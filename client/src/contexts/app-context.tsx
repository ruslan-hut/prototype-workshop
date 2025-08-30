import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { GlobalState, TravelOffer, Itinerary } from '@shared/schema'

const initialState: GlobalState = {
  userProfile: {
    travelers: [],
    homeAirport: null,
    locale: 'uk-UA',
    currency: 'EUR'
  },
  searchInput: {
    nlq: '',
    from: null,
    to: [],
    dateFrom: null,
    dateTo: null,
    dateFlex: { enabled: true, days: 3 },
    budget: { min: 0, max: 1200, perPerson: true },
    travelers: {
      adults: 2,
      children: 0
    },
    preferences: {
      interests: [],
      stayType: ['hotel'],
      transport: ['flight'],
      pace: 'balanced'
    }
  },
  offers: [],
  selectedOfferId: null,
  itinerary: {
    days: [],
    totals: { price: 0, currency: 'EUR' }
  },
  shareLink: null,
  flags: {
    loading: false,
    error: null
  }
}

type AppAction = 
  | { type: 'SET_SEARCH_INPUT'; payload: Partial<GlobalState['searchInput']> }
  | { type: 'SET_OFFERS'; payload: TravelOffer[] }
  | { type: 'SET_SELECTED_OFFER_ID'; payload: string | null }
  | { type: 'SET_ITINERARY'; payload: Itinerary }
  | { type: 'SET_SHARE_LINK'; payload: string | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_PROFILE'; payload: Partial<GlobalState['userProfile']> }
  | { type: 'RESET_ALL' }

function appReducer(state: GlobalState, action: AppAction): GlobalState {
  switch (action.type) {
    case 'SET_SEARCH_INPUT':
      return {
        ...state,
        searchInput: { ...state.searchInput, ...action.payload }
      }
    case 'SET_OFFERS':
      return {
        ...state,
        offers: action.payload
      }
    case 'SET_SELECTED_OFFER_ID':
      return {
        ...state,
        selectedOfferId: action.payload
      }
    case 'SET_ITINERARY':
      return {
        ...state,
        itinerary: action.payload
      }
    case 'SET_SHARE_LINK':
      return {
        ...state,
        shareLink: action.payload
      }
    case 'SET_LOADING':
      return {
        ...state,
        flags: { ...state.flags, loading: action.payload }
      }
    case 'SET_ERROR':
      return {
        ...state,
        flags: { ...state.flags, error: action.payload }
      }
    case 'SET_USER_PROFILE':
      return {
        ...state,
        userProfile: { ...state.userProfile, ...action.payload }
      }
    case 'RESET_ALL':
      return initialState
    default:
      return state
  }
}

const AppContext = createContext<{
  state: GlobalState
  dispatch: React.Dispatch<AppAction>
} | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppState() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppProvider')
  }
  return context
}