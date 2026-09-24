// Single source of truth for the app's logo mark — every screen/component
// that needs the logo should import it from here, so swapping the asset
// (or later, pointing it at a CDN URL) only means editing this one line.
export const Logo = require('../../assets/images/logo.png')
export const APP_NAME = 'SahkarSeva'

// OpenFreeMap — free, no API key, no rate limits. Swap for a self-hosted tile
// server later without touching any component code.
export const MAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/positron'
export const MAP_STYLE_URL_DARK = 'https://tiles.openfreemap.org/styles/dark'
export const DEFAULT_MAP_CENTER = { lat: 12.9716, lng: 77.5946 }
