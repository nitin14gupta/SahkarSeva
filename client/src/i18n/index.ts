import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import * as Localization from 'expo-localization'
import * as SecureStore from 'expo-secure-store'
import { useAuthStore } from '@/store/authStore'
import { CacheKeys } from '@/constants'

import enCommon from './locales/en/common.json'
import enAuth from './locales/en/auth.json'
import enCustomer from './locales/en/customer.json'
import enWorker from './locales/en/worker.json'
import hiCommon from './locales/hi/common.json'
import hiAuth from './locales/hi/auth.json'
import hiCustomer from './locales/hi/customer.json'
import hiWorker from './locales/hi/worker.json'
import mrCommon from './locales/mr/common.json'
import mrAuth from './locales/mr/auth.json'
import mrCustomer from './locales/mr/customer.json'
import mrWorker from './locales/mr/worker.json'
import taCommon from './locales/ta/common.json'
import taAuth from './locales/ta/auth.json'
import taCustomer from './locales/ta/customer.json'
import taWorker from './locales/ta/worker.json'
import teCommon from './locales/te/common.json'
import teAuth from './locales/te/auth.json'
import teCustomer from './locales/te/customer.json'
import teWorker from './locales/te/worker.json'
import bnCommon from './locales/bn/common.json'
import bnAuth from './locales/bn/auth.json'
import bnCustomer from './locales/bn/customer.json'
import bnWorker from './locales/bn/worker.json'

export const SUPPORTED_LANGUAGES = ['en', 'hi', 'mr', 'ta', 'te', 'bn'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

function isSupported(code: string | undefined | null): code is SupportedLanguage {
  return !!code && (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
}

function resolveDeviceLanguage(): SupportedLanguage {
  const deviceCode = Localization.getLocales()[0]?.languageCode
  return isSupported(deviceCode) ? deviceCode : 'en'
}

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, auth: enAuth, customer: enCustomer, worker: enWorker },
    hi: { common: hiCommon, auth: hiAuth, customer: hiCustomer, worker: hiWorker },
    mr: { common: mrCommon, auth: mrAuth, customer: mrCustomer, worker: mrWorker },
    ta: { common: taCommon, auth: taAuth, customer: taCustomer, worker: taWorker },
    te: { common: teCommon, auth: teAuth, customer: teCustomer, worker: teWorker },
    bn: { common: bnCommon, auth: bnAuth, customer: bnCustomer, worker: bnWorker },
  },
  ns: ['common', 'auth', 'customer', 'worker'],
  defaultNS: 'common',
  lng: resolveDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
})

// A cached selection (picked during onboarding, or the logged-in user's saved
// preference) always wins over the device's raw locale, which is only a
// first-launch guess before either of those is known.
SecureStore.getItemAsync(CacheKeys.language).then((cached) => {
  if (isSupported(cached) && cached !== i18n.language) i18n.changeLanguage(cached)
})

useAuthStore.subscribe((state, prevState) => {
  const lang = state.user?.language
  if (isSupported(lang) && lang !== prevState.user?.language && lang !== i18n.language) {
    i18n.changeLanguage(lang)
    SecureStore.setItemAsync(CacheKeys.language, lang)
  }
})

export default i18n
