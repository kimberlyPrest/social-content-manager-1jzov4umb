import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Heart,
  MessageCircle,
  Share2,
  Send,
  Bookmark,
  ThumbsUp,
  Repeat2,
  Music,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialPreviewsProps {
  networks: string[]
  content: string
  title?: string
  images: string[]
  companyName: string
}

const LIMITS: Record<string, number> = {
  facebook: 63206,
  instagram: 2200,
  linkedin: 3000,
  tiktok: 2200,
}

export function SocialPreviews({
  networks,
  content,
  title,
  images,
  companyName,
}: SocialPreviewsProps) {
  if (!networks || networks.length === 0) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-center text-muted-foreground">
        Selecione uma rede social para ver o preview.
      </div>
    )
  }

  const defaultTab = networks.includes('instagram') ? 'instagram' : networks[0]

  return (
    <Tabs defaultValue={defaultTab} className="w-full flex flex-col h-full">
      <TabsList className="grid w-full grid-cols-4 mb-4">
        <TabsTrigger value="facebook" disabled={!networks.includes('facebook')}>
          Facebook
        </TabsTrigger>
        <TabsTrigger value="instagram" disabled={!networks.includes('instagram')}>
          Instagram
        </TabsTrigger>
        <TabsTrigger value="linkedin" disabled={!networks.includes('linkedin')}>
          LinkedIn
        </TabsTrigger>
        <TabsTrigger value="tiktok" disabled={!networks.includes('tiktok')}>
          TikTok
        </TabsTrigger>
      </TabsList>

      {networks.map((network) => {
        const limit = LIMITS[network]
        const isOverLimit = content.length > limit

        return (
          <TabsContent key={network} value={network} className="flex-1 m-0">
            {isOverLimit && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Conteúdo muito longo para {network}. Reduza para {limit} caracteres. (Atual:{' '}
                  {content.length})
                </AlertDescription>
              </Alert>
            )}

            <div
              className={cn(
                'rounded-xl border bg-muted/30 overflow-hidden mx-auto shadow-sm',
                network === 'tiktok'
                  ? 'max-w-[320px] aspect-[9/16] bg-black text-white relative'
                  : 'max-w-md bg-[#f0f2f5] p-4',
              )}
            >
              {/* Facebook Preview */}
              {network === 'facebook' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="p-3 flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                    <div>
                      <p className="font-semibold text-sm leading-tight">{companyName}</p>
                      <p className="text-xs text-muted-foreground">Agora mesmo • 🌎</p>
                    </div>
                  </div>
                  <div className="px-3 pb-2 text-sm whitespace-pre-wrap">
                    {content || 'Seu texto aparecerá aqui...'}
                  </div>
                  {images.length > 0 && (
                    <img src={images[0]} alt="preview" className="w-full object-cover max-h-80" />
                  )}
                  <div className="flex items-center justify-between px-4 py-2 border-t mt-1 text-muted-foreground">
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <ThumbsUp className="w-4 h-4" /> Curtir
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <MessageCircle className="w-4 h-4" /> Comentar
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Share2 className="w-4 h-4" /> Compartilhar
                    </div>
                  </div>
                </div>
              )}

              {/* Instagram Preview */}
              {network === 'instagram' && (
                <div className="bg-white rounded-md border shadow-sm overflow-hidden">
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-0.5">
                        <div className="w-full h-full bg-white rounded-full border border-white" />
                      </div>
                      <p className="font-semibold text-sm">{companyName}</p>
                    </div>
                  </div>
                  <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
                    {images.length > 0 ? (
                      <img src={images[0]} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-slate-400">Imagem</div>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex gap-4">
                        <Heart className="w-6 h-6" />
                        <MessageCircle className="w-6 h-6" />
                        <Send className="w-6 h-6" />
                      </div>
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold mr-1">{companyName}</span>
                      <span className="whitespace-pre-wrap">{content || 'Legenda...'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Preview */}
              {network === 'linkedin' && (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-none bg-slate-200" />
                    <div>
                      <p className="font-semibold text-sm">{companyName}</p>
                      <p className="text-xs text-muted-foreground">Empresa • Cosméticos</p>
                      <p className="text-xs text-muted-foreground">Agora • 🌎</p>
                    </div>
                  </div>
                  <div className="px-4 pb-2 text-sm whitespace-pre-wrap">
                    {content || 'Seu texto aparecerá aqui...'}
                  </div>
                  {images.length > 0 && (
                    <img src={images[0]} alt="preview" className="w-full object-cover max-h-80" />
                  )}
                  <div className="flex items-center justify-between px-4 py-3 border-t mt-1 text-muted-foreground">
                    <div className="flex flex-col items-center gap-1 text-xs font-semibold">
                      <ThumbsUp className="w-5 h-5" /> Gostei
                    </div>
                    <div className="flex flex-col items-center gap-1 text-xs font-semibold">
                      <MessageCircle className="w-5 h-5" /> Comentar
                    </div>
                    <div className="flex flex-col items-center gap-1 text-xs font-semibold">
                      <Repeat2 className="w-5 h-5" /> Repostar
                    </div>
                    <div className="flex flex-col items-center gap-1 text-xs font-semibold">
                      <Send className="w-5 h-5" /> Enviar
                    </div>
                  </div>
                </div>
              )}

              {/* TikTok Preview */}
              {network === 'tiktok' && (
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  {images.length > 0 && (
                    <img
                      src={images[0]}
                      alt="preview"
                      className="absolute inset-0 w-full h-full object-cover opacity-60"
                    />
                  )}
                  <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
                    <div className="w-12 h-12 rounded-full bg-slate-200 border-2 border-white" />
                    <div className="flex flex-col items-center gap-1">
                      <Heart className="w-8 h-8 text-white fill-white" />
                      <span className="text-xs font-semibold">1.2K</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <MessageCircle className="w-8 h-8 text-white fill-white" />
                      <span className="text-xs font-semibold">123</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Bookmark className="w-8 h-8 text-white fill-white" />
                      <span className="text-xs font-semibold">45</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <Share2 className="w-8 h-8 text-white fill-white" />
                      <span className="text-xs font-semibold">89</span>
                    </div>
                  </div>
                  <div className="relative z-10 w-[80%]">
                    <p className="font-semibold text-sm mb-1">
                      @{companyName.toLowerCase().replace(/\s/g, '')}
                    </p>
                    <p className="text-sm line-clamp-3 text-white/90 whitespace-pre-wrap">
                      {content || 'Sua descrição aparecerá aqui...'}
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-sm font-medium">
                      <Music className="w-4 h-4" /> Som original - {companyName}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
