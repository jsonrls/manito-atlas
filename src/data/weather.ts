const MANITO_WEATHER_URL = new URL('https://api.open-meteo.com/v1/forecast')

MANITO_WEATHER_URL.search = new URLSearchParams({
  latitude: '13.123',
  longitude: '123.87',
  current: 'temperature_2m,apparent_temperature,weather_code,is_day',
  daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max',
  timezone: 'Asia/Manila',
  forecast_days: '7',
}).toString()

interface WeatherApiResponse {
  current?: {
    time?: unknown
    temperature_2m?: unknown
    apparent_temperature?: unknown
    weather_code?: unknown
    is_day?: unknown
  }
  daily?: {
    time?: unknown
    weather_code?: unknown
    temperature_2m_max?: unknown
    temperature_2m_min?: unknown
    precipitation_probability_max?: unknown
  }
}

export interface DailyWeatherForecast {
  date: string
  weatherCode: number
  high: number
  low: number
  rainChance: number
}

export interface ManitoWeatherForecast {
  current: {
    observedAt: string
    temperature: number
    apparentTemperature: number
    weatherCode: number
    isDay: boolean
  }
  days: DailyWeatherForecast[]
}

const isNumberArray = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'number')

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === 'string')

export async function fetchManitoWeather(signal?: AbortSignal): Promise<ManitoWeatherForecast> {
  const response = await fetch(MANITO_WEATHER_URL, {
    headers: { Accept: 'application/json' },
    signal,
  })

  if (!response.ok) throw new Error(`Weather request failed (${response.status})`)

  const payload = await response.json() as WeatherApiResponse
  const { current, daily } = payload
  const dates = daily?.time
  const weatherCodes = daily?.weather_code
  const highs = daily?.temperature_2m_max
  const lows = daily?.temperature_2m_min
  const rainChances = daily?.precipitation_probability_max

  if (
    typeof current?.time !== 'string'
    || typeof current.temperature_2m !== 'number'
    || typeof current.apparent_temperature !== 'number'
    || typeof current.weather_code !== 'number'
    || typeof current.is_day !== 'number'
    || !isStringArray(dates)
    || !isNumberArray(weatherCodes)
    || !isNumberArray(highs)
    || !isNumberArray(lows)
    || !isNumberArray(rainChances)
    || dates.length < 7
    || weatherCodes.length < 7
    || highs.length < 7
    || lows.length < 7
    || rainChances.length < 7
  ) {
    throw new Error('Weather service returned an incomplete forecast')
  }

  return {
    current: {
      observedAt: current.time,
      temperature: current.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      weatherCode: current.weather_code,
      isDay: current.is_day === 1,
    },
    days: dates.slice(0, 7).map((date, index) => ({
      date,
      weatherCode: weatherCodes[index],
      high: highs[index],
      low: lows[index],
      rainChance: rainChances[index],
    })),
  }
}
