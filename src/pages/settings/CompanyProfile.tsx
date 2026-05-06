import { useState, useEffect, useRef } from 'react'
import { getCompany, updateCompany } from '@/services/companies'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import pb from '@/lib/pocketbase/client'

export default function CompanyProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [endereco, setEndereco] = useState('')
  const [logoUrl, setLogoUrl] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    const loadCompany = async () => {
      try {
        if (!user?.empresa_id) return
        const data = await getCompany(user.empresa_id)
        setNome(data.nome || '')
        setEmail(data.email_contato || '')
        setTelefone(data.telefone || '')
        setEndereco(data.endereco || '')
        if (data.logo_url) {
          setLogoUrl(pb.files.getUrl(data, data.logo_url))
        }
      } catch (err) {
        toast.error('Erro ao carregar configurações')
      } finally {
        setLoading(false)
      }
    }
    loadCompany()
  }, [user])

  const handleSave = async () => {
    if (!user?.empresa_id) return
    setSaving(true)
    try {
      const data: any = { nome, email_contato: email, telefone, endereco }
      if (selectedFile) data.logo_url = selectedFile

      await updateCompany(user.empresa_id, data)
      toast.success('Configurações salvas com sucesso!')
      setSelectedFile(null)
    } catch (err) {
      toast.error('Erro ao salvar alterações')
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Perfil da Empresa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 overflow-hidden border">
            {selectedFile || logoUrl ? (
              <img
                src={selectedFile ? URL.createObjectURL(selectedFile) : logoUrl}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                Sem Logo
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            Alterar Logo
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) setSelectedFile(e.target.files[0])
            }}
          />
        </div>

        <div className="space-y-2">
          <Label>Nome da empresa</Label>
          <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Email de contato</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Endereço</Label>
          <Textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={3} />
        </div>

        <Button onClick={handleSave} disabled={saving || !nome}>
          {saving ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </CardContent>
    </Card>
  )
}
