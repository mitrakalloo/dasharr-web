import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { parseLiveTitleId } from '@/lib/liveTitleId'
import { deleteArrLibraryItem, refreshArrItem } from '@/lib/services/arr.commands'
import { useConfigStore } from '@/stores/configStore'

export function useTitleManage(titleId: string) {
  const navigate = useNavigate()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const parsed = parseLiveTitleId(titleId)
  const service = parsed
    ? services.find((entry) => entry.enabled && entry.type === parsed.service)
    : undefined

  const canManage = Boolean(parsed && service)

  const refreshMetadata = useCallback(async () => {
    if (!parsed || !service) {
      toast.message('Refresh isn’t available for this title')
      return false
    }
    try {
      await refreshArrItem(settings, service, parsed.numericId)
      toast.success('Refresh queued')
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Refresh failed')
      return false
    }
  }, [parsed, service, settings])

  const deleteFromLibrary = useCallback(
    async (deleteFiles: boolean) => {
      if (!parsed || !service) {
        toast.message('Delete isn’t available for this title')
        return false
      }
      try {
        await deleteArrLibraryItem(settings, service, parsed.numericId, deleteFiles)
        toast.success(deleteFiles ? 'Deleted with files' : 'Removed from library')
        navigate(-1)
        return true
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Delete failed')
        return false
      }
    },
    [navigate, parsed, service, settings],
  )

  return { canManage, refreshMetadata, deleteFromLibrary }
}
