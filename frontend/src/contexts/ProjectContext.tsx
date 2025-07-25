import React, { createContext, useContext, useState } from 'react'
import { Project, SpecFiles } from '@shared/types'
import { projectService } from '@/lib/api'

interface ProjectContextType {
  projects: Project[]
  currentProject: Project | null
  currentSpecs: SpecFiles | null
  isLoading: boolean
  loadProjects: () => Promise<void>
  selectProject: (projectId: string) => Promise<void>
  createProject: (name: string, description?: string) => Promise<Project>
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (projectId: string) => Promise<void>
  updateSpecs: (projectId: string, specs: SpecFiles) => Promise<void>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [currentSpecs, setCurrentSpecs] = useState<SpecFiles | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const loadProjects = async () => {
    setIsLoading(true)
    try {
      const projectList = await projectService.getProjects()
      setProjects(projectList)
    } finally {
      setIsLoading(false)
    }
  }

  const selectProject = async (projectId: string) => {
    setIsLoading(true)
    try {
      const project = await projectService.getProject(projectId)
      const specs = await projectService.getSpecs(projectId)
      setCurrentProject(project)
      setCurrentSpecs(specs)
    } finally {
      setIsLoading(false)
    }
  }

  const createProject = async (name: string, description?: string) => {
    const project = await projectService.createProject({ name, description })
    setProjects(prev => [...prev, project])
    return project
  }

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    const updatedProject = await projectService.updateProject(projectId, updates)
    setProjects(prev => prev.map(p => p.id === projectId ? updatedProject : p))
    if (currentProject?.id === projectId) {
      setCurrentProject(updatedProject)
    }
  }

  const deleteProject = async (projectId: string) => {
    await projectService.deleteProject(projectId)
    setProjects(prev => prev.filter(p => p.id !== projectId))
    if (currentProject?.id === projectId) {
      setCurrentProject(null)
      setCurrentSpecs(null)
    }
  }

  const updateSpecs = async (projectId: string, specs: SpecFiles) => {
    await projectService.updateSpecs(projectId, specs)
    if (currentProject?.id === projectId) {
      setCurrentSpecs(specs)
    }
  }

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      currentSpecs,
      isLoading,
      loadProjects,
      selectProject,
      createProject,
      updateProject,
      deleteProject,
      updateSpecs,
    }}>
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