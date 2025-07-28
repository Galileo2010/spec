import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { DocumentExportService } from '@/services/documentExportService'
import { TDescendant } from '@/utils/plateMarkdownConverter'
import { 
  CheckCircle, 
  XCircle, 
  Download,
  FileText,
  Code,
  Play
} from 'lucide-react'

// 简化的测试数据
const testContent: TDescendant[] = [
  {
    type: 'h1',
    children: [{ text: '测试文档' }]
  },
  {
    type: 'p',
    children: [
      { text: '这是一个 ' },
      { text: '测试段落', bold: true },
      { text: '，包含格式化文本。' }
    ]
  },
  {
    type: 'ul',
    children: [
      { type: 'li', children: [{ text: '列表项 1' }] },
      { type: 'li', children: [{ text: '列表项 2' }] },
      { type: 'li', children: [{ text: '列表项 3' }] }
    ]
  }
]

interface TestResult {
  name: string
  status: 'success' | 'error'
  message: string
  data?: any
}

export default function TestValidation() {
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = async () => {
    setIsRunning(true)
    const results: TestResult[] = []

    // 测试 1: Markdown 转换
    try {
      const markdown = PlateMarkdownConverter.plateToMarkdown(testContent)
      results.push({
        name: 'Plate.js → Markdown 转换',
        status: markdown.length > 0 ? 'success' : 'error',
        message: markdown.length > 0 ? '转换成功' : '转换失败',
        data: markdown
      })
    } catch (error) {
      results.push({
        name: 'Plate.js → Markdown 转换',
        status: 'error',
        message: error instanceof Error ? error.message : '转换异常'
      })
    }

    // 测试 2: 反向转换
    try {
      const markdown = PlateMarkdownConverter.plateToMarkdown(testContent)
      const plateContent = PlateMarkdownConverter.markdownToPlate(markdown)
      results.push({
        name: 'Markdown → Plate.js 转换',
        status: plateContent.length > 0 ? 'success' : 'error',
        message: plateContent.length > 0 ? '转换成功' : '转换失败',
        data: plateContent
      })
    } catch (error) {
      results.push({
        name: 'Markdown → Plate.js 转换',
        status: 'error',
        message: error instanceof Error ? error.message : '转换异常'
      })
    }

    // 测试 3: 文档导出
    try {
      const exportResult = await DocumentExportService.exportToMarkdown(testContent, {
        title: '测试文档',
        author: '测试用户',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        specType: 'requirements',
        projectId: 'test-123'
      })
      
      results.push({
        name: 'Markdown 导出',
        status: exportResult.success ? 'success' : 'error',
        message: exportResult.success ? '导出成功' : '导出失败',
        data: exportResult
      })
    } catch (error) {
      results.push({
        name: 'Markdown 导出',
        status: 'error',
        message: error instanceof Error ? error.message : '导出异常'
      })
    }

    // 测试 4: 文档统计
    try {
      const stats = PlateMarkdownConverter.getDocumentStats(testContent)
      results.push({
        name: '文档统计',
        status: stats.wordCount > 0 ? 'success' : 'error',
        message: `统计完成: ${stats.wordCount} 词, ${stats.characterCount} 字符`,
        data: stats
      })
    } catch (error) {
      results.push({
        name: '文档统计',
        status: 'error',
        message: error instanceof Error ? error.message : '统计异常'
      })
    }

    setTestResults(results)
    setIsRunning(false)
  }

  const downloadTestResult = async () => {
    try {
      const result = await DocumentExportService.exportToMarkdown(testContent, {
        title: '功能验证测试文档',
        author: '系统测试',
        createdAt: new Date(),
        updatedAt: new Date(),
        version: '1.0.0',
        specType: 'requirements',
        projectId: 'validation-test'
      })
      
      if (result.success) {
        DocumentExportService.downloadFile(result)
      }
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    return status === 'success' ? 
      <CheckCircle className="h-4 w-4 text-green-600" /> : 
      <XCircle className="h-4 w-4 text-red-600" />
  }

  const getStatusColor = (status: string) => {
    return status === 'success' ? 
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }

  const successCount = testResults.filter(r => r.status === 'success').length
  const totalCount = testResults.length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">功能验证测试</h1>
              <p className="text-muted-foreground">Task 13 - 规范文档管理界面功能验证</p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={runTests}
                disabled={isRunning}
              >
                <Play className="mr-2 h-4 w-4" />
                {isRunning ? '测试中...' : '开始测试'}
              </Button>
              <Button
                variant="outline"
                onClick={downloadTestResult}
              >
                <Download className="mr-2 h-4 w-4" />
                下载测试文档
              </Button>
            </div>
          </div>

          {/* 测试统计 */}
          {testResults.length > 0 && (
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold">{totalCount}</div>
                    <div className="text-sm text-muted-foreground">总测试数</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{successCount}</div>
                    <div className="text-sm text-green-600">通过</div>
                  </div>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  <div>
                    <div className="text-2xl font-bold text-red-600">{totalCount - successCount}</div>
                    <div className="text-sm text-red-600">失败</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 测试结果 */}
        {testResults.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border">
            <div className="p-4 border-b">
              <h2 className="font-semibold">测试结果</h2>
            </div>
            <div className="p-4">
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                    {getStatusIcon(result.status)}
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{result.name}</span>
                        <Badge className={getStatusColor(result.status)}>
                          {result.status === 'success' ? '通过' : '失败'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                      {result.data && (
                        <details className="mt-2">
                          <summary className="text-xs text-muted-foreground cursor-pointer">
                            查看详细数据
                          </summary>
                          <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 overflow-auto">
                            {typeof result.data === 'string' ? 
                              result.data : 
                              JSON.stringify(result.data, null, 2)
                            }
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 测试数据预览 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border mt-6">
          <div className="p-4 border-b">
            <h2 className="font-semibold">测试数据预览</h2>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <Code className="h-4 w-4 mr-2" />
                  Plate.js 结构
                </h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-48">
                  {JSON.stringify(testContent, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Markdown 输出
                </h3>
                <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-3 rounded overflow-auto max-h-48">
                  {PlateMarkdownConverter.plateToMarkdown(testContent)}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}