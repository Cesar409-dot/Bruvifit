import { useEffect, useState } from 'react'
import { MainLayout } from '../widgets/main-layout/index.jsx'
import { Sidebar } from '../widgets/sidebar/index.jsx'
import { AccessPage } from '../pages/acesso/ui/index.jsx'
import { moduleRoutes } from './router/module-routes.js'
import './styles.css'

function getCurrentRoute() {
  const path = window.location.hash.replace(/^#/, '') || '/dashboard'
  return moduleRoutes.find((route) => route.path === path) ?? moduleRoutes[0]
}

export default function App() {
  const [route, setRoute] = useState(getCurrentRoute)

  useEffect(() => {
    const updateRoute = () => setRoute(getCurrentRoute())
    window.addEventListener('hashchange', updateRoute)

    return () => window.removeEventListener('hashchange', updateRoute)
  }, [])

  if (route.path === '/acesso') {
    return <AccessPage />
  }

  const Page = route.component

  return (
    <>
      <Sidebar currentPath={route.path} />
      <MainLayout>
        <Page />
      </MainLayout>
    </>
  )
}
