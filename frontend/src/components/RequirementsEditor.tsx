import { useMemo } from 'react'
import { PlateProvider, Plate, PlateContent, TDescendant } from '@udecode/plate-common'
import { BaseParagraphPlugin } from '@udecode/plate-basic-elements'
import { BaseHeadingPlugin } from '@udecode/plate-heading'
import { BaseListPlugin } from '@udecode/plate-list'
import { BaseBoldPlugin, BaseItalicPlugin } from '@udecode/plate-basic-marks'
import { BaseCodeBlockPlugin } from '@udecode/plate-code-block'
import { createUserStoryPlugin } from './plate-plugins/UserStoryPlugin'
import { createAcceptanceCriteriaPlugin } from './plate-plugins/AcceptanceCriteriaPlugin'
import { createRequirementLinkPlugin } from './plate-plugins/RequirementLinkPlugin'
import { createRequirementValidationPlugin } from './plate-plugins/RequirementValidationPlugin'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  User,
  CheckSquare,
  Link,
  Shield,
  Plus,
  Sparkles
} from 'lucide-react'

interface RequirementsEditorProps {
  value: TDescendant[]
  onChange: (value: TDescendant[]) => void
  onAIGenerate?: () => void
  isGenerating?: boolean
}

export default function RequirementsEditor({
  value,
  onChange,
  onAIGenerate,
  isGenerating = false
}: RequirementsEditorProps) {
  // Create specialized editor for requirements
  const editor = useMemo(() => ({
    plugins: [
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseListPlugin,
      BaseBoldPlugin,
      BaseItalicPlugin,
      BaseCodeBlockPlugin,
      createUserStoryPlugin(),
      createAcceptanceCriteriaPlugin(),
      createRequirementLinkPlugin(),
      createRequirementValidationPlugin(),
    ],
  }), [])

  const insertUserStory = () => {
    // TODO: Implement user story insertion
    console.log('Insert user story')
  }

  const insertAcceptanceCriteria = () => {
    // TODO: Implement acceptance criteria insertion
    console.log('Insert acceptance criteria')
  }

  const insertRequirementLink = () => {
    // TODO: Implement requirement link insertion
    console.log('Insert requirement link')
  }

  const validateRequirements = () => {
    // TODO: Implement requirements validation
    console.log('Validate requirements')
  }

  return (
    <div className="h-full flex flex-col">
      {/* Requirements-specific toolbar */}
      <div className="border-b p-3 bg-blue-50 dark:bg-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              需求文档编辑器
            </h3>
            <div className="text-xs text-blue-600 dark:text-blue-300">
              EARS 格式 • 用户故事 • 验收标准
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
              AI 生成需求
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={validateRequirements}
            >
              <Shield className="mr-2 h-4 w-4" />
              质量检查
            </Button>
          </div>
        </div>

        {/* Specialized tools for requirements */}
        <div className="flex items-center space-x-2 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={insertUserStory}
            className="text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900"
          >
            <User className="mr-2 h-4 w-4" />
            用户故事
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={insertAcceptanceCriteria}
            className="text-green-600 hover:bg-green-100 dark:hover:bg-green-900"
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            验收标准
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={insertRequirementLink}
            className="text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900"
          >
            <Link className="mr-2 h-4 w-4" />
            需求链接
          </Button>

          <Separator orientation="vertical" className="h-6" />

          <div className="text-xs text-muted-foreground">
            快捷键: Ctrl+U (用户故事) • Ctrl+A (验收标准) • Ctrl+L (链接)
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
            <div className="p-6 max-w-4xl mx-auto">
              {value.length === 0 || (value.length === 1 && value[0].children?.[0]?.text === '') ? (
                <div className="text-center py-12">
                  <div className="mb-4">
                    <User className="h-16 w-16 mx-auto text-blue-300" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">开始编写需求文档</h3>
                  <p className="text-muted-foreground text-sm mb-6">
                    使用结构化的方式编写用户故事和验收标准
                  </p>
                  <div className="flex justify-center space-x-3">
                    <Button onClick={insertUserStory} variant="outline">
                      <User className="mr-2 h-4 w-4" />
                      添加用户故事
                    </Button>
                    <Button onClick={onAIGenerate} disabled={isGenerating}>
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI 生成需求
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
                           prose-blockquote:border-l-4 prose-blockquote:border-muted-foreground prose-blockquote:pl-4"
                  placeholder="开始编写需求文档..."
                />
              )}
            </div>
          </Plate>
        </PlateProvider>
      </div>
    </div>
  )
}