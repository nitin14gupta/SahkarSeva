// Single source of truth for the app's logo mark — every screen/component
// that needs the logo should import it from here, so swapping the asset
// (or later, pointing it at a CDN URL) only means editing this one line.
export const Logo = require('../../assets/images/logo.png')
export const APP_NAME = 'SahkarSeva'

// MapLibre's free public demo style — fine for development; swap for a real
// tile provider's style URL before shipping to production.
export const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json'
