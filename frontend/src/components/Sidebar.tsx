import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useProject } from '@/contexts/ProjectContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  Home, 
  FolderOpen, 
  Plus, 
  FileText, 
  Settings, 
  Zap 
} from 'lucide-react'

export default function Sidebar() {
  const location = useLocation()
  const { projects, loadProjects } = useProject()

  useEffect(() => {
    loadProjects()
  }, [])

  const navigation = [
    { name: '首页', href: '/', icon: Home },
    { name: '项目', href: '/projects', icon: FolderOpen },
  ]

  return (
    <div className="flex w-64 flex-col bg-muted/10 border-r">
      <div className="flex h-16 items-center px-6">
        <Zap className="h-6 w-6 text-primary" />
        <span className="ml-2 text-lg font-semibold">Spec Assistant</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <item.icon className="mr-3 h-4 w-4" />
              {item.name}
            </Link>
          )
        })}

        <div className="pt-4">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              最近项目
            </span>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/projects">
                <Plus className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-1">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                to={`/projects/${project.id}`}
                className="flex items-center rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <FileText className="mr-3 h-4 w-4" />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>

      <div className="border-t p-3">
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <Settings className="mr-2 h-4 w-4" />
          设置
        </Button>
      </div>
    </div>
  )
}