import { z } from 'zod'

export const postSchema = z
  .object({
    titulo: z.string().max(100, 'Máximo de 100 caracteres').optional(),
    conteudo: z.string().min(1, 'Conteúdo é obrigatório').max(5000, 'Máximo de 5000 caracteres'),
    redes_sociais: z.array(z.string()).min(1, 'Selecione pelo menos uma rede social'),
    agendamento_tipo: z.enum(['agora', 'depois']),
    agendado_para: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.agendamento_tipo === 'depois') {
        if (!data.agendado_para) return false
        const date = new Date(data.agendado_para)
        if (date < new Date()) return false
      }
      return true
    },
    {
      message: 'Data e hora devem ser no futuro',
      path: ['agendado_para'],
    },
  )

export type PostFormValues = z.infer<typeof postSchema>
