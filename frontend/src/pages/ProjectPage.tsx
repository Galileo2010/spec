import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useProject } from '@/contexts/ProjectContext'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import SpecDocumentManager from '@/components/SpecDocumentManager'
import { ArrowLeft, Settings, Share, Download } from 'lucide-react'

export default function ProjectPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { currentProject, isLoading } = useProject()
  const { toast } = useToast()

  if (!projectId) {
    navigate('/projects')
    return null
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载项目中...</p>
        </div>
      </div>
    )
  }

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">项目未找到</p>
          <Button onClick={() => navigate('/projects')}>
            返回项目列表
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/projects')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回
            </Button>
            <div>
              <h1 className="text-lg font-semibold">{currentProject.name}</h1>
              {currentProject.description && (
                <p className="text-sm text-muted-foreground">
                  {currentProject.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <SpecDocumentManager projectId={projectId} />
      </main>
    </div>
  )
}