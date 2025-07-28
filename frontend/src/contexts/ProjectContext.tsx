import { createContext, useContext, ReactNode } from 'react'

interface Project {
  id: string
  name: string
  description: string
  createdAt: string
  updatedAt: string
}

interface ProjectContextType {
  getSpecs: (projectId: string) => Promise<any>
  updateSpecs: (projectId: string, specs: any) => Promise<void>
  getProject: (projectId: string) => Promise<Project>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const getSpecs = async (projectId: string) => {
    // 模拟 API 调用
    return {
      requirements: [
        {
          type: 'paragraph',
          children: [{ text: '这是需求文档的示例内容。' }]
        }
      ],
      design: [
        {
          type: 'paragraph',
          children: [{ text: '这是设计文档的示例内容。' }]
        }
      ],
      tasks: [
        {
          type: 'paragraph',
          children: [{ text: '这是任务文档的示例内容。' }]
        }
      ]
    }
  }

  const updateSpecs = async (projectId: string, specs: any) => {
    // 模拟 API 调用
    console.log('Updating specs for project:', projectId, specs)
  }

  const getProject = async (projectId: string): Promise<Project> => {
    // 模拟 API 调用
    return {
      id: projectId,
      name: '测试项目',
      description: '用于功能验证的测试项目',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  }

  return (
    <ProjectContext.Provider value={{ getSpecs, updateSpecs, getProject }}>
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider')
  }
  return context
}