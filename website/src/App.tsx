import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Docs from './pages/Docs'
import Examples from './pages/Examples'
import Health from './pages/Health'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/docs" element={<Docs />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/health" element={<Health />} />
      </Routes>
    </HashRouter>
  )
}
