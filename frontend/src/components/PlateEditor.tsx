import { useCallback, useEffect, useState, useMemo, useRef } from 'react'
import { 
  Plate, 
  PlateProvider,
  createPlateEditor, 
  PlateContent,
  TDescendant,
  Value
} from '@udecode/plate-common'
import { 
  BaseParagraphPlugin,
  createParagraphPlugin 
} from '@udecode/plate-basic-elements'
import { 
  BaseHeadingPlugin,
  createHeadingPlugin 
} from '@udecode/plate-heading'
import { 
  BaseListPlugin,
  createListPlugin 
} from '@udecode/plate-list'
import { 
  BaseBoldPlugin,
  BaseItalicPlugin,
  createBoldPlugin, 
  createItalicPlugin 
} from '@udecode/plate-basic-marks'
import { 
  BaseCodeBlockPlugin,
  createCodeBlockPlugin 
} from '@udecode/plate-code-block'
import { useProject } from '@/contexts/ProjectContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { aiService } from '@/lib/api'
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

interface PlateEditorProps {
  specType: 'requirements' | 'design' | 'tasks'
  initialValue: TDescendant[]
  projectId: string
  onSave?: (content: TDescendant[]) => Promise<void>
}

// Toolbar component for formatting actions
function EditorToolbar() {
  return (
    <div className="flex items-center space-x-1 border-r pr-2">
      <Button variant="ghost" size="sm" title="粗体">
        <Bold className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="斜体">
        <Italic className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="标题1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="标题2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="无序列表">
        <List className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="有序列表">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" title="代码块">
        <Code className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function PlateEditor({ specType, initialValue, projectId, onSave }: PlateEditorProps) {
  const [value, setValue] = useState<TDescendant[]>(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiInput, setAiInput] = useState('')
  const [showAiPanel, setShowAiPanel] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [documentStats, setDocumentStats] = useState({ words: 0, characters: 0 })
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>()
  const { updateSpecs } = useProject()
  const { toast } = useToast()

  // Enhanced editor with comprehensive plugins
  const editor = useMemo(() => createPlateEditor({
    plugins: [
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseListPlugin,
      BaseBoldPlugin,
      BaseItalicPlugin,
      BaseCodeBlockPlugin,
    ],
  }), [])

  // Calculate document statistics
  const calculateStats = useCallback((content: TDescendant[]) => {
    const text = content.map(node => {
      if ('children' in node) {
        return node.children.map((child: any) => child.text || '').join('')
      }
      return ''
    }).join(' ')
    
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const characters = text.length
    
    setDocumentStats({ words, characters })
  }, [])

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue)
    calculateStats(initialValue)
  }, [initialValue, calculateStats])

  // Track unsaved changes
  useEffect(() => {
    const hasChanges = JSON.stringify(value) !== JSON.stringify(initialValue)
    setHasUnsavedChanges(hasChanges)
  }, [value, initialValue])

  // Update document stats when value changes
  useEffect(() => {
    calculateStats(value)
  }, [value, calculateStats])

  const handleSave = useCallback(async () => {
    if (isSaving) return
    
    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(value)
      } else {
        const specs = {
          [specType]: value,
        }
        await updateSpecs(projectId, specs)
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
  }, [value, specType, projectId, updateSpecs, onSave, toast, isSaving])

  // Auto-save functionality with debouncing
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    if (hasUnsavedChanges && value.length > 0) {
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleSave()
      }, 3000) // Auto-save after 3 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [value, hasUnsavedChanges, handleSave])

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
      const generatedContent = await aiService.generateSpec({
        input: aiInput,
        specType,
      })

      // Replace current content with generated content
      setValue(generatedContent)
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
  }, [aiInput, specType, toast])

  // Auto-save on Ctrl+S
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

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b p-2 bg-muted/50">
        <div className="flex items-center space-x-2">
          {/* 格式化工具 */}
          <EditorToolbar />

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
            <span>{documentStats.words} 词</span>
            <span>•</span>
            <span>{documentStats.characters} 字符</span>
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
        <PlateProvider editor={editor}>
          <Plate
            value={value}
            onChange={setValue}
          >
            <div className="h-full">
              {value.length === 0 || (value.length === 1 && value[0].children?.[0]?.text === '') ? (
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
                  <PlateContent
                    className="min-h-[500px] prose prose-sm max-w-none focus:outline-none
                             prose-headings:font-semibold prose-headings:text-foreground
                             prose-p:text-foreground prose-p:leading-relaxed
                             prose-li:text-foreground prose-strong:text-foreground
                             prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                             prose-pre:bg-muted prose-pre:border prose-pre:p-4
                             prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4
                             prose-ul:list-disc prose-ol:list-decimal
                             prose-table:border-collapse prose-th:border prose-td:border prose-th:p-2 prose-td:p-2"
                    placeholder={getPlaceholderText()}
                  />
                </div>
              )}
            </div>
          </Plate>
        </PlateProvider>
      </div>
    </div>
  )
}