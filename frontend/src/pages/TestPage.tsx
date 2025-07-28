import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import PlateEditorTest from '@/components/test/PlateEditorTest'
import Task13ValidationTest from '@/components/test/Task13ValidationTest'
import ValidationDashboard from '@/components/ValidationDashboard'
import SimpleSpecManager from '@/components/SimpleSpecManager'
import { 
  TestTube, 
  CheckCircle, 
  FileText, 
  Settings 
} from 'lucide-react'

export default function TestPage() {
  const [activeTest, setActiveTest] = useState('simple-manager')

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900">
      {/* 头部 */}
      <div className="border-b bg-white dark:bg-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">功能验证测试页面</h1>
            <p className="text-sm text-muted-foreground">
              智能规范助手平台 - 功能验证和测试
            </p>
          </div>
          <Badge variant="secondary">测试环境</Badge>
        </div>
      </div>

      {/* 测试选项卡 */}
      <Tabs value={activeTest} onValueChange={setActiveTest} className="flex-1 flex flex-col">
        <div className="border-b px-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="simple-manager" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>简化管理器</span>
            </TabsTrigger>
            <TabsTrigger value="plate-editor" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>编辑器测试</span>
            </TabsTrigger>
            <TabsTrigger value="task13-validation" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Task 13 验证</span>
            </TabsTrigger>
            <TabsTrigger value="validation-dashboard" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>验证仪表板</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1">
          <TabsContent value="simple-manager" className="h-full m-0">
            <SimpleSpecManager projectId="test-project-123" />
          </TabsContent>

          <TabsContent value="plate-editor" className="h-full m-0">
            <PlateEditorTest />
          </TabsContent>

          <TabsContent value="task13-validation" className="h-full m-0">
            <Task13ValidationTest />
          </TabsContent>

          <TabsContent value="validation-dashboard" className="h-full m-0">
            <ValidationDashboard />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}