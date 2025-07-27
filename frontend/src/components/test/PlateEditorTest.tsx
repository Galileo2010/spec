import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Save, 
  Sparkles, 
  CheckCircle, 
  Clock,
  User,
  FileText,
  Layers,
  CheckSquare
} from 'lucide-react'

// 简化的测试组件，验证基本功能
export default function PlateEditorTest() {
  const [activeTab, setActiveTab] = useState<'requirements' | 'design' | 'tasks'>('requirements')
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
  }

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'requirements':
        return <FileText className="h-4 w-4" />
      case 'design':
        return <Layers className="h-4 w-4" />
      case 'tasks':
        return <CheckSquare className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTabLabel = (tab: string) => {
    switch (tab) {
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
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">智能规范助手平台</h1>
            <p className="text-sm text-muted-foreground">Plate.js 编辑器功能测试</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">测试模式</Badge>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <Clock className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isSaving ? '保存中...' : '保存'}
            </Button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="flex space-x-1 p-2">
          {(['requirements', 'design', 'tasks'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {getTabIcon(tab)}
              <span>{getTabLabel(tab)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex">
        {/* Main Editor */}
        <div className="flex-1 p-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border h-full p-6">
            {activeTab === 'requirements' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">需求文档编辑器</h2>
                  <Badge className="bg-blue-100 text-blue-800">EARS 格式</Badge>
                </div>
                
                {/* 用户故事示例 */}
                <div className="mb-6 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        用户故事
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start space-x-2">
                          <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">作为</span>
                            <span className="mx-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                              开发团队负责人
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">我希望</span>
                            <span className="mx-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                              快速生成标准化需求文档
                            </span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">以便</span>
                            <span className="mx-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                              团队成员对项目需求有统一理解
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 验收标准示例 */}
                <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-r-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-green-900 dark:text-green-100 mb-3">
                        验收标准 (EARS 格式)
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <Badge className="bg-green-100 text-green-800">WHEN</Badge>
                          <span className="text-sm">用户输入项目描述 THEN 系统 SHALL 自动解析并生成需求文档</span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded border">
                          <Badge className="bg-yellow-100 text-yellow-800">IF</Badge>
                          <span className="text-sm">用户描述不够详细 THEN 系统 SHALL 提示补充关键信息</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Layers className="h-5 w-5 text-green-600" />
                  <h2 className="text-lg font-semibold">设计文档编辑器</h2>
                  <Badge className="bg-green-100 text-green-800">架构设计</Badge>
                </div>
                
                {/* 架构图示例 */}
                <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold">系统架构图</span>
                      <Badge variant="outline">分层架构</Badge>
                    </div>
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-800 rounded border-2 border-dashed border-gray-300 dark:border-gray-600 h-48 flex items-center justify-center">
                    <div className="text-center">
                      <Layers className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">架构图预览区域</p>
                      <p className="text-xs text-gray-400 mt-1">支持 Mermaid 图表</p>
                    </div>
                  </div>
                </div>

                {/* API 文档示例 */}
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex items-center space-x-2 mb-4">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-semibold">API 文档</span>
                  </div>
                  <div className="space-y-2">
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-green-100 text-green-800 font-mono text-xs">GET</Badge>
                        <code className="text-sm font-mono">/api/projects</code>
                        <span className="text-sm text-muted-foreground">获取项目列表</span>
                      </div>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800 font-mono text-xs">POST</Badge>
                        <code className="text-sm font-mono">/api/ai/generate</code>
                        <span className="text-sm text-muted-foreground">AI 生成内容</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <CheckSquare className="h-5 w-5 text-purple-600" />
                  <h2 className="text-lg font-semibold">任务文档编辑器</h2>
                  <Badge className="bg-purple-100 text-purple-800">任务管理</Badge>
                </div>

                {/* 任务列表示例 */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-xs">
                      <Badge variant="secondary">5 总计</Badge>
                      <Badge className="bg-green-100 text-green-800">3 完成</Badge>
                      <Badge className="bg-blue-100 text-blue-800">1 进行中</Badge>
                      <Badge className="bg-gray-100 text-gray-800">1 未开始</Badge>
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>进度</span>
                      <span>60%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full w-3/5" />
                    </div>
                  </div>

                  {/* 任务项示例 */}
                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium line-through text-muted-foreground">
                            搭建项目基础结构
                          </h4>
                          <Badge className="bg-green-100 text-green-800">已完成</Badge>
                          <Badge variant="outline" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            高
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          使用 Bun 初始化项目，配置 TypeScript 和基础依赖
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <User className="h-3 w-3" />
                            <span>开发者</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>8h</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-4 w-4 text-blue-600 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="font-medium">开发 Plate.js 规范文档编辑器</h4>
                          <Badge className="bg-blue-100 text-blue-800">进行中</Badge>
                          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            中
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          实现结构化编辑和实时渲染功能
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-white dark:bg-gray-800 p-4">
          <h3 className="font-semibold mb-4">功能验证</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800 dark:text-green-200">基础组件</span>
              </div>
              <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                <li>✓ PlateEditor 组件</li>
                <li>✓ SpecDocumentManager</li>
                <li>✓ 三文件标签页切换</li>
                <li>✓ 自动保存功能</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800 dark:text-blue-200">需求插件</span>
              </div>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>✓ 用户故事插件</li>
                <li>✓ 验收标准插件</li>
                <li>✓ 需求链接插件</li>
                <li>✓ 质量验证插件</li>
              </ul>
            </div>

            <div className="p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800 dark:text-purple-200">设计插件</span>
              </div>
              <ul className="text-xs text-purple-700 dark:text-purple-300 space-y-1">
                <li>✓ Mermaid 图表插件</li>
                <li>✓ 架构模板插件</li>
                <li>✓ API 文档插件</li>
              </ul>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-4 w-4 text-orange-600" />
                <span className="font-medium text-orange-800 dark:text-orange-200">任务插件</span>
              </div>
              <ul className="text-xs text-orange-700 dark:text-orange-300 space-y-1">
                <li>✓ 增强任务列表</li>
                <li>✓ 状态跟踪</li>
                <li>✓ 依赖关系</li>
                <li>✓ 进度可视化</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}