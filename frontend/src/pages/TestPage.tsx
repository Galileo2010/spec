import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import SimpleValidationTest from '@/components/test/SimpleValidationTest'
import SimplePlateEditor from '@/components/SimplePlateEditor'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'
import { DocumentExportService } from '@/services/documentExportService'
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  FileText,
  Download,
  Eye,
  Settings
} from 'lucide-react'

type TestMode = 'validation' | 'dashboard' | 'editor' | 'converter' | 'export'

export default function TestPage() {
  const [currentMode, setCurrentMode] = useState<TestMode>('validation')
  const [testResults, setTestResults] = useState<any[]>([])

  // 简单的转换测试
  const testConverter = () => {
    const testContent = [
      {
        type: 'h1',
        children: [{ text: '测试标题' }]
      },
      {
        type: 'p',
        children: [{ text: '这是一个测试段落。' }]
      }
    ]

    try {
      const markdown = PlateMarkdownConverter.plateToMarkdown(testContent)
      const backToPlate = PlateMarkdownConverter.markdownToPlate(markdown)
      
      setTestResults([
        {
          name: 'Plate → Markdown',
          status: 'success',
          result: markdown
        },
        {
          name: 'Markdown → Plate',
          status: 'success',
          result: JSON.stringify(backToPlate, null, 2)
        }
      ])
    } catch (error) {
      setTestResults([
        {
          name: 'Converter Test',
          status: 'error',
          result: error instanceof Error ? error.message : '转换失败'
        }
      ])
    }
  }

  // 导出测试
  const testExport = async () => {
    const testContent = [
      {
        type: 'h1',
        children: [{ text: '测试文档' }]
      },
      {
        type: 'p',
        children: [{ text: '这是一个用于测试导出功能的文档。' }]
      }
    ]

    const metadata = {
      title: '测试文档',
      author: '测试用户',
      createdAt: new Date(),
      updatedAt: new Date(),
      version: '1.0.0',
      specType: 'requirements' as const,
      projectId: 'test-project'
    }

    try {
      const markdownResult = await DocumentExportService.exportToMarkdown(testContent, metadata)
      const htmlResult = await DocumentExportService.exportToHTML(testContent, metadata)
      const jsonResult = await DocumentExportService.exportToJSON(testContent, metadata)

      setTestResults([
        {
          name: 'Markdown Export',
          status: markdownResult.success ? 'success' : 'error',
          result: markdownResult.success ? 'Export successful' : markdownResult.error
        },
        {
          name: 'HTML Export',
          status: htmlResult.success ? 'success' : 'error',
          result: htmlResult.success ? 'Export successful' : htmlResult.error
        },
        {
          name: 'JSON Export',
          status: jsonResult.success ? 'success' : 'error',
          result: jsonResult.success ? 'Export successful' : jsonResult.error
        }
      ])
    } catch (error) {
      setTestResults([
        {
          name: 'Export Test',
          status: 'error',
          result: error instanceof Error ? error.message : '导出失败'
        }
      ])
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    }
  }

  const renderContent = () => {
    switch (currentMode) {
      case 'validation':
        return <SimpleValidationTest />
      case 'dashboard':
        return <SimpleValidationTest />
      case 'editor':
        return (
          <div className="h-full">
            <SimplePlateEditor
              specType="requirements"
              initialValue={[]}
              projectId="test-project"
              onSave={async (content) => {
                console.log('保存内容:', content)
              }}
            />
          </div>
        )
      case 'converter':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">转换功能测试</h2>
              
              <div className="mb-6">
                <Button onClick={testConverter} className="mr-4">
                  <Play className="mr-2 h-4 w-4" />
                  测试转换
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-auto">
                        {result.result}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      case 'export':
        return (
          <div className="p-6">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6">导出功能测试</h2>
              
              <div className="mb-6">
                <Button onClick={testExport} className="mr-4">
                  <Download className="mr-2 h-4 w-4" />
                  测试导出
                </Button>
              </div>

              {testResults.length > 0 && (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        {getStatusIcon(result.status)}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {result.result}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      default:
        return <div>选择一个测试模式</div>
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 导航栏 */}
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Task 13 功能验证测试</h1>
          <div className="flex space-x-2">
            <Button
              variant={currentMode === 'validation' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('validation')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              综合验证
            </Button>
            <Button
              variant={currentMode === 'dashboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('dashboard')}
            >
              <Settings className="mr-2 h-4 w-4" />
              验证仪表板
            </Button>
            <Button
              variant={currentMode === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('editor')}
            >
              <FileText className="mr-2 h-4 w-4" />
              编辑器测试
            </Button>
            <Button
              variant={currentMode === 'converter' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('converter')}
            >
              <Eye className="mr-2 h-4 w-4" />
              转换测试
            </Button>
            <Button
              variant={currentMode === 'export' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentMode('export')}
            >
              <Download className="mr-2 h-4 w-4" />
              导出测试
            </Button>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto">
        {renderContent()}
      </div>
    </div>
  )
}