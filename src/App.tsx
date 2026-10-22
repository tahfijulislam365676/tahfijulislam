import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { DataProvider } from './lib/DataContext'
import { LangProvider } from './lib/i18n'
import Home from './pages/Home'
import Login from './dashboard/Login'
import DashboardLayout from './dashboard/Layout'
import { AboutPage, ExperiencePage, MessagesPage, Overview, PasswordPage, ProfilePage, ProjectsPage, ResumePage, ServicesPage, SkillsPage, UsersPage } from './dashboard/Pages'

export default function App() {
  return (
    <BrowserRouter>
      <LangProvider>
      <DataProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin/login" element={<Login />} />
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<Overview />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="experience" element={<ExperiencePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="resume" element={<ResumePage />} />
              <Route path="messages" element={<MessagesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="password" element={<PasswordPage />} />
            </Route>
            <Route path="*" element={<Home />} />
          </Routes>
        </AuthProvider>
      </DataProvider>
      </LangProvider>
    </BrowserRouter>
  )
}
