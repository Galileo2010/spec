import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  History, 
  Clock, 
  User, 
  FileText,
  RotateCcw,
  Eye
} from 'lucide-react'

interface VersionHistoryProps {
  projectId: string
  specType: 'requirements' | 'design' | 'tasks'
}

interface VersionEntry {
  id: string
  timestamp: Date
  author: string
  changes: string
  size: number
  version: string
}

export default function VersionHistory({ projectId, specType }: VersionHistoryProps) {
  const [versions, setVersions] = useState<VersionEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Mock version history data
    const mockVersions: VersionEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        author: '当前用户',
        changes: '更新了用户故事和验收标准',
        size: 2048,
        version: 'v1.3'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        author: '当前用户',
        changes: '添加了新的需求章节',
        size: 1856,
        version: 'v1.2'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        author: '当前用户',
        changes: '初始版本创建',
        size: 1024,
        version: 'v1.0'
      }
    ]

    setTimeout(() => {
      setVersions(mockVersions)
      setIsLoading(false)
    }, 500)
  }, [projectId, specType])

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} 分钟前`
    } else if (hours < 24) {
      return `${hours} 小时前`
    } else {
      return `${days} 天前`
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleRestore = (versionId: string) => {
    // TODO: Implement version restore functionality
    console.log('Restore version:', versionId)
  }

  const handlePreview = (versionId: string) => {
    // TODO: Implement version preview functionality
    console.log('Preview version:', versionId)
  }

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <History className="h-5 w-5" />
          <h3 className="font-semibold">版本历史</h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          查看和恢复文档的历史版本
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        {versions.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">暂无版本历史</p>
            </div>
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {versions.map((version, index) => (
              <div key={version.id}>
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{version.version}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(version.timestamp)}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePreview(version.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRestore(version.id)}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-1">
                      <p className="text-sm font-medium">{version.changes}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <User className="h-3 w-3" />
                          <span>{version.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileText className="h-3 w-3" />
                          <span>{formatFileSize(version.size)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {index < versions.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}