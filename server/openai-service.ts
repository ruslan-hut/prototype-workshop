import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_SECRET || process.env.OPENAI_API_KEY 
});

export interface TravelOfferRequest {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  rooms: number;
  budget: number;
  interests: string[];
  accommodationType: string;
  transportPreference: string;
}

export interface OfferRefinementRequest {
  currentOffer: any;
  feedback: string;
  newRequirements?: string;
}

export interface ItineraryRequest {
  destination: string;
  checkInDate: string;
  checkOutDate: string;
  adults: number;
  children: number;
  interests: string[];
  budget: number;
  accommodationType: string;
  selectedOffer: any;
}

export async function generateTravelOffers(request: TravelOfferRequest) {
  try {
    const prompt = `Як експерт з подорожей, створи 3 різні пропозиції подорожей до ${request.destination} з ${request.checkInDate} по ${request.checkOutDate} для ${request.adults} дорослих${request.children > 0 ? ` та ${request.children} дітей` : ''}.

Бюджет: €${request.budget} на особу
Інтереси: ${request.interests.join(', ')}
Тип проживання: ${request.accommodationType}
Транспорт: ${request.transportPreference}

Створи 3 варіанти: Економ, Комфорт, Преміум. Для кожного надай:
- Назву пропозиції
- Короткий опис (2-3 речення) 
- Орієнтовну ціну
- Тип готелю та його назву
- Основні переваги

Відповідай JSON у форматі:
{
  "offers": [
    {
      "id": "unique-id",
      "title": "Назва",
      "description": "Опис", 
      "price": число,
      "category": "economy|comfort|premium",
      "hotelName": "Назва готелю",
      "hotelStars": число,
      "highlights": ["перевага1", "перевага2", "перевага3"],
      "flightPrice": число,
      "hotelPrice": число
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Ти експерт з туризму, що розмовляє українською мовою та створює реалістичні пропозиції подорожей з актуальними цінами в євро."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.offers || [];
  } catch (error) {
    console.error("Error generating travel offers:", error);
    throw new Error("Failed to generate travel offers");
  }
}

export async function refineOffer(request: OfferRefinementRequest) {
  try {
    const prompt = `Як експерт з подорожей, покращи цю пропозицію подорожі на основі відгуку користувача:

Поточна пропозиція: ${JSON.stringify(request.currentOffer, null, 2)}

Відгук користувача: ${request.feedback}
${request.newRequirements ? `Нові вимоги: ${request.newRequirements}` : ''}

Створи оновлену пропозицію, враховуючи всі побажання. Зберігай той самий JSON формат, але оновлюй відповідні поля.

Відповідай JSON у тому самому форматі що й оригінальна пропозиція.`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system", 
          content: "Ти експерт з туризму, що вміє покращувати пропозиції подорожей на основі відгуків користувачів."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error("Error refining offer:", error);
    throw new Error("Failed to refine offer");
  }
}

export async function buildItinerary(request: ItineraryRequest) {
  try {
    const checkIn = new Date(request.checkInDate);
    const checkOut = new Date(request.checkOutDate);
    const days = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));

    const prompt = `Як експерт з подорожей, створи детальний маршрут на ${days} днів до ${request.destination} для ${request.adults} дорослих${request.children > 0 ? ` та ${request.children} дітей` : ''}.

Інтереси: ${request.interests.join(', ')}
Бюджет: €${request.budget} на особу  
Тип проживання: ${request.accommodationType}
Дати: з ${request.checkInDate} по ${request.checkOutDate}

Для кожного дня створи:
- Назву дня (День 1, День 2, тощо)
- 2-3 основні активності з описами
- Орієнтовну вартість дня на особу
- Практичні поради

Відповідай JSON у форматі:
{
  "itinerary": [
    {
      "day": число,
      "title": "День X: Назва", 
      "activities": [
        {
          "time": "Час",
          "title": "Назва активності",
          "description": "Опис",
          "price": число,
          "location": "Місце"
        }
      ],
      "totalCost": число,
      "tips": "Поради для дня"
    }
  ],
  "totalBudget": число,
  "summary": "Короткий підсумок маршруту"
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "Ти експерт з туризму, що створює детальні маршрути подорожей українською мовою з реалістичними цінами в євро."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error("Error building itinerary:", error);
    throw new Error("Failed to build itinerary");
  }
}