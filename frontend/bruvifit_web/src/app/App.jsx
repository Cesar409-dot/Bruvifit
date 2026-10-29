import { useEffect, useState } from 'react'
import { MainLayout } from '../widgets/main-layout/index.jsx'
import { Sidebar } from '../widgets/sidebar/index.jsx'
import { AccessPage } from '../pages/acesso/ui/index.jsx'
import { moduleRoutes } from './router/module-routes.js'
import './styles.css'

function matchRoute(path) {
  const exact = moduleRoutes.find((route) => route.path === path)
  if (exact) return { ...exact, params: {} }

  const pathSegments = path.split('/')
  const withParams = moduleRoutes.find((route) => {
    const routeSegments = route.path.split('/')
    return routeSegments.length === pathSegments.length
      && routeSegments.every((segment, index) => (
        segment.startsWith(':')
          ? pathSegments[index] !== ''
          : segment === pathSegments[index]
      ))
  })

  if (!withParams) return { ...moduleRoutes[0], params: {} }

  const params = {}
  withParams.path.split('/').forEach((segment, index) => {
    if (segment.startsWith(':')) {
      params[segment.slice(1)] = decodeURIComponent(pathSegments[index])
    }
  })

  return { ...withParams, params }
}

function getCurrentRoute() {
  const path = window.location.hash.replace(/^#/, '') || '/dashboard'
  return matchRoute(path)
}

export default function App() {
  const [route, setRoute] = useState(getCurrentRoute)

  useEffect(() => {
    const updateRoute = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', updateRoute)

    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  const Page = route.path === '/acesso' ? AccessPage : route.component
  const currentLabel = route.path === '/configuracao' ? 'Configurações' : route.label

  return (
    <div className="app-shell">
      <Sidebar currentPath={route.path.startsWith('/produtos/') ? '/produtos' : route.path} />
      <MainLayout currentLabel={currentLabel}>
        <Page params={route.params} />
      </MainLayout>
    </div>
  )
}
