import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import pb from '@/lib/pocketbase/client'
import { useAuth } from '@/hooks/use-auth'

export interface Company {
  id: string
  nome: string
  tipo: 'principal' | 'secundaria'
  instagram_business_id?: string
  organizacao_id?: string
}

interface EmpresaContextType {
  activeEmpresa: Company | null
  activeEmpresaId: string
  empresasAcessiveis: Company[]
  setActiveEmpresa: (id: string) => void
  isPrimary: boolean
  reloadEmpresas: () => Promise<void>
}

const EmpresaContext = createContext<EmpresaContextType>({
  activeEmpresa: null,
  activeEmpresaId: '',
  empresasAcessiveis: [],
  setActiveEmpresa: () => {},
  isPrimary: true,
  reloadEmpresas: async () => {},
})

export const useEmpresaContext = () => useContext(EmpresaContext)

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [empresasAcessiveis, setEmpresasAcessiveis] = useState<Company[]>([])
  const [activeEmpresaId, setActiveEmpresaIdState] = useState<string>('')

  const storageKey = user ? `activeEmpresaId_${user.id}` : null

  const loadEmpresas = useCallback(async () => {
    if (!user) return
    try {
      const all = await pb.collection('companies').getFullList<Company>({ sort: 'nome' })
      const acessoIds: string[] = Array.isArray(user.empresas_acesso) ? user.empresas_acesso : []
      const visibles = all.filter(
        (c) => c.id === user.empresa_id || acessoIds.includes(c.id),
      )
      setEmpresasAcessiveis(visibles)

      const stored = storageKey ? localStorage.getItem(storageKey) : null
      const isValid = stored && visibles.some((c) => c.id === stored)
      setActiveEmpresaIdState(isValid ? stored! : user.empresa_id)
    } catch {
      setActiveEmpresaIdState(user?.empresa_id ?? '')
    }
  }, [user?.id])

  useEffect(() => {
    loadEmpresas()
  }, [loadEmpresas])

  const setActiveEmpresa = useCallback(
    (id: string) => {
      setActiveEmpresaIdState(id)
      if (storageKey) localStorage.setItem(storageKey, id)
    },
    [storageKey],
  )

  const resolvedId = activeEmpresaId || user?.empresa_id || ''
  const activeEmpresa = empresasAcessiveis.find((c) => c.id === resolvedId) ?? null
  const isPrimary = !activeEmpresa?.tipo || activeEmpresa.tipo === 'principal'

  return (
    <EmpresaContext.Provider
      value={{
        activeEmpresa,
        activeEmpresaId: resolvedId,
        empresasAcessiveis,
        setActiveEmpresa,
        isPrimary,
        reloadEmpresas: loadEmpresas,
      }}
    >
      {children}
    </EmpresaContext.Provider>
  )
}
