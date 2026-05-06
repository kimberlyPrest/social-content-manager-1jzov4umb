import pb from '@/lib/pocketbase/client'

export const getBackups = (page = 1) =>
  pb.collection('backups').getList(page, 10, { sort: '-created' })

export const deleteBackup = (id: string) => pb.collection('backups').delete(id)

export const exportData = (payload: any) =>
  pb.send('/backend/v1/backups/export', { method: 'POST', body: payload })

export const getConfiguracaoBackup = async (empresaId: string) => {
  try {
    const records = await pb.collection('configuracao_backup').getFullList({
      filter: `empresa_id = "${empresaId}"`,
    })
    return records[0]
  } catch (err) {
    return null
  }
}

export const saveConfiguracaoBackup = async (id: string | null, payload: any) => {
  if (id) {
    return pb.collection('configuracao_backup').update(id, payload)
  } else {
    return pb.collection('configuracao_backup').create(payload)
  }
}
