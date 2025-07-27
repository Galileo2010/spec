import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Diagram, 
  Edit, 
  Eye, 
  Copy, 
  Download,
  Maximize2,
  Code
} from 'lucide-react'

// Mermaid Diagram element type
export interface MermaidDiagramElement {
  type: 'mermaid-diagram'
  diagramType: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'gantt'
  code: string
  title?: string
  children: any[]
}

// Mermaid diagram component
export function MermaidDiagramElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<MermaidDiagramElement>) {
  const diagram = element as MermaidDiagramElement
  const [isEditing, setIsEditing] = useState(false)
  const [code, setCode] = useState(diagram.code || '')
  const [isRendering, setIsRendering] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const diagramRef = useRef<HTMLDivElement>(null)

  // Mock mermaid rendering (in real implementation, use mermaid.js)
  const renderDiagram = async () => {
    setIsRendering(true)
    setError(null)
    
    try {
      // Simulate mermaid rendering
      await new Promise(resolve => setTimeout(resolve, 500))
      
      if (diagramRef.current) {
        // In real implementation, use mermaid.render()
        diagramRef.current.innerHTML = `
          <div class="flex items-center justify-center h-48 bg-gray-100 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600">
            <div class="text-center">
              <Diagram class="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p class="text-sm text-gray-500">Mermaid 图表预览</p>
              <p class="text-xs text-gray-400 mt-1">${diagram.diagramType}</p>
            </div>
          </div>
        `
      }
    } catch (err) {
      setError('图表渲染失败')
    } finally {
      setIsRendering(false)
    }
  }

  useEffect(() => {
    if (!isEditing && code) {
      renderDiagram()
    }
  }, [isEditing, code])

  const handleSave = () => {
    // TODO: Update the element with new code
    setIsEditing(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
  }

  const handleExport = () => {
    // TODO: Implement diagram export
    console.log('Export diagram')
  }

  const getDiagramTypeColor = (type: string) => {
    switch (type) {
      case 'flowchart':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'sequence':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'class':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
      case 'state':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'er':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'gantt':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getDiagramTypeLabel = (type: string) => {
    switch (type) {
      case 'flowchart':
        return '流程图'
      case 'sequence':
        return '时序图'
      case 'class':
        return '类图'
      case 'state':
        return '状态图'
      case 'er':
        return '实体关系图'
      case 'gantt':
        return '甘特图'
      default:
        return '图表'
    }
  }

  return (
    <PlateElement
      {...attributes}
      className="my-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Diagram className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">Mermaid 图表</span>
          </div>
          <Badge className={getDiagramTypeColor(diagram.diagramType)}>
            {getDiagramTypeLabel(diagram.diagramType)}
          </Badge>
          {diagram.title && (
            <span className="text-sm text-muted-foreground">
              {diagram.title}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? <Eye className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Code className="h-4 w-4" />
            <span>编辑 Mermaid 代码</span>
          </div>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full h-48 p-3 font-mono text-sm border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={`graph TD
    A[开始] --> B{判断条件}
    B -->|是| C[执行操作]
    B -->|否| D[结束]
    C --> D`}
          />
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              取消
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {error ? (
            <div className="flex items-center justify-center h-32 bg-red-50 dark:bg-red-950/20 rounded border border-red-200 dark:border-red-800">
              <div className="text-center">
                <div className="text-red-600 mb-2">图表渲染错误</div>
                <div className="text-sm text-red-500">{error}</div>
              </div>
            </div>
          ) : isRendering ? (
            <div className="flex items-center justify-center h-32 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="text-center">
                <div className="animate-spin h-6 w-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm text-muted-foreground">渲染中...</div>
              </div>
            </div>
          ) : (
            <div 
              ref={diagramRef}
              className="min-h-[200px] bg-gray-50 dark:bg-gray-800 rounded border"
            />
          )}
        </div>
      )}
      
      <div className="mt-4">
        {children}
      </div>
    </PlateElement>
  )
}

// Plugin factory
export const createMermaidDiagramPlugin = createPluginFactory({
  key: 'mermaid-diagram',
  isElement: true,
  component: MermaidDiagramElement,
})

// Helper function to insert mermaid diagram
export const insertMermaidDiagram = (
  editor: any, 
  diagramType: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'gantt' = 'flowchart',
  code = '',
  title?: string
) => {
  const diagramNode: MermaidDiagramElement = {
    type: 'mermaid-diagram',
    diagramType,
    code,
    title,
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  editor.insertNode(diagramNode)
}