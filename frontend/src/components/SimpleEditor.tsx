import { useState, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { DocumentExportService } from '@/services/documentExportService'
import { 
  Save, 
  Download, 
  FileText,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Code,
  Eye,
  Edit
} from 'lucide-react'

// 简化的文档节点类型
interface SimpleNode {
  type: string
  children?: SimpleNode[]
  text?: string
  bold?: boolean
  italic?: boolean
  [key: string]: any
}

interface SimpleEditorProps {
  specType: 'requirements' | 'design' | 'tasks'
  initialValue?: SimpleNode[]
  projectId?: string
  onSave?: (content: SimpleNode[]) => Promise<void>
}

export default function SimpleEditor({ 
  specType, 
  initialValue = [], 
  projectId = 'test',
  onSave 
}: SimpleEditorProps) {
  const [content, setContent] = useState<SimpleNode[]>(initialValue.length > 0 ? initialValue : [
    { type: 'p', children: [{ text: '' }] }
  ])
  const [isEditing, setIsEditing] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // 将内容转换为纯文本进行编辑
  const contentToText = useCallback((nodes: SimpleNode[]): string => {
    return nodes.map(node => {
      if (node.text !== undefined) {
        return node.text
      }
      if (node.children) {
        return contentToText(node.children)
      }
      return ''
    }).join('')
  }, [])

  // 将文本转换回节点结构
  const textToContent = useCallback((text: string): SimpleNode[] => {
    if (!text.trim()) {
      return [{ type: 'p', children: [{ text: '' }] }]
    }
    
    const lines = text.split('\n')
    return lines.map(line => ({
      type: 'p',
      children: [{ text: line }]
    }))
  }, [])

  const [textValue, setTextValue] = useState(contentToText(content))

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const newContent = textToContent(textValue)
      setContent(newContent)
      
      if (onSave) {
        await onSave(newContent)
      }
      
      toast({
        title: '保存成功',
        description: `${getSpecTypeLabel()} 已保存`,
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

  const handleExport = async () => {
    try {
      const result = await DocumentExportService.exportToMarkdown(content as any, {
        title: `${getSpecTypeLabel()} - 测试文档`,
        author: '测试用户',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        specType,
        projectId
      })
      
      if (result.success) {
        DocumentExportService.downloadFile(result)
        toast({
          title: '导出成功',
          description: '文档已下载',
        })
      }
    } catch (error) {
      toast({
        title: '导出失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    }
  }

  const getSpecTypeLabel = () => {
    switch (specType) {
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

  const getSpecTypeIcon = () => {
    switch (specType) {
      case 'requirements':
        return <FileText className="h-4 w-4" />
      case 'design':
        return <Heading1 className="h-4 w-4" />
      case 'tasks':
        return <List className="h-4 w-4" />
    }
  }

  const insertSampleContent = () => {
    const sampleContent = {
      requirements: `# 需求文档示例

## 用户故事

作为开发者，我希望能够编辑和保存文档，以便管理项目规范。

## 验收标准

1. WHEN 用户点击保存按钮 THEN 系统 SHALL 保存文档内容
2. WHEN 用户点击导出按钮 THEN 系统 SHALL 生成 Markdown 文件
3. IF 保存失败 THEN 系统 SHALL 显示错误提示

## 功能需求

- 支持基本的文本编辑
- 支持 Markdown 格式导出
- 支持文档保存和加载`,

      design: `# 设计文档示例

## 系统架构

### 前端架构
- React 18 + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架

### 后端架构
- Bun 运行时
- Hono.js Web 框架
- SQLite 数据库

## 组件设计

### 编辑器组件
- 支持多种文档类型
- 实时保存功能
- 导出功能

### 数据流
1. 用户输入 → 组件状态更新
2. 保存操作 → 后端 API 调用
3. 导出操作 → 文件生成下载`,

      tasks: `# 任务文档示例

## 开发任务

- [ ] 1. 实现基础编辑器
  - 创建编辑器组件
  - 添加保存功能
  - 集成导出功能

- [ ] 2. 完善用户界面
  - 优化样式设计
  - 添加响应式布局
  - 改进用户体验

- [x] 3. 测试和验证
  - 单元测试编写
  - 集成测试验证
  - 用户验收测试

## 进度跟踪

- 总任务数: 3
- 已完成: 1
- 进行中: 2
- 完成率: 33%`
    }

    setTextValue(sampleContent[specType])
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b p-3 bg-muted/50">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getSpecTypeIcon()}
            <span className="font-semibold">{getSpecTypeLabel()}</span>
          </div>
          <Badge variant="outline">简化编辑器</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Eye className="mr-2 h-4 w-4" /> : <Edit className="mr-2 h-4 w-4" />}
            {isEditing ? '预览' : '编辑'}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={insertSampleContent}
          >
            <Code className="mr-2 h-4 w-4" />
            示例内容
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
          >
            <Download className="mr-2 h-4 w-4" />
            导出
          </Button>
          
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-auto">
        {isEditing ? (
          <div className="h-full p-4">
            <textarea
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              className="w-full h-full resize-none border-none outline-none bg-transparent font-mono text-sm leading-relaxed"
              placeholder={`开始编写${getSpecTypeLabel()}...

提示：
- 使用 # 创建标题
- 使用 - 创建列表
- 使用 **文本** 创建粗体
- 点击"示例内容"查看模板`}
            />
          </div>
        ) : (
          <div className="h-full p-6">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                {textValue || '暂无内容'}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* 状态栏 */}
      <div className="border-t p-2 bg-muted/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <span>字符数: {textValue.length}</span>
            <span>行数: {textValue.split('\n').length}</span>
            <span>词数: {textValue.trim() ? textValue.trim().split(/\s+/).length : 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>模式: {isEditing ? '编辑' : '预览'}</span>
            <span>•</span>
            <span>类型: {getSpecTypeLabel()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}