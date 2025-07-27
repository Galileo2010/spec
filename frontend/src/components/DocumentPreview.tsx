import { useState, useEffect } from 'react'
import { TDescendant } from '@udecode/plate-common'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { DocumentExportService, DocumentMetadata } from '@/services/documentExportService'
import { 
  Eye, 
  Code, 
  FileText, 
  Download,
  Copy,
  RefreshCw,
  Maximize2,
  Minimize2,
  Settings
} from 'lucide-react'

interface DocumentPreviewProps {
  content: TDescendant[]
  metadata?: DocumentMetadata
  format: 'markdown' | 'html' | 'json'
  onClose?: () => void
}

export default function DocumentPreview({ 
  content, 
  metadata, 
  format, 
  onClose 
}: DocumentPreviewProps) {
  const [previewContent, setPreviewContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [stats, setStats] = useState({
    wordCount: 0,
    characterCount: 0,
    nodeCount: 0,
    headingCount: 0,
    listCount: 0,
    codeBlockCount: 0
  })

  useEffect(() => {
    generatePreview()
  }, [content, format])

  const generatePreview = async () => {
    setIsLoading(true)
    try {
      let preview = ''
      
      switch (format) {
        case 'markdown':
          preview = PlateMarkdownConverter.plateToMarkdown(content)
          break
        case 'html':
          const htmlResult = await DocumentExportService.exportToHTML(content, metadata)
          preview = htmlResult.data as string || ''
          break
        case 'json':
          const jsonResult = await DocumentExportService.exportToJSON(content, metadata)
          preview = jsonResult.data as string || ''
          break
      }
      
      setPreviewContent(preview)
      
      // 计算文档统计
      const documentStats = PlateMarkdownConverter.getDocumentStats(content)
      setStats(documentStats)
    } catch (error) {
      console.error('Preview generation failed:', error)
      setPreviewContent('预览生成失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(previewContent)
      // TODO: 显示复制成功提示
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownload = async () => {
    try {
      let result
      switch (format) {
        case 'markdown':
          result = await DocumentExportService.exportToMarkdown(content, metadata)
          break
        case 'html':
          result = await DocumentExportService.exportToHTML(content, metadata)
          break
        case 'json':
          result = await DocumentExportService.exportToJSON(content, metadata)
          break
      }
      
      if (result.success) {
        DocumentExportService.downloadFile(result)
      }
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  const getFormatIcon = () => {
    switch (format) {
      case 'markdown':
        return <FileText className="h-4 w-4" />
      case 'html':
        return <Code className="h-4 w-4" />
      case 'json':
        return <Settings className="h-4 w-4" />
    }
  }

  const getFormatLabel = () => {
    switch (format) {
      case 'markdown':
        return 'Markdown'
      case 'html':
        return 'HTML'
      case 'json':
        return 'JSON'
    }
  }

  return (
    <div className={`bg-white dark:bg-gray-900 border rounded-lg ${isFullscreen ? 'fixed inset-4 z-50' : 'h-full'}`}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getFormatIcon()}
            <h3 className="font-semibold">文档预览</h3>
          </div>
          <Badge variant="outline">{getFormatLabel()}</Badge>
          {metadata && (
            <Badge variant="secondary">{metadata.specType}</Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {/* 视图模式切换 */}
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === 'preview' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('preview')}
              className="rounded-r-none"
            >
              <Eye className="h-4 w-4 mr-1" />
              预览
            </Button>
            <Button
              variant={viewMode === 'source' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('source')}
              className="rounded-l-none"
            >
              <Code className="h-4 w-4 mr-1" />
              源码
            </Button>
          </div>
          
          <Separator orientation="vertical" className="h-6" />
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4 mr-1" />
            复制
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
          >
            <Download className="h-4 w-4 mr-1" />
            下载
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
            >
              关闭
            </Button>
          )}
        </div>
      </div>

      {/* 统计信息 */}
      <div className="px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center space-x-6 text-xs text-muted-foreground">
          <span>{stats.wordCount} 词</span>
          <span>{stats.characterCount} 字符</span>
          <span>{stats.nodeCount} 节点</span>
          <span>{stats.headingCount} 标题</span>
          <span>{stats.listCount} 列表</span>
          <span>{stats.codeBlockCount} 代码块</span>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">生成预览中...</p>
            </div>
          </div>
        ) : (
          <div className="h-full">
            {viewMode === 'preview' ? (
              <div className="p-6">
                {format === 'html' ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: previewContent }}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                    {previewContent}
                  </pre>
                )}
              </div>
            ) : (
              <div className="p-4">
                <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed bg-muted/50 p-4 rounded">
                  {previewContent}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部信息 */}
      {metadata && (
        <div className="border-t p-3 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>标题: {metadata.title}</span>
              <span>作者: {metadata.author}</span>
              <span>版本: {metadata.version}</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>创建: {metadata.createdAt.toLocaleDateString()}</span>
              <span>更新: {metadata.updatedAt.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}