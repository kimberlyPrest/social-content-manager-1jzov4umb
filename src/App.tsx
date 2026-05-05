import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { Toaster } from '@/components/ui/toaster'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import Layout from './components/Layout'

import Login from './pages/Login'
import Index from './pages/Index'
import Posts from './pages/Posts'
import CreatePost from './pages/CreatePost'
import ABTests from './pages/ABTests'
import Reports from './pages/Reports'
import Monitor from './pages/Monitor'
import NotFound from './pages/NotFound'
import { Navigate } from 'react-router-dom'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/posts" element={<Posts />} />
              <Route path="/posts/new" element={<CreatePost />} />
              <Route path="/posts/:id/edit" element={<CreatePost />} />
              <Route path="/ab-tests" element={<ABTests />} />
              <Route path="/monitor" element={<Monitor />} />
              <Route path="/reports" element={<Reports />} />
              <Route
                path="/team"
                element={
                  <div className="p-8 text-center text-muted-foreground">Equipe em breve...</div>
                }
              />
              <Route
                path="/settings"
                element={
                  <div className="p-8 text-center text-muted-foreground">
                    Configurações em breve...
                  </div>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
