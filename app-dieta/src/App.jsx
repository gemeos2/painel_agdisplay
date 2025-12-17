import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MobileLayout from './layouts/MobileLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminHome from './pages/admin/AdminHome'
import AdminClients from './pages/admin/AdminClients'
import AdminClientDetails from './pages/admin/AdminClientDetails'
import AdminProfile from './pages/admin/AdminProfile'
import Chat from './pages/app/Chat'
import Notifications from './pages/app/Notifications'
import { ChatProvider } from './contexts/ChatContext'
import { ThemeProvider } from './contexts/ThemeContext'

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminHome />} />
            <Route path="clients" element={<AdminClients />} />
            <Route path="clients/:id" element={<AdminClientDetails />} />
            <Route path="profile" element={<AdminProfile />} />
          </Route>

          {/* App Routes */}
          <Route path="/app" element={
            <ChatProvider>
              <MobileLayout />
            </ChatProvider>
          }>
            <Route index element={<Home />} />
            <Route path="history" element={<div className="p-6">Histórico em breve</div>} />
            <Route path="chat" element={<Chat />} />
            <Route path="profile" element={<Profile />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
