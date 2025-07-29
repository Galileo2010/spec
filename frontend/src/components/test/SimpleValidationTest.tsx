import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { DocumentExportService } from '@/services/documentExportService'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  RefreshCw,
  FileText,
  Download,
  Code
} from 'lucide-react'

interface TestResult {
  name: string
  status: 'success' | 'error' | 'warning'
  message: string
  details?: string
}

export default function SimpleValidationTest() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const mockContent = [
    {
      type: 'h1',
      children: [{ text: '测试文档' }]
    },
    {
      type: 'p',
      children: [{ text: '这是一个测试段落，包含 ' }, { text: '粗体文本', bold: true }, { text: '。' }]
    },
    {
      type: 'ul',
      children: [
        { type: 'li', children: [{ text: '列表项 1' }] },
        { type: 'li', children: [{ text: '列表项 2' }] }
      ]
    }
  ]

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    try {
      // 测试 1: Markdown 转换
      const markdown = PlateMarkdownConverter.plateToMarkdown(mockContent)
      results.push({
        name: 'Plate.js → Markdown 转换',
        status: markdown.length > 0 ? 'success' : 'error',
        message: markdown.length > 0 ? '转换成功' : '转换失败',
        details: `生成了 ${markdown.length} 字符的 Markdown`
      })

      // 测试 2: 反向转换
      const plateContent = PlateMarkdownConverter.markdownToPlate(markdown)
      results.push({
        name: 'Markdown → Plate.js 转换',
        status: plateContent.length > 0 ? 'success' : 'error',
        message: plateContent.length > 0 ? '转换成功' : '转换失败',
        details: `生成了 ${plateContent.length} 个节点`
      })

      // 测试 3: 文档统计
      const stats = PlateMarkdownConverter.getDocumentStats(mockContent)
      results.push({
        name: '文档统计功能',
        status: stats.wordCount > 0 ? 'success' : 'warning',
        message: `统计完成: ${stats.wordCount} 词`,
        details: `字符: ${stats.characterCount}, 节点: ${stats.nodeCount}`
      })

      // 测试 4: 导出功能
      const exportResult = await DocumentExportService.exportToMarkdown(mockContent, {
        title: '测试文档',
        author: '测试用户',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        specType: 'requirements',
        projectId: 'test'
      })
      
      results.push({
        name: '文档导出功能',
        status: exportResult.success ? 'success' : 'error',
        message: exportResult.success ? '导出成功' : '导出失败',
        details: exportResult.success ? `文件: ${exportResult.filename}` : exportResult.error
      })

    } catch (error) {
      results.push({
        name: '测试执行',
        status: 'error',
        message: '测试过程中发生错误',
        details: error instanceof Error ? error.message : '未知错误'
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const errorCount = testResults.filter(r => r.status === 'error').length
  const warningCount = testResults.filter(r => r.status === 'warning').length

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Task 13 功能验证</h2>
            <p className="text-muted-foreground">规范文档管理界面核心功能测试</p>
          </div>
          <Button onClick={runTests} disabled={isRunning}>
            {isRunning ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isRunning ? '测试中...' : '重新测试'}
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{testResults.length}</div>
                <div className="text-sm text-muted-foreground">总测试数</div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">{successCount}</div>
                <div className="text-sm text-green-600">通过</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
                <div className="text-sm text-yellow-600">警告</div>
              </div>
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">{errorCount}</div>
                <div className="text-sm text-red-600">失败</div>
              </div>
            </div>
          </div>
        </div>

        {/* 测试结果 */}
        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border p-4">
              <div className="flex items-start space-x-3">
                {getStatusIcon(result.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{result.name}</span>
                    <Badge className={getStatusColor(result.status)}>
                      {result.status === 'success' ? '通过' : 
                       result.status === 'error' ? '失败' : '警告'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  {result.details && (
                    <p className="text-xs text-muted-foreground mt-1 font-mono bg-muted/50 p-2 rounded">
                      {result.details}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 功能演示 */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg border p-6">
          <h3 className="font-semibold mb-4">功能演示</h3>
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const markdown = PlateMarkdownConverter.plateToMarkdown(mockContent)
                console.log('Markdown 输出:', markdown)
              }}
            >
              <Code className="mr-2 h-4 w-4" />
              测试转换功能
            </Button>
            
            <Button
              variant="outline"
              onClick={async () => {
                const result = await DocumentExportService.exportToMarkdown(mockContent)
                if (result.success) {
                  DocumentExportService.downloadFile(result)
                }
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              测试导出功能
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}