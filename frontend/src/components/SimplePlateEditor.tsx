import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { 
  Save, 
  Zap, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Heading1, 
  Heading2, 
  Code,
  Sparkles,
  Loader2,
  Clock,
  CheckCircle
} from 'lucide-react'

interface SimplePlateEditorProps {
  specType: 'requirements' | 'design' | 'tasks'
  initialValue: any[]
  projectId: string
  onSave?: (content: any[]) => Promise<void>
}

export default function SimplePlateEditor({ 
  specType, 
  initialValue, 
  projectId, 
  onSave 
}: SimplePlateEditorProps) {
  const [content, setContent] = useState<string>('')
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const { toast } = useToast()

  // 将Plate.js格式转换为简单文本
  const plateToText = useCallback((plateContent: any[]): string => {
    if (!plateContent || plateContent.length === 0) return ''
    
    return plateContent.map(node => {
      if (node.children) {
        return node.children.map((child: any) => child.text || '').join('')
      }
      return node.text || ''
    }).join('\n')
  }, [])

  // 将文本转换为简单的Plate.js格式
  const textToPlate = useCallback((text: string): any[] => {
    if (!text.trim()) {
      return [{ type: 'p', children: [{ text: '' }] }]
    }
    
    return text.split('\n').map(line => ({
      type: 'p',
      children: [{ text: line }]
    }))
  }, [])

  // 初始化内容
  useEffect(() => {
    const textContent = plateToText(initialValue)
    setContent(textContent)
  }, [initialValue, plateToText])

  // 检测内容变化
  useEffect(() => {
    const initialText = plateToText(initialValue)
    setHasUnsavedChanges(content !== initialText)
  }, [content, initialValue, plateToText])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      const plateContent = textToPlate(content)
      
      if (onSave) {
        await onSave(plateContent)
      }
      
      setLastSaved(new Date())
      setHasUnsavedChanges(false)
      toast({
        title: '保存成功',
        description: `${getSpecTypeLabel()} 文档已保存`,
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: '保存失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }, [content, onSave, toast, textToPlate])

  const handleAiGenerate = useCallback(async () => {
    if (!aiInput.trim()) {
      toast({
        title: '请输入描述',
        description: '请输入要生成的内容描述',
        variant: 'destructive',
      })
      return
    }

    setIsGenerating(true)
    try {
      // 模拟AI生成
      const generatedText = `# ${getSpecTypeLabel()}\n\n基于输入"${aiInput}"生成的内容：\n\n这是一个示例${getSpecTypeLabel()}，展示了AI生成的功能。\n\n## 主要特点\n\n- 智能内容生成\n- 结构化文档\n- 用户友好的界面`
      
      setContent(generatedText)
      setAiInput('')
      setShowAiPanel(false)
      
      toast({
        title: 'AI 生成成功',
        description: '内容已生成到编辑器中',
      })
    } catch (error) {
      console.error('AI generation error:', error)
      toast({
        title: 'AI 生成失败',
        description: '请稍后重试',
        variant: 'destructive',
      })
    } finally {
      setIsGenerating(false)
    }
  }, [aiInput, toast])

  // 快捷键保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleSave])

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

  const getPlaceholderText = () => {
    switch (specType) {
      case 'requirements':
        return '开始编写需求文档...\n\n您可以使用 AI 生成功能来快速创建标准化的需求文档。'
      case 'design':
        return '开始编写设计文档...\n\n描述技术架构、组件设计和实现方案。'
      case 'tasks':
        return '开始编写任务文档...\n\n将设计分解为具体的开发任务和实施计划。'
      default:
        return '开始编写文档...'
    }
  }

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b p-2 bg-muted/50">
        <div className="flex items-center space-x-2">
          {/* 格式化工具 */}
          <div className="flex items-center space-x-1 border-r pr-2">
            <Button variant="ghost" size="sm" title="粗体" disabled>
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="斜体" disabled>
              <Italic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="标题1" disabled>
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="标题2" disabled>
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>

          {/* 列表工具 */}
          <div className="flex items-center space-x-1 border-r pr-2">
            <Button variant="ghost" size="sm" title="无序列表" disabled>
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="有序列表" disabled>
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="代码块" disabled>
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* AI 工具 */}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowAiPanel(!showAiPanel)}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Zap className="mr-2 h-4 w-4" />
            )}
            AI 生成
          </Button>
        </div>

        <div className="flex items-center space-x-4">
          {/* 文档统计 */}
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <span>{content.split(/\s+/).filter(w => w).length} 词</span>
            <span>•</span>
            <span>{content.length} 字符</span>
          </div>

          {/* 保存状态 */}
          <div className="flex items-center space-x-2">
            {hasUnsavedChanges && (
              <div className="flex items-center space-x-1 text-xs text-amber-600">
                <Clock className="h-3 w-3" />
                <span>未保存</span>
              </div>
            )}
            {lastSaved && !hasUnsavedChanges && (
              <div className="flex items-center space-x-1 text-xs text-green-600">
                <CheckCircle className="h-3 w-3" />
                <span>已保存</span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">
              Ctrl+S 保存
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSave}
              disabled={isSaving || !hasUnsavedChanges}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>

      {/* AI 生成面板 */}
      {showAiPanel && (
        <div className="border-b p-4 bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center space-x-2 mb-2">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">AI 生成 {getSpecTypeLabel()}</span>
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder={`描述您想要生成的${getSpecTypeLabel()}内容...`}
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isGenerating) {
                  handleAiGenerate()
                }
              }}
              disabled={isGenerating}
            />
            <Button 
              size="sm" 
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiInput.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  生成中...
                </>
              ) : (
                '生成'
              )}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAiPanel(false)}
              disabled={isGenerating}
            >
              取消
            </Button>
          </div>
        </div>
      )}

      {/* 编辑器 */}
      <div className="flex-1 overflow-auto bg-background">
        <div className="h-full">
          {!content.trim() ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <div className="mb-4">
                  <Sparkles className="h-16 w-16 mx-auto text-muted-foreground/30" />
                </div>
                <h3 className="text-lg font-medium mb-2">开始编写{getSpecTypeLabel()}</h3>
                <p className="text-muted-foreground text-sm mb-4 whitespace-pre-line">
                  {getPlaceholderText()}
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowAiPanel(true)}
                  className="mt-2"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  使用 AI 生成内容
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6 max-w-4xl mx-auto">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-full min-h-[500px] resize-none border-none outline-none bg-transparent font-mono text-sm leading-relaxed"
                placeholder={getPlaceholderText()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}