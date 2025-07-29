import { createContext, useContext, ReactNode, useState, useCallback } from 'react'
import { Project, SpecFiles, CreateProjectRequest, UpdateProjectRequest, projectService, specService } from '@/lib/api'

interface ProjectContextType {
  // Project management
  projects: Project[]
  currentProject: Project | null
  isLoading: boolean

  // Project operations
  loadProjects: () => Promise<void>
  createProject: (data: CreateProjectRequest) => Promise<Project>
  updateProject: (id: string, data: UpdateProjectRequest) => Promise<Project>
  deleteProject: (id: string) => Promise<void>
  setCurrentProject: (project: Project | null) => void

  // Spec operations
  getSpecs: (projectId: string) => Promise<SpecFiles>
  updateSpecs: (projectId: string, specs: SpecFiles) => Promise<void>
  getProject: (projectId: string) => Promise<Project>
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([])
  const [currentProject, setCurrentProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Load all projects for the current user
  const loadProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      const projectList = await projectService.getProjects()
      setProjects(projectList)
    } catch (error) {
      console.error('Failed to load projects:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Create a new project
  const createProject = useCallback(async (data: CreateProjectRequest): Promise<Project> => {
    try {
      const newProject = await projectService.createProject(data)
      setProjects(prev => [...prev, newProject])
      return newProject
    } catch (error) {
      console.error('Failed to create project:', error)
      throw error
    }
  }, [])

  // Update an existing project
  const updateProject = useCallback(async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    try {
      const updatedProject = await projectService.updateProject(id, data)
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p))
      if (currentProject?.id === id) {
        setCurrentProject(updatedProject)
      }
      return updatedProject
    } catch (error) {
      console.error('Failed to update project:', error)
      throw error
    }
  }, [currentProject])

  // Delete a project
  const deleteProject = useCallback(async (id: string): Promise<void> => {
    try {
      await projectService.deleteProject(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      if (currentProject?.id === id) {
        setCurrentProject(null)
      }
    } catch (error) {
      console.error('Failed to delete project:', error)
      throw error
    }
  }, [currentProject])

  // Get project by ID
  const getProject = useCallback(async (projectId: string): Promise<Project> => {
    try {
      const project = await projectService.getProject(projectId)
      return project
    } catch (error) {
      console.error('Failed to get project:', error)
      throw error
    }
  }, [])

  // Get specs for a project
  const getSpecs = useCallback(async (projectId: string): Promise<SpecFiles> => {
    try {
      const specs = await specService.getSpecs(projectId)
      return specs
    } catch (error) {
      console.error('Failed to get specs:', error)
      throw error
    }
  }, [])

  // Update specs for a project
  const updateSpecs = useCallback(async (projectId: string, specs: SpecFiles): Promise<void> => {
    try {
      await specService.updateSpecs(projectId, specs)
    } catch (error) {
      console.error('Failed to update specs:', error)
      throw error
    }
  }, [])

  const value: ProjectContextType = {
    projects,
    currentProject,
    isLoading,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setCurrentProject,
    getSpecs,
    updateSpecs,
    getProject,
  }

  return (
    <ProjectContext.Provider value={value}>
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