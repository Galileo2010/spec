import { useMemo } from 'react'
import { PlateProvider, Plate, PlateContent, TDescendant } from '@udecode/plate-common'
import { BaseParagraphPlugin } from '@udecode/plate-basic-elements'
import { BaseHeadingPlugin } from '@udecode/plate-heading'
import { BaseListPlugin } from '@udecode/plate-list'
import { BaseBoldPlugin, BaseItalicPlugin } from '@udecode/plate-basic-marks'
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block'
import { createMermaidDiagramPlugin } from './plate-plugins/MermaidDiagramPlugin'
import { createArchitectureTemplatePlugin } from './plate-plugins/ArchitectureTemplatePlugin'
import { createAPIDocumentationPlugin } from './plate-plugins/APIDocumentationPlugin'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Layers, 
  Diagram, 
  Globe, 
  Code,
  Database,
  Server,
  Sparkles
} from 'lucide-react'

interface DesignEditorProps {
  value: TDescendant[]
  onChange: (value: TDescendant[]) => void
  onAIGenerate?: () => void
  isGenerating?: boolean
}

export default function DesignEditor({ 
  value, 
  onChange, 
  onAIGenerate,
  isGenerating = false
}: DesignEditorProps) {
  // Create specialized editor for design documents
  const editor = useMemo(() => ({
    plugins: [
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseListPlugin,
      BaseBoldPlugin,
      BaseItalicPlugin,
      BaseCodeBlockPlugin,
      createMermaidDiagramPlugin(),
      createArchitectureTemplatePlugin(),
      createAPIDocumentationPlugin(),
    ],
  }), [])

  const insertMermaidDiagram = (type: string) => {
    // TODO: Implement mermaid diagram insertion
    console.log('Insert mermaid diagram:', type)
  }

  const insertArchitectureTemplate = (type: string) => {
    // TODO: Implement architecture template insertion
    console.log('Insert architecture template:', type)
  }

  const insertAPIDocumentation = () => {
    // TODO: Implement API documentation insertion
    console.log('Insert API documentation')
  }

  const generateFromRequirements = () => {
    // TODO: Generate design from requirements
    console.log('Generate design from requirements')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Design-specific toolbar */}
      <div className="border-b p-3 bg-green-50 dark:bg-green-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              设计文档编辑器
            </h3>
            <div className="text-xs text-green-600 dark:text-green-300">
              架构设计 • 组件图 • API 文档
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onAIGenerate}
              disabled={isGenerating}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              AI 生成设计
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={generateFromRequirements}
            >
              <Code className="mr-2 h-4 w-4" />
              从需求生成
            </Button>
          </div>
        </div>

        {/* Specialized tools for design */}
        <div className="flex items-center space-x-2 mt-3">
          {/* Diagram tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMermaidDiagram('flowchart')}
              className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <Diagram className="mr-2 h-4 w-4" />
              流程图
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMermaidDiagram('sequence')}
              className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
            >
              <Server className="mr-2 h-4 w-4" />
              时序图
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertMermaidDiagram('class')}
              className="text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900"
            >
              <Database className="mr-2 h-4 w-4" />
              类图
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Architecture tools */}
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => insertArchitectureTemplate('layered')}
              className="text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900"
            >
              <Layers className="mr-2 h-4 w-4" />
              架构模板
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={insertAPIDocumentation}
              className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
            >
              <Globe className="mr-2 h-4 w-4" />
              API 文档
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="text-xs text-muted-foreground">
            快捷键: Ctrl+D (图表) • Ctrl+A (架构) • Ctrl+P (API)
          </div>
        </div>
      </div>

      {/* Editor content */}
      <div className="flex-1 overflow-auto">
        <PlateProvider>
          <Plate
            value={value}
            onChange={onChange}
          >
            <div className="p-6 max-w-5xl mx-auto">
              {value.length === 0 || (value.length === 1 && value[0].children?.[0]?.text === '') ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <Layers className="h-16 w-16 mx-auto text-green-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">开始编写设计文档</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    使用架构图、组件设计和 API 文档来描述技术实现方案
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button onClick={() => insertArchitectureTemplate('layered')} variant="outline">
                      <Layers className="mr-2 h-4 w-4" />
                      架构模板
                    </Button>
                    <Button onClick={() => insertMermaidDiagram('flowchart')} variant="outline">
                      <Diagram className="mr-2 h-4 w-4" />
                      添加图表
                    </Button>
                    <Button onClick={onAIGenerate} disabled={isGenerating}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI 生成设计
                    </Button>
                  </div>
                </div>
              ) : (
                <PlateContent
                  className="min-h-[500px] prose prose-sm max-w-none focus:outline-none
                           prose-headings:font-semibold prose-headings:text-foreground
                           prose-p:text-foreground prose-p:leading-relaxed
                           prose-li:text-foreground prose-strong:text-foreground
                           prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:rounded
                           prose-pre:bg-muted prose-pre:border prose-pre:p-4
                           prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4
                           prose-table:border-collapse prose-th:border prose-td:border prose-th:p-2 prose-td:p-2"
                  placeholder="开始编写设计文档..."
                />
              )}
            </div>
          </Plate>
        </PlateProvider>
      </div>
    </div>
  )
}