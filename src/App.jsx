import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Nav from './components/Nav'
import Footer from './components/Footer'
import Login from './pages/Login'
import MembershipsList from './pages/MembershipsList'
import RegisterUser from './pages/RegisterUser'
import UserDetails from './pages/UserDetails'
import ManagersList from './pages/ManagersList'
import ManagerProfile from './pages/ManagerProfile'
import RegisterManager from './pages/RegisterManager'
import RequireAuth from './components/RequireAuth'
import AppInitializer from './components/AppInitializer' 

function MainApp() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Nav className="flex-shrink-0" />
        <main className="flex-1 flex flex-col">
          <Routes>  
            <Route path="/" element={<Login />} />
            <Route path="/membresias" element={<RequireAuth><MembershipsList /></RequireAuth>} />
            <Route path="/inscribir-usuario" element={<RequireAuth><RegisterUser /></RequireAuth>} />
            <Route path="/detalles-usuario/:userId" element={<RequireAuth><UserDetails /></RequireAuth>} />
            <Route path="/perfil-administrador" element={<RequireAuth><ManagerProfile /></RequireAuth>} />
            <Route
              path="/administradores"
              element={
                <RequireAuth allowedRoles={['Superusuario']}>
                  <ManagersList />
                </RequireAuth>
              }
            />
            <Route path="/agregar-administrador" element={<RequireAuth><RegisterManager /></RequireAuth>} />
          </Routes>
        </main>
        <Footer className="flex-shrink-0" />
      </div>
    </Router>
  )
}

export default function App() {
  return (
    <AppInitializer>
      <MainApp />
    </AppInitializer>
  )
}