import { Hono } from 'hono'
import { z } from 'zod'
import { CreateProjectSchema, UpdateProjectSchema } from '@shared/types'
import { ProjectService } from '../services/projectService'

export const projectRoutes = new Hono()

// Get all projects for user
projectRoutes.get('/', async (c) => {
  const user = c.get('user')
  
  try {
    const projects = await ProjectService.getProjects(user.id)
    return c.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return c.json({ error: 'Failed to fetch projects' }, 500)
  }
})

// Get single project
projectRoutes.get('/:id', async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('id')
  
  try {
    const project = await ProjectService.getProject(projectId, user.id)
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404)
    }
    
    return c.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return c.json({ error: 'Failed to fetch project' }, 500)
  }
})

// Create project
projectRoutes.post('/', async (c) => {
  try {
    const user = c.get('user')
    const body = await c.req.json()
    const data = CreateProjectSchema.parse(body)
    
    const project = await ProjectService.createProject(data, user.id)
    
    return c.json(project, 201)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('Error creating project:', error)
    return c.json({ error: 'Failed to create project' }, 500)
  }
})

// Update project
projectRoutes.put('/:id', async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    const body = await c.req.json()
    const updates = UpdateProjectSchema.parse(body)
    
    const project = await ProjectService.updateProject(projectId, updates, user.id)
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404)
    }
    
    return c.json(project)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('Error updating project:', error)
    return c.json({ error: 'Failed to update project' }, 500)
  }
})

// Delete project
projectRoutes.delete('/:id', async (c) => {
  try {
    const user = c.get('user')
    const projectId = c.req.param('id')
    
    const success = await ProjectService.deleteProject(projectId, user.id)
    
    if (!success) {
      return c.json({ error: 'Project not found' }, 404)
    }
    
    return c.json({ message: 'Project deleted successfully' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return c.json({ error: 'Failed to delete project' }, 500)
  }
})