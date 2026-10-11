import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import Home from '@/pages/Home'

const Members = lazy(() => import('@/pages/Members'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Events = lazy(() => import('@/pages/Events'))
const Applicants = lazy(() => import('@/pages/Applicants'))

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="members" element={<Members />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="events" element={<Events />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
