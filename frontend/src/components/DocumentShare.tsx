import { useState, useEffect } from 'react'
import { TDescendant } from '@udecode/plate-common'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { DocumentMetadata } from '@/services/documentExportService'
import { 
  Share2, 
  Link, 
  Mail, 
  Copy,
  QrCode,
  Globe,
  Lock,
  Users,
  Calendar,
  Eye,
  Download,
  Settings
} from 'lucide-react'

interface ShareLink {
  id: string
  url: string
  type: 'view' | 'edit' | 'comment'
  expiresAt?: Date
  password?: string
  accessCount: number
  maxAccess?: number
}

interface DocumentShareProps {
  content: TDescendant[]
  metadata: DocumentMetadata
  onClose?: () => void
}

export default function DocumentShare({ 
  content, 
  metadata, 
  onClose 
}: DocumentShareProps) {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedLinkType, setSelectedLinkType] = useState<'view' | 'edit' | 'comment'>('view')
  const [linkSettings, setLinkSettings] = useState({
    requirePassword: false,
    password: '',
    expiresIn: '7d', // 7 days, 30d, never
    maxAccess: 0, // 0 = unlimited
    allowDownload: true
  })
  const { toast } = useToast()

  useEffect(() => {
    loadExistingLinks()
  }, [])

  const loadExistingLinks = async () => {
    try {
      // TODO: 从后端加载现有的分享链接
      const mockLinks: ShareLink[] = [
        {
          id: '1',
          url: `${window.location.origin}/shared/view/abc123`,
          type: 'view',
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          accessCount: 5,
          maxAccess: 100
        }
      ]
      setShareLinks(mockLinks)
    } catch (error) {
      console.error('Failed to load share links:', error)
    }
  }

  const generateShareLink = async () => {
    setIsGenerating(true)
    try {
      // TODO: 调用后端 API 生成分享链接
      const newLink: ShareLink = {
        id: Date.now().toString(),
        url: `${window.location.origin}/shared/${selectedLinkType}/${Math.random().toString(36).substr(2, 9)}`,
        type: selectedLinkType,
        expiresAt: linkSettings.expiresIn === 'never' ? undefined : 
                   new Date(Date.now() + (linkSettings.expiresIn === '7d' ? 7 : 30) * 24 * 60 * 60 * 1000),
        password: linkSettings.requirePassword ? linkSettings.password : undefined,
        accessCount: 0,
        maxAccess: linkSettings.maxAccess || undefined
      }
      
      setShareLinks([...shareLinks, newLink])
      
      toast({
        title: '分享链接已生成',
        description: '链接已复制到剪贴板',
      })
      
      // 复制到剪贴板
      await navigator.clipboard.writeText(newLink.url)
    } catch (error) {
      toast({
        title: '生成失败',
        description: '无法生成分享链接',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast({
        title: '已复制',
        description: '链接已复制到剪贴板',
      })
    } catch (error) {
      toast({
        title: '复制失败',
        description: '无法复制链接',
        variant: 'destructive',
      })
    }
  }

  const revokeLink = async (linkId: string) => {
    try {
      // TODO: 调用后端 API 撤销链接
      setShareLinks(shareLinks.filter(link => link.id !== linkId))
      toast({
        title: '链接已撤销',
        description: '分享链接已被撤销',
      })
    } catch (error) {
      toast({
        title: '撤销失败',
        description: '无法撤销链接',
        variant: 'destructive',
      })
    }
  }

  const shareViaEmail = (url: string) => {
    const subject = encodeURIComponent(`分享文档: ${metadata.title}`)
    const body = encodeURIComponent(`我想与您分享这个文档：\n\n${metadata.title}\n\n访问链接：${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`)
  }

  const getLinkTypeIcon = (type: ShareLink['type']) => {
    switch (type) {
      case 'view':
        return <Eye className="h-4 w-4" />
      case 'edit':
        return <Settings className="h-4 w-4" />
      case 'comment':
        return <Users className="h-4 w-4" />
    }
  }

  const getLinkTypeLabel = (type: ShareLink['type']) => {
    switch (type) {
      case 'view':
        return '查看'
      case 'edit':
        return '编辑'
      case 'comment':
        return '评论'
    }
  }

  const getLinkTypeColor = (type: ShareLink['type']) => {
    switch (type) {
      case 'view':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'edit':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'comment':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-900 border rounded-lg h-full flex flex-col">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <Share2 className="h-5 w-5" />
          <div>
            <h3 className="font-semibold">分享文档</h3>
            <p className="text-sm text-muted-foreground">{metadata.title}</p>
          </div>
        </div>
        
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose}>
            关闭
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto">
        {/* 创建新链接 */}
        <div className="p-4 border-b">
          <h4 className="font-medium mb-3">创建分享链接</h4>
          
          {/* 权限类型选择 */}
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">访问权限</label>
            <div className="flex space-x-2">
              {(['view', 'edit', 'comment'] as const).map((type) => (
                <Button
                  key={type}
                  variant={selectedLinkType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLinkType(type)}
                  className="flex items-center space-x-1"
                >
                  {getLinkTypeIcon(type)}
                  <span>{getLinkTypeLabel(type)}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* 链接设置 */}
          <div className="space-y-3 mb-4">
            {/* 密码保护 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="requirePassword"
                checked={linkSettings.requirePassword}
                onChange={(e) => setLinkSettings({
                  ...linkSettings,
                  requirePassword: e.target.checked
                })}
                className="rounded"
              />
              <label htmlFor="requirePassword" className="text-sm">
                需要密码访问
              </label>
            </div>
            
            {linkSettings.requirePassword && (
              <input
                type="text"
                placeholder="设置访问密码"
                value={linkSettings.password}
                onChange={(e) => setLinkSettings({
                  ...linkSettings,
                  password: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            )}

            {/* 过期时间 */}
            <div>
              <label className="text-sm font-medium mb-1 block">过期时间</label>
              <select
                value={linkSettings.expiresIn}
                onChange={(e) => setLinkSettings({
                  ...linkSettings,
                  expiresIn: e.target.value
                })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              >
                <option value="7d">7天后</option>
                <option value="30d">30天后</option>
                <option value="never">永不过期</option>
              </select>
            </div>

            {/* 访问次数限制 */}
            <div>
              <label className="text-sm font-medium mb-1 block">最大访问次数</label>
              <input
                type="number"
                placeholder="0 = 无限制"
                value={linkSettings.maxAccess}
                onChange={(e) => setLinkSettings({
                  ...linkSettings,
                  maxAccess: parseInt(e.target.value) || 0
                })}
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            {/* 允许下载 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowDownload"
                checked={linkSettings.allowDownload}
                onChange={(e) => setLinkSettings({
                  ...linkSettings,
                  allowDownload: e.target.checked
                })}
                className="rounded"
              />
              <label htmlFor="allowDownload" className="text-sm">
                允许下载文档
              </label>
            </div>
          </div>

          <Button
            onClick={generateShareLink}
            disabled={isGenerating}
            className="w-full"
          >
            <Link className="mr-2 h-4 w-4" />
            {isGenerating ? '生成中...' : '生成分享链接'}
          </Button>
        </div>

        {/* 现有链接列表 */}
        <div className="p-4">
          <h4 className="font-medium mb-3">现有分享链接</h4>
          
          {shareLinks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Share2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>暂无分享链接</p>
            </div>
          ) : (
            <div className="space-y-3">
              {shareLinks.map((link) => (
                <div key={link.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getLinkTypeColor(link.type)}>
                        {getLinkTypeIcon(link.type)}
                        <span className="ml-1">{getLinkTypeLabel(link.type)}</span>
                      </Badge>
                      
                      {link.password && (
                        <Badge variant="outline">
                          <Lock className="h-3 w-3 mr-1" />
                          密码保护
                        </Badge>
                      )}
                      
                      {link.expiresAt && (
                        <Badge variant="outline">
                          <Calendar className="h-3 w-3 mr-1" />
                          {link.expiresAt.toLocaleDateString()}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyLink(link.url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => shareViaEmail(link.url)}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeLink(link.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        撤销
                      </Button>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded">
                    {link.url}
                  </div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                    <span>访问次数: {link.accessCount}{link.maxAccess ? `/${link.maxAccess}` : ''}</span>
                    {link.expiresAt && (
                      <span>
                        {link.expiresAt > new Date() ? '有效' : '已过期'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}