import { useCallback, useEffect, useState } from 'react'
import { Plate, PlateProvider, createPlateEditor } from '@udecode/plate-common'
import { createParagraphPlugin } from '@udecode/plate-basic-elements'
import { createHeadingPlugin } from '@udecode/plate-heading'
import { createListPlugin } from '@udecode/plate-list'
import { createBoldPlugin, createItalicPlugin } from '@udecode/plate-basic-marks'
import { createCodeBlockPlugin } from '@udecode/plate-code-block'
import { useProject } from '@/contexts/ProjectContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Save, Zap } from 'lucide-react'

interface PlateEditorProps {
  specType: 'requirements' | 'design' | 'tasks'
  initialValue: any[]
  projectId: string
}

export default function PlateEditor({ specType, initialValue, projectId }: PlateEditorProps) {
  const [value, setValue] = useState(initialValue)
  const [isSaving, setIsSaving] = useState(false)
  const { updateSpecs } = useProject()
  const { toast } = useToast()

  // Create editor with plugins
  const editor = createPlateEditor({
    plugins: [
      createParagraphPlugin(),
      createHeadingPlugin(),
      createListPlugin(),
      createBoldPlugin(),
      createItalicPlugin(),
      createCodeBlockPlugin(),
    ],
  })

  // Update value when initialValue changes
  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const handleSave = useCallback(async () => {
    setIsSaving(true)
    try {
      const specs = {
        [specType]: value,
      }
      await updateSpecs(projectId, specs)
      toast({
        title: '保存成功',
        description: `${specType} 文档已保存`,
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
  }, [value, specType, projectId, updateSpecs, toast])

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

  return (
    <div className="h-full flex flex-col">
      {/* 工具栏 */}
      <div className="flex items-center justify-between border-b p-2 bg-muted/50">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Zap className="mr-2 h-4 w-4" />
            AI 生成
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            Ctrl+S 保存
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>

      {/* 编辑器 */}
      <div className="flex-1 overflow-auto">
        <PlateProvider editor={editor}>
          <Plate
            value={value}
            onChange={setValue}
            className="h-full"
          >
            <div className="h-full p-4">
              {value.length === 0 ? (
                <div className="text-muted-foreground whitespace-pre-line">
                  {getPlaceholderText()}
                </div>
              ) : null}
              <div className="min-h-full prose prose-sm max-w-none">
                {/* Plate editor content will be rendered here */}
              </div>
            </div>
          </Plate>
        </PlateProvider>
      </div>
    </div>
  )
}