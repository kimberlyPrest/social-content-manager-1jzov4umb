import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Heart, MessageCircle, Share2, MoreHorizontal, ThumbsUp, Send } from 'lucide-react'

const LIMITS: Record<string, number> = {
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
}

interface PostPreviewProps {
  titulo: string
  conteudo: string
  redes: string[]
  images: string[]
  authorName: string
  authorAvatar?: string
}

export function PostPreview({
  conteudo,
  redes,
  images,
  authorName,
  authorAvatar,
}: PostPreviewProps) {
  const imageUrl = images[0] || 'https://img.usecurling.com/p/600/400?q=placeholder&color=purple'

  if (redes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed rounded-xl bg-muted/20 text-muted-foreground p-8 text-center">
        <div className="bg-primary/10 p-4 rounded-full mb-4">
          <Share2 className="h-8 w-8 text-primary" />
        </div>
        <p className="font-medium text-lg mb-2">Sem preview disponível</p>
        <p className="text-sm">
          Selecione pelo menos uma rede social para visualizar como seu post ficará.
        </p>
      </div>
    )
  }

  const renderContent = (network: string) => {
    const limit = LIMITS[network]
    const isOverLimit = conteudo.length > limit

    return (
      <div className="space-y-4 animate-fade-in">
        {isOverLimit && (
          <div className="text-sm font-medium text-destructive bg-destructive/10 p-3 rounded-md border border-destructive/20">
            Conteúdo muito longo para {network}. Reduza para {limit} caracteres. (Atual:{' '}
            {conteudo.length})
          </div>
        )}

        <div className="flex justify-center bg-muted/30 rounded-xl p-4 sm:p-8 min-h-[500px] items-center border">
          {network === 'facebook' && (
            <Card className="w-full max-w-[420px] border shadow-md overflow-hidden rounded-xl bg-card">
              <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Avatar className="h-10 w-10 border">
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback>{authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold leading-tight">{authorName}</p>
                  <p className="text-xs text-muted-foreground">Agora mesmo • 🌍</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                {conteudo && (
                  <p className="px-4 pb-3 text-[15px] whitespace-pre-wrap">{conteudo}</p>
                )}
                <img src={imageUrl} alt="preview" className="w-full object-cover max-h-[500px]" />
                <div className="px-4 py-2 border-t flex justify-between text-muted-foreground">
                  <div className="flex flex-1 items-center justify-center gap-2 py-2 hover:bg-muted/50 rounded-md cursor-pointer">
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm font-medium">Curtir</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-2 py-2 hover:bg-muted/50 rounded-md cursor-pointer">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Comentar</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-2 py-2 hover:bg-muted/50 rounded-md cursor-pointer">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Compartilhar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {network === 'instagram' && (
            <Card className="w-full max-w-[400px] border shadow-md overflow-hidden rounded-xl bg-card">
              <CardHeader className="p-3 flex flex-row items-center gap-3 border-b">
                <Avatar className="h-8 w-8 border">
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback>{authorName[0]}</AvatarFallback>
                </Avatar>
                <p className="text-[14px] font-semibold flex-1">{authorName}</p>
                <MoreHorizontal className="h-5 w-5" />
              </CardHeader>
              <CardContent className="p-0">
                <img src={imageUrl} alt="preview" className="w-full aspect-square object-cover" />
                <div className="p-4 space-y-3">
                  <div className="flex gap-4">
                    <Heart className="h-6 w-6 cursor-pointer hover:text-muted-foreground transition-colors" />
                    <MessageCircle className="h-6 w-6 cursor-pointer hover:text-muted-foreground transition-colors" />
                    <Send className="h-6 w-6 cursor-pointer hover:text-muted-foreground transition-colors" />
                  </div>
                  {conteudo && (
                    <p className="text-[14px] whitespace-pre-wrap">
                      <span className="font-semibold mr-2">{authorName}</span>
                      {conteudo}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {network === 'linkedin' && (
            <Card className="w-full max-w-[420px] border shadow-md overflow-hidden rounded-xl bg-card">
              <CardHeader className="p-4 flex flex-row items-center gap-3">
                <Avatar className="h-12 w-12 border">
                  <AvatarImage src={authorAvatar} />
                  <AvatarFallback>{authorName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-[15px] font-semibold leading-tight">{authorName}</p>
                  <p className="text-xs text-muted-foreground">Empresa • 1d</p>
                </div>
                <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="p-0">
                {conteudo && (
                  <p className="px-4 pb-3 text-[14px] whitespace-pre-wrap line-clamp-4">
                    {conteudo}
                  </p>
                )}
                <img src={imageUrl} alt="preview" className="w-full object-cover max-h-[400px]" />
                <div className="px-2 py-1 border-t flex justify-between text-muted-foreground">
                  <div className="flex flex-1 items-center justify-center gap-1 flex-col py-3 hover:bg-muted/50 rounded-md cursor-pointer">
                    <ThumbsUp className="h-5 w-5 mb-1" />
                    <span className="text-[12px] font-medium">Gostei</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-1 flex-col py-3 hover:bg-muted/50 rounded-md cursor-pointer">
                    <MessageCircle className="h-5 w-5 mb-1" />
                    <span className="text-[12px] font-medium">Comentar</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-1 flex-col py-3 hover:bg-muted/50 rounded-md cursor-pointer">
                    <Share2 className="h-5 w-5 mb-1" />
                    <span className="text-[12px] font-medium">Compartilhar</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-1 flex-col py-3 hover:bg-muted/50 rounded-md cursor-pointer">
                    <Send className="h-5 w-5 mb-1" />
                    <span className="text-[12px] font-medium">Enviar</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {network === 'tiktok' && (
            <div className="w-full max-w-[320px] bg-black text-white rounded-3xl overflow-hidden relative aspect-[9/16] shadow-xl border border-border">
              <img src={imageUrl} alt="preview" className="w-full h-full object-cover opacity-90" />
              <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
                <div className="flex flex-col items-center cursor-pointer">
                  <Heart className="h-8 w-8 text-white fill-white" />
                  <span className="text-xs mt-1 font-medium shadow-sm">12K</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer">
                  <MessageCircle className="h-8 w-8 text-white fill-white" />
                  <span className="text-xs mt-1 font-medium shadow-sm">456</span>
                </div>
                <div className="flex flex-col items-center cursor-pointer">
                  <Share2 className="h-8 w-8 text-white" />
                  <span className="text-xs mt-1 font-medium shadow-sm">Share</span>
                </div>
              </div>
              <div className="absolute bottom-6 left-4 right-20">
                <p className="font-semibold text-[15px] mb-2 drop-shadow-md">@{authorName}</p>
                {conteudo && <p className="text-[14px] line-clamp-3 drop-shadow-md">{conteudo}</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="sticky top-6">
      <div className="bg-card border rounded-xl p-4 sm:p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Share2 className="h-5 w-5 text-primary" /> Preview do Post
        </h3>
        <Tabs defaultValue={redes[0]} className="w-full">
          <TabsList className="w-full justify-start h-auto flex-wrap p-1 mb-6 bg-muted/50">
            {redes.map((r) => (
              <TabsTrigger
                key={r}
                value={r}
                className="capitalize flex-1 min-w-[80px] sm:min-w-[100px]"
              >
                {r}
              </TabsTrigger>
            ))}
          </TabsList>
          {redes.map((r) => (
            <TabsContent
              key={r}
              value={r}
              className="mt-0 focus-visible:outline-none focus-visible:ring-0"
            >
              {renderContent(r)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
