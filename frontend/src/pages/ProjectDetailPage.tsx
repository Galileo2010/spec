import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProject } from '@/contexts/ProjectContext'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Settings, Zap } from 'lucide-react'
import PlateEditor from '@/components/PlateEditor'

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { currentProject, currentSpecs, selectProject, isLoading } = useProject()

  useEffect(() => {
    if (id) {
      selectProject(id)
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">项目未找到</h3>
          <p className="text-muted-foreground">请检查项目ID是否正确</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* 项目头部 */}
      <div className="border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{currentProject.name}</h1>
            <p className="text-muted-foreground">
              {currentProject.description || '暂无描述'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Zap className="mr-2 h-4 w-4" />
              AI 生成
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              设置
            </Button>
          </div>
        </div>
      </div>

      {/* 规范文档编辑器 */}
      <div className="flex-1 overflow-hidden">
        <Tabs defaultValue="requirements" className="h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
            <TabsTrigger value="requirements">需求文档</TabsTrigger>
            <TabsTrigger value="design">设计文档</TabsTrigger>
            <TabsTrigger value="tasks">任务文档</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden px-6 pb-6">
            <TabsContent value="requirements" className="h-full mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>需求文档 (Requirements)</CardTitle>
                  <CardDescription>
                    定义项目的功能需求和验收标准
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-full pb-6">
                  <PlateEditor
                    specType="requirements"
                    initialValue={currentSpecs?.requirements || []}
                    projectId={currentProject.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="design" className="h-full mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>设计文档 (Design)</CardTitle>
                  <CardDescription>
                    技术架构设计和实现方案
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-full pb-6">
                  <PlateEditor
                    specType="design"
                    initialValue={currentSpecs?.design || []}
                    projectId={currentProject.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="h-full mt-4">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>任务文档 (Tasks)</CardTitle>
                  <CardDescription>
                    具体的开发任务和实施计划
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-full pb-6">
                  <PlateEditor
                    specType="tasks"
                    initialValue={currentSpecs?.tasks || []}
                    projectId={currentProject.id}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}