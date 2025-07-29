import axios from 'axios'
// Types
interface User {
  id: string
  email: string
  name: string
  createdAt: string
  updatedAt: string
}

interface Project {
  id: string
  name: string
  description?: string
  userId: string
  createdAt: string
  updatedAt: string
}

interface SpecFiles {
  requirements?: any[]
  design?: any[]
  tasks?: any[]
}

interface LoginRequest {
  email: string
  password: string
}

interface RegisterRequest {
  email: string
  name: string
  password: string
}

interface CreateProjectRequest {
  name: string
  description?: string
}

interface UpdateProjectRequest {
  name?: string
  description?: string
}

interface GenerateSpecRequest {
  input: string
  specType: 'requirements' | 'design' | 'tasks'
}

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  async login(data: LoginRequest): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', data)
    return response.data
  },

  async register(data: RegisterRequest): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', data)
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data
  },
}

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const response = await api.get('/projects')
    return response.data
  },

  async getProject(id: string): Promise<Project> {
    const response = await api.get(`/projects/${id}`)
    return response.data
  },

  async createProject(data: CreateProjectRequest): Promise<Project> {
    const response = await api.post('/projects', data)
    return response.data
  },

  async updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data)
    return response.data
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`)
  },

  async getSpecs(projectId: string): Promise<SpecFiles> {
    const response = await api.get(`/projects/${projectId}/specs`)
    return response.data
  },

  async updateSpecs(projectId: string, specs: SpecFiles): Promise<void> {
    await api.put(`/projects/${projectId}/specs`, specs)
  },

  async updateSpecFile(
    projectId: string, 
    specType: 'requirements' | 'design' | 'tasks', 
    content: any[]
  ): Promise<void> {
    await api.put(`/projects/${projectId}/specs/${specType}`, { content })
  },
}

export const aiService = {
  async generateSpec(data: GenerateSpecRequest): Promise<any[]> {
    const response = await api.post('/ai/generate', data)
    return response.data.content
  },

  async analyzeSpec(content: any[], specType: string): Promise<any> {
    const response = await api.post('/ai/analyze', { content, specType })
    return response.data
  },

  async validateConsistency(specs: SpecFiles): Promise<any> {
    const response = await api.post('/ai/validate', specs)
    return response.data
  },
}

// Alias for backward compatibility
export const specService = projectService

// Export types
export type { User, Project, SpecFiles, LoginRequest, RegisterRequest, CreateProjectRequest, UpdateProjectRequest, GenerateSpecRequest }