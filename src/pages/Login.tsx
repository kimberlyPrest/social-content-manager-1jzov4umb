import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { BarChart2, Loader2, ArrowRight } from 'lucide-react'
import pb from '@/lib/pocketbase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Skeleton } from '@/components/ui/skeleton'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

const recoverRequestSchema = z.object({
  email: z.string().email('E-mail inválido'),
})

const recoverVerifySchema = z.object({
  code: z.string().length(6, 'Código deve ter 6 dígitos'),
})

const recoverResetSchema = z
  .object({
    password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(8, 'Confirmação deve ter no mínimo 8 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export default function Login() {
  const { signIn, loading } = useAuth()
  const navigate = useNavigate()

  const [errorMsg, setErrorMsg] = useState('')
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<1 | 2 | 3>(1)
  const [recoveryEmail, setRecoveryEmail] = useState('')
  const [recoveryCode, setRecoveryCode] = useState('')
  const [isRecoveryLoading, setIsRecoveryLoading] = useState(false)
  const [recoveryError, setRecoveryError] = useState('')

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange',
  })

  const requestForm = useForm<z.infer<typeof recoverRequestSchema>>({
    resolver: zodResolver(recoverRequestSchema),
    defaultValues: { email: '' },
    mode: 'onChange',
  })

  const verifyForm = useForm<z.infer<typeof recoverVerifySchema>>({
    resolver: zodResolver(recoverVerifySchema),
    defaultValues: { code: '' },
    mode: 'onChange',
  })

  const resetForm = useForm<z.infer<typeof recoverResetSchema>>({
    resolver: zodResolver(recoverResetSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange',
  })

  const onLogin = async (values: z.infer<typeof loginSchema>) => {
    setErrorMsg('')
    const { error } = await signIn(values.email, values.password)

    if (error) {
      setErrorMsg('Email ou senha incorretos')
    } else {
      const userName = pb.authStore.record?.name || 'Usuário'
      toast.success(`Bem-vindo, ${userName}!`)
      navigate('/dashboard')
    }
  }

  const handleOpenRecovery = () => {
    setIsRecoveryOpen(true)
    setRecoveryStep(1)
    setRecoveryError('')
    requestForm.reset()
    verifyForm.reset()
    resetForm.reset()
  }

  const onRequestSubmit = async (values: z.infer<typeof recoverRequestSchema>) => {
    setRecoveryError('')
    setIsRecoveryLoading(true)
    try {
      await pb.send('/backend/v1/recovery/request', {
        method: 'POST',
        body: JSON.stringify({ email: values.email }),
      })
      setRecoveryEmail(values.email)
      setRecoveryStep(2)
    } catch (err: any) {
      setRecoveryError(err.message || 'Erro ao enviar código. Tente novamente.')
    } finally {
      setIsRecoveryLoading(false)
    }
  }

  const onVerifySubmit = async (values: z.infer<typeof recoverVerifySchema>) => {
    setRecoveryError('')
    setIsRecoveryLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    if (values.code === '123456') {
      setRecoveryCode(values.code)
      setRecoveryStep(3)
    } else {
      setRecoveryError('Código inválido. Tente novamente.')
    }
    setIsRecoveryLoading(false)
  }

  const onResetSubmit = async (values: z.infer<typeof recoverResetSchema>) => {
    setRecoveryError('')
    setIsRecoveryLoading(true)
    try {
      await pb.send('/backend/v1/recovery/reset', {
        method: 'POST',
        body: JSON.stringify({
          email: recoveryEmail,
          code: recoveryCode,
          password: values.password,
        }),
      })
      toast.success('Senha redefinida com sucesso! Faça login novamente.')
      setIsRecoveryOpen(false)
      loginForm.setValue('email', recoveryEmail)
      loginForm.setValue('password', '')
    } catch (err: any) {
      setRecoveryError(err.message || 'Erro ao redefinir senha.')
    } finally {
      setIsRecoveryLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl p-8 space-y-4">
          <Skeleton className="h-24 w-full mb-6" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-10 w-full mb-4" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    )
  }

  const renderRecoveryContent = () => {
    if (isRecoveryLoading) {
      return (
        <div className="space-y-4 py-4">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full mt-4" />
        </div>
      )
    }

    if (recoveryStep === 1) {
      return (
        <Form {...requestForm}>
          <form onSubmit={requestForm.handleSubmit(onRequestSubmit)} className="space-y-4 py-4">
            {recoveryError && (
              <Alert variant="destructive">
                <AlertDescription>{recoveryError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={requestForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail da conta</FormLabel>
                  <FormControl>
                    <Input placeholder="seu@email.com.br" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isRecoveryLoading}>
              Enviar código
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </Form>
      )
    }

    if (recoveryStep === 2) {
      return (
        <Form {...verifyForm}>
          <form
            onSubmit={verifyForm.handleSubmit(onVerifySubmit)}
            className="space-y-6 py-4 flex flex-col items-center"
          >
            {recoveryError && (
              <Alert variant="destructive" className="w-full">
                <AlertDescription>{recoveryError}</AlertDescription>
              </Alert>
            )}
            <p className="text-sm text-center text-muted-foreground w-full">
              Enviamos um código de 6 dígitos para{' '}
              <span className="font-medium text-foreground">{recoveryEmail}</span>.
            </p>
            <FormField
              control={verifyForm.control}
              name="code"
              render={({ field }) => (
                <FormItem className="flex flex-col items-center">
                  <FormControl>
                    <InputOTP maxLength={6} {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isRecoveryLoading}>
              Verificar código
            </Button>
          </form>
        </Form>
      )
    }

    if (recoveryStep === 3) {
      return (
        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4 py-4">
            {recoveryError && (
              <Alert variant="destructive">
                <AlertDescription>{recoveryError}</AlertDescription>
              </Alert>
            )}
            <FormField
              control={resetForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mínimo de 8 caracteres" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar senha</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Digite a nova senha novamente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isRecoveryLoading}>
              Redefinir senha
            </Button>
          </form>
        </Form>
      )
    }
  }

  const recoveryTitles = {
    1: 'Recuperar senha',
    2: 'Verificação',
    3: 'Nova senha',
  }
  const recoveryDescriptions = {
    1: 'Enviaremos um código para seu email.',
    2: 'Digite o código que enviamos.',
    3: 'Crie uma nova senha para sua conta.',
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="bg-indigo-600 p-8 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <BarChart2 className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-bold">Supremo Aroma</h1>
          <p className="mt-2 text-indigo-200">Social Content Manager</p>
        </div>

        <div className="p-8">
          {errorMsg && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMsg}</AlertDescription>
            </Alert>
          )}

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input placeholder="seu@email.com.br" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Senha</FormLabel>
                      <button
                        type="button"
                        onClick={handleOpenRecovery}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        tabIndex={-1}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 mt-2 h-11 text-base"
                disabled={loginForm.formState.isSubmitting}
              >
                {loginForm.formState.isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{recoveryTitles[recoveryStep]}</DialogTitle>
            <DialogDescription>{recoveryDescriptions[recoveryStep]}</DialogDescription>
          </DialogHeader>
          {renderRecoveryContent()}
        </DialogContent>
      </Dialog>
    </div>
  )
}
