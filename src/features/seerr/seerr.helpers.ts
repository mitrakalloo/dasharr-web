import type { DemoSeerrRequest } from '@/data/demoDashboard'

export function seerrStatusColor(status: DemoSeerrRequest['status']): string {
  switch (status) {
    case 'pending':
      return '#F59E0B'
    case 'approved':
      return '#34D399'
    case 'declined':
      return '#F43F5E'
  }
}

export function seerrStatusLabel(status: DemoSeerrRequest['status']): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'approved':
      return 'Approved'
    case 'declined':
      return 'Declined'
  }
}
