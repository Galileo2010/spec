import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProject } from '@/contexts/ProjectContext'
import { useToast } from '@/hooks/use-toast'
import PlateEditor from './PlateEditor'
import { 
  FileText, 
  Layers, 
  CheckSquare, 
  Download, 
  Share2,
  RefreshCw,
  AlertCircle
} from 'lucide-react'
import { TDescendant } from '@udecode/plate-common'

interface SpecDocumentManagerProps {
  projectId: string
}

interface SpecFiles {
  requirements?: TDescendant[]
  design?: TDescendant[]
  tasks?: TDescendant[]
}

const defaultValue: TDescendant[] = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
]

export default function SpecDocumentManager({ projectId }: SpecDocumentManagerProps) {
  const [activeTab, setActiveTab] = useState<'requirements' | 'design' | 'tasks'>('requirements')
  const [specs, setSpecs] = useState<SpecFiles>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { getSpecs } = useProject()
  const { toast } = useToast()

  // Load specs on component mount
  useEffect(() => {
    loadSpecs()
  }, [projectId])

  const loadSpecs = async () => {
    try {
      setIsLoading(true)
      const specsData = await getSpecs(projectId)
      setSpecs(specsData || {})
    } catch (error) {
      console.error('Failed to load specs:', error)
      toast({
        title: '加载失败',
        description: '无法加载规范文档',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadSpecs()
    setIsRefreshing(false)
    toast({
      title: '刷新成功',
      description: '规范文档已更新',
    })
  }

  const handleExport = async (format: 'markdown' | 'pdf') => {
    try {
      // TODO: Implement export functionality
      toast({
        title: '导出功能',
        description: `${format.toUpperCase()} 导出功能正在开发中`,
      })
    } catch (error) {
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  const getTabStatus = (tabType: 'requirements' | 'design' | 'tasks') => {
    const content = specs[tabType]
    if (!content || content.length === 0) return 'empty'
    if (content.length === 1 && content[0].children?.[0]?.text === '') return 'empty'
    return 'has-content'
  }

  const getTabIcon = (tabType: 'requirements' | 'design' | 'tasks') => {
    switch (tabType) {
      case 'requirements':
        return <FileText className="h-4 w-4" />
      case 'design':
        return <Layers className="h-4 w-4" />
      case 'tasks':
        return <CheckSquare className="h-4 w-4" />
    }
  }

  const getTabLabel = (tabType: 'requirements' | 'design' | 'tasks') => {
    switch (tabType) {
      case 'requirements':
        return '需求文档'
      case 'design':
        return '设计文档'
      case 'tasks':
        return '任务文档'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">加载规范文档中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      {/* 文档管理头部 */}
      <div className="border-b p-4 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">规范文档管理</h2>
            <p className="text-sm text-muted-foreground">
              管理项目的需求、设计和任务文档
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('markdown')}
            >
              <Download className="mr-2 h-4 w-4" />
              导出
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // TODO: Implement share functionality
                toast({
                  title: '分享功能',
                  description: '分享功能正在开发中',
                })
              }}
            >
              <Share2 className="mr-2 h-4 w-4" />
              分享
            </Button>
          </div>
        </div>
      </div>

      {/* 文档标签页 */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="grid w-full grid-cols-3">
            {(['requirements', 'design', 'tasks'] as const).map((tabType) => (
              <TabsTrigger
                key={tabType}
                value={tabType}
                className="flex items-center space-x-2"
              >
                {getTabIcon(tabType)}
                <span>{getTabLabel(tabType)}</span>
                {getTabStatus(tabType) === 'empty' ? (
                  <Badge variant="secondary" className="ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    空
                  </Badge>
                ) : (
                  <Badge variant="default" className="ml-2">
                    ✓
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="requirements" className="h-full m-0">
            <PlateEditor
              specType="requirements"
              initialValue={specs.requirements || defaultValue}
              projectId={projectId}
            />
          </TabsContent>

          <TabsContent value="design" className="h-full m-0">
            <PlateEditor
              specType="design"
              initialValue={specs.design || defaultValue}
              projectId={projectId}
            />
          </TabsContent>

          <TabsContent value="tasks" className="h-full m-0">
            <PlateEditor
              specType="tasks"
              initialValue={specs.tasks || defaultValue}
              projectId={projectId}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}