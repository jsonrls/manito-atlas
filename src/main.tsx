import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import 'maplibre-gl/dist/maplibre-gl.css'
import './styles.css'
import Root from './Root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
    <Analytics />
  </StrictMode>,
)
