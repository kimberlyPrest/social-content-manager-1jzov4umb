import pb from '@/lib/pocketbase/client'

export interface MensagemPronta {
  id: string
  empresa_id: string
  texto: string
  created: string
  updated: string
}

export const getMensagensProntas = async () => {
  return pb.collection('mensagens_prontas').getFullList<MensagemPronta>({
    sort: '-created',
  })
}

export const createMensagemPronta = async (data: { empresa_id: string; texto: string }) => {
  return pb.collection('mensagens_prontas').create<MensagemPronta>(data)
}

export const updateMensagemPronta = async (id: string, data: { texto: string }) => {
  return pb.collection('mensagens_prontas').update<MensagemPronta>(id, data)
}

export const deleteMensagemPronta = async (id: string) => {
  return pb.collection('mensagens_prontas').delete(id)
}
