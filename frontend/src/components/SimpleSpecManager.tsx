import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import SimplePlateEditor from './SimplePlateEditor'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { DocumentExportService } from '@/services/documentExportService'
import { 
  FileText, 
  Layers, 
  CheckSquare, 
  Download, 
  Upload,
  Share2,
  History,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  Settings
} from 'lucide-react'

interface SimpleNode {
  type: string
  children?: SimpleNode[]
  text?: string
  [key: string]: any
}

interface SpecFiles {
  requirements?: SimpleNode[]
  design?: SimpleNode[]
  tasks?: SimpleNode[]
}

interface SpecStatus {
  requirements: 'empty' | 'draft' | 'complete'
  design: 'empty' | 'draft' | 'complete'
  tasks: 'empty' | 'draft' | 'complete'
}

const defaultValue: SimpleNode[] = [
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]

interface SimpleSpecManagerProps {
  projectId: string
}

export default function SimpleSpecManager({ projectId }: SimpleSpecManagerProps) {
  const [activeTab, setActiveTab] = useState<'requirements' | 'design' | 'tasks'>('requirements')
  const [specs, setSpecs] = useState<SpecFiles>({})
  const [specStatus, setSpecStatus] = useState<SpecStatus>({
    requirements: 'empty',
    design: 'empty',
    tasks: 'empty'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  // 加载规范文档
  useEffect(() => {
    loadSpecs()
  }, [projectId])

  const loadSpecs = async () => {
    try {
      setIsLoading(true)
      
      // 模拟加载数据
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockSpecs: SpecFiles = {
        requirements: [
          {
            type: 'heading',
            level: 1,
            children: [{ text: '需求文档示例' }]
          },
          {
            type: 'paragraph',
            children: [{ text: '这是一个需求文档的示例内容。' }]
          }
        ],
        design: [
          {
            type: 'heading',
            level: 1,
            children: [{ text: '设计文档示例' }]
          },
          {
            type: 'paragraph',
            children: [{ text: '这是一个设计文档的示例内容。' }]
          }
        ],
        tasks: [
          {
            type: 'heading',
            level: 1,
            children: [{ text: '任务文档示例' }]
          },
          {
            type: 'paragraph',
            children: [{ text: '这是一个任务文档的示例内容。' }]
          }
        ]
      }
      
      setSpecs(mockSpecs)
      updateSpecStatus(mockSpecs)
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

  // 更新规范状态
  const updateSpecStatus = (specsData: SpecFiles) => {
    const getStatus = (content?: SimpleNode[]) => {
      if (!content || content.length === 0) return 'empty'
      
      const text = extractTextFromNodes(content)
      if (text.trim().length === 0) return 'empty'
      if (text.trim().length < 50) return 'draft'
      return 'complete'
    }

    setSpecStatus({
      requirements: getStatus(specsData.requirements),
      design: getStatus(specsData.design),
      tasks: getStatus(specsData.tasks)
    })
  }

  // 从节点中提取文本
  const extractTextFromNodes = (nodes: SimpleNode[]): string => {
    return nodes.map(node => {
      if (node.text) return node.text
      if (node.children) return extractTextFromNodes(node.children)
      return ''
    }).join(' ')
  }

  // 保存规范文档
  const handleSave = async (specType: keyof SpecFiles, content: SimpleNode[]) => {
    try {
      const updatedSpecs = { ...specs, [specType]: content }
      setSpecs(updatedSpecs)
      updateSpecStatus(updatedSpecs)
      setLastSaved(new Date())
      
      toast({
        title: '保存成功',
        description: `${getSpecTypeLabel(specType)} 已保存`,
      })
    } catch (error) {
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  // 导出文档
  const handleExport = async (format: 'markdown' | 'html' | 'json') => {
    try {
      if (activeTab && specs[activeTab]) {
        // 转换为 Plate.js 格式进行导出
        const plateContent = specs[activeTab]!.map(node => ({
          type: node.type === 'heading' ? `h${node.level || 1}` : 'p',
          children: node.children || [{ text: node.text || '' }]
        }))

        const metadata = {
          title: `${getSpecTypeLabel(activeTab)} - 测试项目`,
          author: '测试用户',
          createdAt: new Date(),
          updatedAt: new Date(),
          version: '1.0',
          specType: activeTab,
          projectId
        }
        
        let result
        switch (format) {
          case 'markdown':
            result = await DocumentExportService.exportToMarkdown(plateContent, metadata)
            break
          case 'html':
            result = await DocumentExportService.exportToHTML(plateContent, metadata)
            break
          case 'json':
            result = await DocumentExportService.exportToJSON(plateContent, metadata)
            break
        }
        
        if (result.success) {
          DocumentExportService.downloadFile(result)
          toast({
            title: '导出成功',
            description: `${getSpecTypeLabel(activeTab)} 已导出为 ${format.toUpperCase()}`,
          })
        } else {
          throw new Error(result.error)
        }
      }
    } catch (error) {
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '导出过程中发生错误',
        variant: 'destructive',
      })
    }
  }

  // 获取规范类型标签
  const getSpecTypeLabel = (type: keyof SpecFiles) => {
    switch (type) {
      case 'requirements':
        return '需求文档'
      case 'design':
        return '设计文档'
      case 'tasks':
        return '任务文档'
      default:
        return '文档'
    }
  }

  // 获取规范类型图标
  const getSpecTypeIcon = (type: keyof SpecFiles) => {
    switch (type) {
      case 'requirements':
        return <FileText className="h-4 w-4" />
      case 'design':
        return <Layers className="h-4 w-4" />
      case 'tasks':
        return <CheckSquare className="h-4 w-4" />
    }
  }

  // 获取状态图标和颜色
  const getStatusDisplay = (status: SpecStatus[keyof SpecStatus]) => {
    switch (status) {
      case 'complete':
        return {
          icon: <CheckCircle className="h-3 w-3" />,
          label: '完整',
          color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        }
      case 'draft':
        return {
          icon: <Settings className="h-3 w-3" />,
          label: '草稿',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
        }
      case 'empty':
        return {
          icon: <AlertCircle className="h-3 w-3" />,
          label: '空白',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
        }
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
            {/* 状态指示器 */}
            <div className="flex items-center space-x-2 mr-4">
              {Object.entries(specStatus).map(([type, status]) => {
                const display = getStatusDisplay(status)
                return (
                  <div key={type} className="flex items-center space-x-1">
                    {getSpecTypeIcon(type as keyof SpecFiles)}
                    <Badge variant="outline" className={`text-xs ${display.color}`}>
                      {display.icon}
                      <span className="ml-1">{display.label}</span>
                    </Badge>
                  </div>
                )
              })}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* 操作按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('markdown')}
            >
              <Download className="mr-2 h-4 w-4" />
              导出 MD
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleExport('html')}
            >
              <Download className="mr-2 h-4 w-4" />
              导出 HTML
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={loadSpecs}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              刷新
            </Button>
          </div>
        </div>

        {/* 保存状态 */}
        {lastSaved && (
          <div className="flex items-center space-x-2 mt-2 text-xs text-muted-foreground">
            <CheckCircle className="h-3 w-3 text-green-600" />
            <span>最后保存: {lastSaved.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      {/* 主编辑区域 */}
      <div className="flex-1">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <div className="border-b px-4">
            <TabsList className="grid w-full grid-cols-3">
              {(['requirements', 'design', 'tasks'] as const).map((tabType) => {
                const status = getStatusDisplay(specStatus[tabType])
                return (
                  <TabsTrigger
                    key={tabType}
                    value={tabType}
                    className="flex items-center space-x-2"
                  >
                    {getSpecTypeIcon(tabType)}
                    <span>{getSpecTypeLabel(tabType)}</span>
                    <Badge variant="outline" className={`ml-2 ${status.color}`}>
                      {status.icon}
                    </Badge>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="requirements" className="h-full m-0">
              <SimplePlateEditor
                specType="requirements"
                initialValue={specs.requirements || defaultValue}
                projectId={projectId}
                onSave={(content) => handleSave('requirements', content)}
              />
            </TabsContent>

            <TabsContent value="design" className="h-full m-0">
              <SimplePlateEditor
                specType="design"
                initialValue={specs.design || defaultValue}
                projectId={projectId}
                onSave={(content) => handleSave('design', content)}
              />
            </TabsContent>

            <TabsContent value="tasks" className="h-full m-0">
              <SimplePlateEditor
                specType="tasks"
                initialValue={specs.tasks || defaultValue}
                projectId={projectId}
                onSave={(content) => handleSave('tasks', content)}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}