import { Hono } from 'hono'
import { z } from 'zod'
import { db } from '../db/init'
import { promises as fs } from 'fs'
import { join } from 'path'

export const specRoutes = new Hono()

// Get all spec files for a project
specRoutes.get('/projects/:projectId/specs', async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('projectId')
  
  // Check if project belongs to user
  const projectStmt = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?')
  const project = projectStmt.get(projectId, user.id)
  
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  
  const projectDir = join(process.cwd(), 'data', 'projects', projectId)
  const specs: any = {}
  
  try {
    // Try to read each spec file
    const specTypes = ['requirements', 'design', 'tasks']
    
    for (const specType of specTypes) {
      const filePath = join(projectDir, `${specType}.json`)
      try {
        const content = await fs.readFile(filePath, 'utf-8')
        specs[specType] = JSON.parse(content)
      } catch (error) {
        // File doesn't exist or is invalid, set empty array
        specs[specType] = []
      }
    }
    
    return c.json(specs)
  } catch (error) {
    console.error('Error reading spec files:', error)
    return c.json({ 
      requirements: [], 
      design: [], 
      tasks: [] 
    })
  }
})

// Get specific spec file
specRoutes.get('/projects/:projectId/specs/:specType', async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('projectId')
  const specType = c.req.param('specType')
  
  if (!['requirements', 'design', 'tasks'].includes(specType)) {
    return c.json({ error: 'Invalid spec type' }, 400)
  }
  
  // Check if project belongs to user
  const projectStmt = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?')
  const project = projectStmt.get(projectId, user.id)
  
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  
  const filePath = join(process.cwd(), 'data', 'projects', projectId, `${specType}.json`)
  
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    const specContent = JSON.parse(content)
    return c.json({ content: specContent })
  } catch (error) {
    // File doesn't exist, return empty array
    return c.json({ content: [] })
  }
})

// Update specific spec file
specRoutes.put('/projects/:projectId/specs/:specType', async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('projectId')
  const specType = c.req.param('specType')
  
  if (!['requirements', 'design', 'tasks'].includes(specType)) {
    return c.json({ error: 'Invalid spec type' }, 400)
  }
  
  // Check if project belongs to user
  const projectStmt = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?')
  const project = projectStmt.get(projectId, user.id)
  
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  
  try {
    const body = await c.req.json()
    const { content } = body
    
    if (!Array.isArray(content)) {
      return c.json({ error: 'Content must be an array' }, 400)
    }
    
    const projectDir = join(process.cwd(), 'data', 'projects', projectId)
    const filePath = join(projectDir, `${specType}.json`)
    
    // Ensure directory exists
    await fs.mkdir(projectDir, { recursive: true })
    
    // Write spec file
    await fs.writeFile(filePath, JSON.stringify(content, null, 2))
    
    // Update project's updated_at timestamp
    const updateStmt = db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    updateStmt.run(projectId)
    
    return c.json({ message: 'Spec file updated successfully' })
  } catch (error) {
    console.error('Error updating spec file:', error)
    return c.json({ error: 'Failed to update spec file' }, 500)
  }
})

// Update multiple spec files at once
specRoutes.put('/projects/:projectId/specs', async (c) => {
  const user = c.get('user')
  const projectId = c.req.param('projectId')
  
  // Check if project belongs to user
  const projectStmt = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?')
  const project = projectStmt.get(projectId, user.id)
  
  if (!project) {
    return c.json({ error: 'Project not found' }, 404)
  }
  
  try {
    const body = await c.req.json()
    const projectDir = join(process.cwd(), 'data', 'projects', projectId)
    
    // Ensure directory exists
    await fs.mkdir(projectDir, { recursive: true })
    
    // Update each spec file that was provided
    const validSpecTypes = ['requirements', 'design', 'tasks']
    
    for (const [specType, content] of Object.entries(body)) {
      if (validSpecTypes.includes(specType) && Array.isArray(content)) {
        const filePath = join(projectDir, `${specType}.json`)
        await fs.writeFile(filePath, JSON.stringify(content, null, 2))
      }
    }
    
    // Update project's updated_at timestamp
    const updateStmt = db.prepare('UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    updateStmt.run(projectId)
    
    return c.json({ message: 'Spec files updated successfully' })
  } catch (error) {
    console.error('Error updating spec files:', error)
    return c.json({ error: 'Failed to update spec files' }, 500)
  }
})