import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  FileText,
  Layers,
  CheckSquare,
  Code,
  Sparkles,
  RefreshCw
} from 'lucide-react'

interface ValidationItem {
  category: string
  name: string
  status: 'success' | 'warning' | 'error'
  description: string
  features?: string[]
}

const VALIDATION_DATA: ValidationItem[] = [
  // 核心编辑器
  {
    category: '核心编辑器',
    name: 'PlateEditor',
    status: 'success',
    description: '增强的 Plate.js 编辑器组件',
    features: ['自动保存', '文档统计', '状态指示', '快捷键支持']
  },
  {
    category: '核心编辑器',
    name: 'SpecDocumentManager',
    status: 'success',
    description: '三文件标签页管理器',
    features: ['需求/设计/任务切换', '状态指示', '导出功能']
  },
  {
    category: '核心编辑器',
    name: 'VersionHistory',
    status: 'success',
    description: '版本历史管理',
    features: ['变更跟踪', '版本恢复', '作者信息']
  },

  // 需求文档插件
  {
    category: '需求文档插件',
    name: 'UserStoryPlugin',
    status: 'success',
    description: '结构化用户故事编辑',
    features: ['角色字段', '功能字段', '价值字段', '可视化界面']
  },
  {
    category: '需求文档插件',
    name: 'AcceptanceCriteriaPlugin',
    status: 'success',
    description: 'EARS 格式验收标准',
    features: ['WHEN条件', 'IF条件', 'GIVEN前提', '动态编辑']
  },
  {
    category: '需求文档插件',
    name: 'RequirementLinkPlugin',
    status: 'success',
    description: '需求交叉引用',
    features: ['引用链接', '依赖关系', '相关需求', '点击导航']
  },
  {
    category: '需求文档插件',
    name: 'RequirementValidationPlugin',
    status: 'success',
    description: '需求质量验证',
    features: ['完整性评分', '清晰度评分', '可测试性评分', '问题识别']
  },

  // 设计文档插件
  {
    category: '设计文档插件',
    name: 'MermaidDiagramPlugin',
    status: 'success',
    description: 'Mermaid 图表支持',
    features: ['多种图表类型', '代码编辑', '实时预览', '导出功能']
  },
  {
    category: '设计文档插件',
    name: 'ArchitectureTemplatePlugin',
    status: 'success',
    description: '架构模板系统',
    features: ['多种架构模式', '组件管理', '连接关系', '模板库']
  },
  {
    category: '设计文档插件',
    name: 'APIDocumentationPlugin',
    status: 'success',
    description: 'API 文档生成',
    features: ['接口定义', '参数管理', '响应示例', 'OpenAPI导出']
  },

  // 任务文档插件
  {
    category: '任务文档插件',
    name: 'TaskListPlugin',
    status: 'success',
    description: '增强任务列表',
    features: ['状态跟踪', '优先级管理', '依赖关系', '进度可视化']
  },

  // UI组件
  {
    category: 'UI组件',
    name: 'Badge & Separator',
    status: 'success',
    description: '基础UI组件',
    features: ['多种样式', '主题支持', '响应式设计', '无障碍支持']
  }
]

export default function ValidationDashboard() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const categories = ['全部', ...Array.from(new Set(VALIDATION_DATA.map(item => item.category)))]
  
  const filteredData = selectedCategory === '全部' 
    ? VALIDATION_DATA 
    : VALIDATION_DATA.filter(item => item.category === selectedCategory)

  const stats = {
    total: VALIDATION_DATA.length,
    success: VALIDATION_DATA.filter(item => item.status === 'success').length,
    warning: VALIDATION_DATA.filter(item => item.status === 'warning').length,
    error: VALIDATION_DATA.filter(item => item.status === 'error').length
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case '需求文档插件':
        return <FileText className="h-4 w-4" />
      case '设计文档插件':
        return <Layers className="h-4 w-4" />
      case '任务文档插件':
        return <CheckSquare className="h-4 w-4" />
      case 'UI组件':
        return <Code className="h-4 w-4" />
      default:
        return <Sparkles className="h-4 w-4" />
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // 模拟刷新
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="border-b bg-white dark:bg-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">功能验证仪表板</h1>
            <p className="text-muted-foreground">智能规范助手平台 - Plate.js 编辑器组件验证</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              刷新验证
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-sm text-muted-foreground">总组件数</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.success}</div>
                <div className="text-sm text-green-600">成功</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{stats.warning}</div>
                <div className="text-sm text-yellow-600">警告</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{stats.error}</div>
                <div className="text-sm text-red-600">错误</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 border-r bg-white dark:bg-gray-800 p-4">
          <h3 className="font-semibold mb-4">组件分类</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {getCategoryIcon(category)}
                <span className="text-sm">{category}</span>
                {category !== '全部' && (
                  <Badge variant="secondary" className="ml-auto">
                    {VALIDATION_DATA.filter(item => item.category === category).length}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid gap-4">
            {filteredData.map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getCategoryIcon(item.category)}
                    <div>
                      <h3 className="font-semibold">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(item.status)}>
                      {getStatusIcon(item.status)}
                      <span className="ml-1">
                        {item.status === 'success' ? '通过' : 
                         item.status === 'warning' ? '警告' : '错误'}
                      </span>
                    </Badge>
                  </div>
                </div>

                {item.features && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">主要功能:</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.features.map((feature, featureIndex) => (
                        <Badge key={featureIndex} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}