import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { AppShell } from '@/components/layout/AppShell'
import { ActivityPage } from '@/features/activity/ActivityPage'
import { CalendarPage } from '@/features/calendar/CalendarPage'
import { EditHomePage } from '@/features/home/EditHomePage'
import { HistoryPage } from '@/features/library/HistoryPage'
import { LibraryPage } from '@/features/library/LibraryPage'
import { ManualImportPage } from '@/features/library/ManualImportPage'
import { ServiceHubPage } from '@/features/library/ServiceHubPage'
import { WantedPage } from '@/features/library/WantedPage'
import { MorePage } from '@/features/more/MorePage'
import { OverviewPage } from '@/features/overview/OverviewPage'
import { ProwlarrBrowsePage } from '@/features/prowlarr/ProwlarrBrowsePage'
import { QueuePage } from '@/features/queue/QueuePage'
import { DiscoverBrowsePage } from '@/features/search/DiscoverBrowsePage'
import { SearchPage } from '@/features/search/SearchPage'
import { SeerrRequestsPage } from '@/features/seerr/SeerrRequestsPage'
import { SettingsPage } from '@/features/settings/SettingsPage'
import { StoragePage } from '@/features/storage/StoragePage'
import { SubtitlesPage } from '@/features/subtitles/SubtitlesPage'
import { TitleDetailPage } from '@/features/title/TitleDetailPage'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<OverviewPage />} />
          <Route path="edit-home" element={<EditHomePage />} />
          <Route path="queue" element={<QueuePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="discover" element={<DiscoverBrowsePage />} />
          <Route path="manual-import" element={<ManualImportPage />} />
          <Route path="service/:id" element={<ServiceHubPage />} />
          <Route path="more" element={<MorePage />} />
          <Route path="requests" element={<SeerrRequestsPage />} />
          <Route path="indexers" element={<ProwlarrBrowsePage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="wanted" element={<WantedPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="subtitles" element={<SubtitlesPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="storage" element={<StoragePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="title/:id" element={<TitleDetailPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
