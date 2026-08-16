import {
  ChevronDown,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  LoaderCircle,
  Moon,
  RefreshCw,
  Sun,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { fetchManitoWeather, type ManitoWeatherForecast } from '../data/weather'

type WeatherState =
  | { status: 'loading'; data: null }
  | { status: 'ready'; data: ManitoWeatherForecast }
  | { status: 'error'; data: null }

interface WeatherCondition {
  label: string
  icon: LucideIcon
}

const weatherCondition = (code: number, isDay = true): WeatherCondition => {
  if (code === 0) return { label: 'Clear sky', icon: isDay ? Sun : Moon }
  if (code === 1) return { label: 'Mostly clear', icon: isDay ? CloudSun : CloudMoon }
  if (code === 2) return { label: 'Partly cloudy', icon: isDay ? CloudSun : CloudMoon }
  if (code === 3) return { label: 'Overcast', icon: Cloud }
  if (code === 45 || code === 48) return { label: 'Foggy', icon: CloudFog }
  if ([51, 53, 55].includes(code)) return { label: 'Drizzle', icon: CloudDrizzle }
  if (code === 56 || code === 57) return { label: 'Freezing drizzle', icon: CloudDrizzle }
  if ([61, 63, 65, 66, 67].includes(code)) return { label: 'Rain', icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Snow', icon: CloudSnow }
  if ([80, 81, 82].includes(code)) return { label: 'Rain showers', icon: CloudRain }
  if ([95, 96, 99].includes(code)) return { label: 'Thunderstorms', icon: CloudLightning }
  return { label: 'Cloudy', icon: Cloud }
}

const forecastDate = (date: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-PH', {
    ...options,
    timeZone: 'Asia/Manila',
  }).format(new Date(`${date}T12:00:00+08:00`))

const observedTime = (time: string) =>
  new Intl.DateTimeFormat('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Manila',
  }).format(new Date(`${time}:00+08:00`))

export function WeatherForecast() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [requestNonce, setRequestNonce] = useState(0)
  const [weather, setWeather] = useState<WeatherState>({ status: 'loading', data: null })

  useEffect(() => {
    const controller = new AbortController()
    setWeather({ status: 'loading', data: null })
    fetchManitoWeather(controller.signal)
      .then((data) => setWeather({ status: 'ready', data }))
      .catch(() => {
        if (!controller.signal.aborted) setWeather({ status: 'error', data: null })
      })
    return () => controller.abort()
  }, [requestNonce])

  useEffect(() => {
    if (!isOpen) return

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('pointerdown', closeOnOutsidePress, true)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress, true)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  const current = weather.status === 'ready' ? weather.data.current : null
  const condition = current
    ? weatherCondition(current.weatherCode, current.isDay)
    : { label: weather.status === 'error' ? 'Unavailable' : 'Loading forecast', icon: CloudSun }
  const CurrentIcon = condition.icon
  const triggerLabel = current
    ? `Manito weather: ${Math.round(current.temperature)} degrees Celsius, ${condition.label}. ${isOpen ? 'Close' : 'Open'} seven-day forecast.`
    : `Manito weather ${weather.status === 'error' ? 'is unavailable' : 'is loading'}. ${isOpen ? 'Close' : 'Open'} forecast panel.`

  return (
    <div className={`weather-control${isOpen ? ' is-open' : ''}`} ref={rootRef}>
      <button
        className="weather-trigger"
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={triggerLabel}
        aria-expanded={isOpen}
        aria-controls="manito-weather-forecast"
      >
        {weather.status === 'loading' ? (
          <LoaderCircle className="weather-trigger__status-icon is-loading" size={17} aria-hidden="true" />
        ) : (
          <CurrentIcon className="weather-trigger__status-icon" size={17} strokeWidth={1.8} aria-hidden="true" />
        )}
        <span className="weather-trigger__copy">
          <small>Manito weather</small>
          <strong>
            {current ? `${Math.round(current.temperature)}°` : '—'}
            <span>{condition.label}</span>
          </strong>
        </span>
        {current && <span className="weather-trigger__mobile-temperature">{Math.round(current.temperature)}°</span>}
        <ChevronDown className="weather-trigger__chevron" size={13} strokeWidth={1.8} aria-hidden="true" />
      </button>

      {isOpen && (
        <section
          className="weather-forecast"
          id="manito-weather-forecast"
          aria-label="Seven-day weather forecast for Manito"
          aria-live="polite"
        >
          <header className="weather-forecast__header">
            <span>
              <small>Manito, Albay · Local time</small>
              <strong>Seven-day outlook</strong>
            </span>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close weather forecast">
              <X size={16} strokeWidth={1.8} aria-hidden="true" />
            </button>
          </header>

          {weather.status === 'loading' && (
            <div className="weather-forecast__state">
              <LoaderCircle className="is-loading" size={20} aria-hidden="true" />
              <span>Reading the latest forecast…</span>
            </div>
          )}

          {weather.status === 'error' && (
            <div className="weather-forecast__state weather-forecast__state--error">
              <Cloud size={21} aria-hidden="true" />
              <strong>Forecast unavailable</strong>
              <span>Check your connection and try again.</span>
              <button type="button" onClick={() => setRequestNonce((nonce) => nonce + 1)}>
                <RefreshCw size={13} aria-hidden="true" /> Try again
              </button>
            </div>
          )}

          {weather.status === 'ready' && (
            <>
              <div className="weather-now">
                <CurrentIcon size={31} strokeWidth={1.55} aria-hidden="true" />
                <span>
                  <small>Now · Updated {observedTime(weather.data.current.observedAt)}</small>
                  <strong>{Math.round(weather.data.current.temperature)}°</strong>
                </span>
                <p>
                  <strong>{condition.label}</strong>
                  <span>Feels like {Math.round(weather.data.current.apparentTemperature)}°</span>
                </p>
              </div>

              <ol className="weather-days">
                {weather.data.days.map((day, index) => {
                  const dailyCondition = weatherCondition(day.weatherCode)
                  const DailyIcon = dailyCondition.icon
                  return (
                    <li key={day.date}>
                      <span className="weather-day__date">
                        <strong>{index === 0 ? 'Today' : forecastDate(day.date, { weekday: 'short' })}</strong>
                        <small>{forecastDate(day.date, { month: 'short', day: 'numeric' })}</small>
                      </span>
                      <DailyIcon className="weather-day__icon" size={19} strokeWidth={1.7} aria-hidden="true" />
                      <span className="weather-day__condition">{dailyCondition.label}</span>
                      <span className="weather-day__rain" title={`${Math.round(day.rainChance)}% chance of rain`}>
                        <Droplets size={12} strokeWidth={1.8} aria-hidden="true" />
                        {Math.round(day.rainChance)}%
                      </span>
                      <span className="weather-day__temperature">
                        <strong>{Math.round(day.high)}°</strong>
                        <span>{Math.round(day.low)}°</span>
                      </span>
                    </li>
                  )
                })}
              </ol>
            </>
          )}

          <footer className="weather-forecast__footer">
            Forecast data by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo ↗</a>
          </footer>
        </section>
      )}
    </div>
  )
}
