import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Home from './pages/Home'
import GameOverview from './pages/GameOverview'
import RosterDetail from './pages/RosterDetail'
import Leaderboard from './pages/Leaderboard'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/:gameId" element={<GameOverview />} />
        <Route path="/:gameId/roster/:playerId" element={<RosterDetail />} />
      </Route>
    </Routes>
  )
}
