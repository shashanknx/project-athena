import { useEffect, useState } from 'react'
import LandingPage from './components/landing/LandingPage.jsx'
import FullApp from './FullApp.jsx'

// Unlisted, not access-controlled: this is a public static site with no
// backend, so nothing stops a visitor who guesses or inspects the bundle for
// this string from reaching the product. It just isn't linked from the
// landing page. See instructions.md before treating this as real gating.
const INTERNAL_HASH = '#/internal'

function isInternalRoute() {
  return window.location.hash.startsWith(INTERNAL_HASH)
}

/**
 * Root router. The bare project URL renders the public landing page;
 * #/internal renders the actual product. A plain hash rather than a real
 * path so this works on GitHub Pages with zero server-side rewrite config —
 * the hash never leaves the browser, so the single static index.html always
 * serves both routes.
 */
export default function App() {
  const [internal, setInternal] = useState(isInternalRoute)

  useEffect(() => {
    const onHashChange = () => setInternal(isInternalRoute())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    document.title = internal ? 'Project Athena — Internal' : 'Project Athena'
  }, [internal])

  return internal ? <FullApp /> : <LandingPage />
}
