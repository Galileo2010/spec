import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProject } from '@/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Zap, Users, BarChart3 } from 'lucide-react'

export default function HomePage() {
  const { projects, loadProjects } = useProject()

  useEffect(() => {
    loadProjects()
  }, [])

  const recentProjects = projects.slice(0, 3)

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">欢迎使用智能规范助手平台</h1>
        <p className="text-muted-foreground">
          通过 AI 驱动的规范生成，提升团队开发效率
        </p>
      </div>

      {/* 快速操作 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建新项目</CardTitle>
            <Plus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/projects">
                <Plus className="mr-2 h-4 w-4" />
                新建项目
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              已创建的项目
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI 生成</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">∞</div>
            <p className="text-xs text-muted-foreground">
              智能规范生成
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 最近项目 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">最近项目</h2>
          <Button variant="outline" asChild>
            <Link to="/projects">查看全部</Link>
          </Button>
        </div>

        {recentProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>
                    {project.description || '暂无描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      创建于 {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link to={`/projects/${project.id}`}>
                        打开
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">还没有项目</h3>
              <p className="text-muted-foreground text-center mb-4">
                创建您的第一个项目，开始使用 AI 生成规范文档
              </p>
              <Button asChild>
                <Link to="/projects">
                  <Plus className="mr-2 h-4 w-4" />
                  创建项目
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 功能特性 */}
      <div>
        <h2 className="text-xl font-semibold mb-4">平台特性</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI 驱动生成</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                使用先进的 AI 技术，从自然语言描述自动生成标准化的需求、设计和任务文档
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-primary mb-2" />
              <CardTitle>团队协作</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                支持多人实时编辑，版本控制和评审流程，确保团队对项目规范的统一理解
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>智能分析</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                提供需求完整性检查、设计合理性评估和任务依赖分析，提升项目质量
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}