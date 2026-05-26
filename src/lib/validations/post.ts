import { z } from 'zod'

export const postSchema = z
  .object({
    titulo: z.string().min(1, 'Título é obrigatório').max(100, 'Máximo de 100 caracteres'),
    conteudo: z.string().max(5000, 'Máximo de 5000 caracteres').optional(),
    redes_sociais: z.array(z.string()).optional(),
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
