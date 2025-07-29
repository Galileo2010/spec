import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useProject } from '@/contexts/ProjectContext'
import { useToast } from '@/hooks/use-toast'
import SimplePlateEditor from './SimplePlateEditor'
import VersionHistory from './VersionHistory'
import { DocumentExportService, DocumentMetadata } from '@/services/documentExportService'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { TDescendant } from '@udecode/plate-common'
import {
  FileText,
  Layers,
  CheckSquare,
  Download,
  Upload,
  Share2,
  History,
  Settings,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Save,
  FileDown,
  FileUp,
  Sparkles
} from 'lucide-react'

interface SpecManagementInterfaceProps {
  projectId: string
}

interface SpecFiles {
  requirements?: TDescendant[]
  design?: TDescendant[]
  tasks?: TDescendant[]
}

interface SpecStatus {
  requirements: 'empty' | 'draft' | 'complete'
  design: 'empty' | 'draft' | 'complete'
  tasks: 'empty' | 'draft' | 'complete'
}

const defaultValue: TDescendant[] = [
  {
    type: 'p',
    children: [{ text: '' }],
  },
]

export default function SpecManagementInterface({ projectId }: SpecManagementInterfaceProps) {
  const [activeTab, setActiveTab] = useState<'requirements' | 'design' | 'tasks'>('requirements')
  const [specs, setSpecs] = useState<SpecFiles>({})
  const [specStatus, setSpecStatus] = useState<SpecStatus>({
    requirements: 'empty',
    design: 'empty',
    tasks: 'empty'
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [showExportOptions, setShowExportOptions] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  const { getSpecs, updateSpecs, getProject } = useProject()
  const { toast } = useToast()

  // 加载规范文档
  useEffect(() => {
    loadSpecs()
  }, [projectId])

  const loadSpecs = async () => {
    try {
      setIsLoading(true)
      const specsData = await getSpecs(projectId)
      setSpecs(specsData || {})
      updateSpecStatus(specsData || {})
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
    const getStatus = (content?: TDescendant[]) => {
      if (!content || content.length === 0) return 'empty'
      if (content.length === 1 && content[0].children?.[0]?.text === '') return 'empty'

      // 简单的完整性检查
      const stats = PlateMarkdownConverter.getDocumentStats(content)
      if (stats.wordCount < 50) return 'draft'
      return 'complete'
    }

    setSpecStatus({
      requirements: getStatus(specsData.requirements),
      design: getStatus(specsData.design),
      tasks: getStatus(specsData.tasks)
    })
  }

  // 保存规范文档
  const handleSave = async (specType: keyof SpecFiles, content: TDescendant[]) => {
    try {
      setIsSaving(true)
      const updatedSpecs = { ...specs, [specType]: content }
      await updateSpecs(projectId, { [specType]: content })
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
    } finally {
      setIsSaving(false)
    }
  }

  // 导出文档
  const handleExport = async (format: 'markdown' | 'html' | 'pdf' | 'json') => {
    try {
      const project = await getProject(projectId)
      const metadata: Omit<DocumentMetadata, 'specType'> = {
        title: project.name,
        author: 'Current User', // TODO: 从用户上下文获取
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        version: '1.0',
        projectId
      }

      if (activeTab && specs[activeTab]) {
        // 导出单个文档
        const specMetadata: DocumentMetadata = {
          ...metadata,
          specType: activeTab,
          title: `${metadata.title} - ${getSpecTypeLabel(activeTab)}`
        }

        const result = await DocumentExportService.exportByFormat(
          specs[activeTab]!,
          specMetadata,
          format
        )

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

  // 导出所有文档
  const handleExportAll = async (format: 'markdown' | 'html' | 'pdf' | 'json') => {
    try {
      const project = await getProject(projectId)
      const metadata: Omit<DocumentMetadata, 'specType'> = {
        title: project.name,
        author: 'Current User',
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
        version: '1.0',
        projectId
      }

      const result = await DocumentExportService.exportAllSpecs(specs, metadata, format)

      if (result.success) {
        if (result.zipBlob) {
          // 下载 ZIP 文件
          const url = URL.createObjectURL(result.zipBlob)
          const link = document.createElement('a')
          link.href = url
          link.download = `${project.name}-specs.zip`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          URL.revokeObjectURL(url)
        } else if (result.files.length === 1) {
          DocumentExportService.downloadFile(result.files[0])
        }

        toast({
          title: '导出成功',
          description: `所有规范文档已导出为 ${format.toUpperCase()}`,
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: '导出失败',
        description: error instanceof Error ? error.message : '导出过程中发生错误',
        variant: 'destructive',
      })
    }
  }

  // 导入文档
  const handleImport = async (file: File) => {
    try {
      const text = await file.text()
      let content: TDescendant[]

      if (file.name.endsWith('.md')) {
        content = PlateMarkdownConverter.markdownToPlate(text)
      } else if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        content = data.content || data
      } else {
        throw new Error('不支持的文件格式')
      }

      // 验证转换结果
      const validation = PlateMarkdownConverter.validateConversion([], content)
      if (!validation.isValid) {
        throw new Error(`导入验证失败: ${validation.errors.join(', ')}`)
      }

      await handleSave(activeTab, content)

      toast({
        title: '导入成功',
        description: `${getSpecTypeLabel(activeTab)} 已导入`,
      })
    } catch (error) {
      toast({
        title: '导入失败',
        description: error instanceof Error ? error.message : '导入过程中发生错误',
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
          icon: <Edit className="h-3 w-3" />,
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
              onClick={() => setShowVersionHistory(!showVersionHistory)}
            >
              <History className="mr-2 h-4 w-4" />
              版本历史
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportOptions(!showExportOptions)}
              >
                <Download className="mr-2 h-4 w-4" />
                导出
              </Button>

              {showExportOptions && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border rounded-lg shadow-lg z-10">
                  <div className="p-2">
                    <div className="text-xs font-medium text-muted-foreground mb-2">当前文档</div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('markdown')}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        Markdown
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('html')}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        HTML
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExport('pdf')}
                      >
                        <FileDown className="mr-2 h-4 w-4" />
                        PDF
                      </Button>
                    </div>

                    <Separator className="my-2" />

                    <div className="text-xs font-medium text-muted-foreground mb-2">所有文档</div>
                    <div className="space-y-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExportAll('markdown')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        全部导出 (Markdown)
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => handleExportAll('html')}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        全部导出 (HTML)
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-import')?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              导入
            </Button>

            <input
              id="file-import"
              type="file"
              accept=".md,.json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleImport(file)
                }
              }}
            />

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
            {isSaving && (
              <>
                <Clock className="h-3 w-3 animate-spin" />
                <span>保存中...</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 flex">
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
                <PlateEditor
                  specType="requirements"
                  initialValue={specs.requirements || defaultValue}
                  projectId={projectId}
                  onSave={(content) => handleSave('requirements', content)}
                />
              </TabsContent>

              <TabsContent value="design" className="h-full m-0">
                <PlateEditor
                  specType="design"
                  initialValue={specs.design || defaultValue}
                  projectId={projectId}
                  onSave={(content) => handleSave('design', content)}
                />
              </TabsContent>

              <TabsContent value="tasks" className="h-full m-0">
                <PlateEditor
                  specType="tasks"
                  initialValue={specs.tasks || defaultValue}
                  projectId={projectId}
                  onSave={(content) => handleSave('tasks', content)}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* 侧边栏 */}
        {showVersionHistory && (
          <div className="w-80 border-l">
            <VersionHistory
              projectId={projectId}
              specType={activeTab}
            />
          </div>
        )}
      </div>
    </div>
  )
}