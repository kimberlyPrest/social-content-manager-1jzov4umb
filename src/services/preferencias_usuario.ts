import pb from '@/lib/pocketbase/client'

export const getPreferenciasUsuario = async () => {
  const user = pb.authStore.record
  if (!user) return []
  return pb.collection('preferencias_usuario').getFullList({
    filter: `usuario_id = "${user.id}"`,
  })
}

export const savePreferenciaUsuario = async (tipo: string, valor: string) => {
  const user = pb.authStore.record
  if (!user) throw new Error('Not authenticated')

  const existing = await pb.collection('preferencias_usuario').getFullList({
    filter: `usuario_id = "${user.id}" && tipo = "${tipo}"`,
  })

  if (existing.length > 0) {
    return pb.collection('preferencias_usuario').update(existing[0].id, { valor })
  }

  return pb.collection('preferencias_usuario').create({
    usuario_id: user.id,
    tipo,
    valor,
  })
}
