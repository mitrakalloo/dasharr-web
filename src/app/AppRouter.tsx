import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { MobileShell } from '@/components/layout/MobileShell'
import { OverviewPage } from '@/features/overview/OverviewPage'
import { QueuePage } from '@/features/queue/QueuePage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { SearchPage } from '@/features/search/SearchPage'
import { SeerrRequestsPage } from '@/features/seerr/SeerrRequestsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { TitleDetailPage } from '@/features/title/TitleDetailPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MobileShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="requests" element={<SeerrRequestsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="title/:id" element={<TitleDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
