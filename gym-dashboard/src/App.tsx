import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components'

const Overview = lazy(() => import('./pages/Overview').then((module) => ({ default: module.Overview })))
const Training = lazy(() => import('./pages/Training').then((module) => ({ default: module.Training })))
const Progress = lazy(() => import('./pages/Progress').then((module) => ({ default: module.Progress })))
const Recovery = lazy(() => import('./pages/Recovery').then((module) => ({ default: module.Recovery })))
const Nutrition = lazy(() => import('./pages/Nutrition').then((module) => ({ default: module.Nutrition })))
const Coaching = lazy(() => import('./pages/Coaching').then((module) => ({ default: module.Coaching })))
const Evidence = lazy(() => import('./pages/Evidence').then((module) => ({ default: module.Evidence })))
const Archive = lazy(() => import('./pages/Archive').then((module) => ({ default: module.Archive })))
const Verification = lazy(() => import('./pages/Verification').then((module) => ({ default: module.Verification })))
const Sources = lazy(() => import('./pages/Sources').then((module) => ({ default: module.Sources })))

export default function App() {
  return <Layout><Suspense fallback={<div className="route-loading" role="status">Loading training record…</div>}><Routes>
    <Route path="/" element={<Overview/>}/>
    <Route path="/training" element={<Training/>}/>
    <Route path="/progress" element={<Progress/>}/>
    <Route path="/recovery" element={<Recovery/>}/>
    <Route path="/nutrition" element={<Nutrition/>}/>
    <Route path="/coaching" element={<Coaching/>}/>
    <Route path="/evidence" element={<Evidence/>}/>
    <Route path="/archive" element={<Archive/>}/>
    <Route path="/verify" element={<Verification/>}/>
    <Route path="/sources" element={<Sources/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></Suspense></Layout>
}
