import { nanoid } from 'nanoid'
import { promises as fs } from 'fs'
import { join } from 'path'
import { db } from '../db/init'
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@shared/types'

export class ProjectService {
  static async getProjects(userId: string): Promise<Project[]> {
    const stmt = db.prepare(`
      SELECT id, name, description, user_id, created_at, updated_at
      FROM projects 
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `)
    
    const projects = stmt.all(userId) as any[]
    
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      userId: project.user_id,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
    }))
  }

  static async getProject(projectId: string, userId: string): Promise<Project | null> {
    const stmt = db.prepare(`
      SELECT id, name, description, user_id, created_at, updated_at
      FROM projects 
      WHERE id = ? AND user_id = ?
    `)
    
    const project = stmt.get(projectId, userId) as any
    
    if (!project) {
      return null
    }
    
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      userId: project.user_id,
      createdAt: new Date(project.created_at),
      updatedAt: new Date(project.updated_at),
    }
  }

  static async createProject(data: CreateProjectRequest, userId: string): Promise<Project> {
    const { name, description } = data
    const projectId = nanoid()
    
    const stmt = db.prepare(`
      INSERT INTO projects (id, name, description, user_id)
      VALUES (?, ?, ?, ?)
    `)
    
    stmt.run(projectId, name, description || null, userId)
    
    // Create project directory for spec files
    const projectDir = join(process.cwd(), 'data', 'projects', projectId)
    await fs.mkdir(projectDir, { recursive: true })
    
    return {
      id: projectId,
      name,
      description,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  }

  static async updateProject(
    projectId: string, 
    updates: UpdateProjectRequest, 
    userId: string
  ): Promise<Project | null> {
    // Check if project exists and belongs to user
    const existingProject = await this.getProject(projectId, userId)
    if (!existingProject) {
      return null
    }
    
    // Build update query dynamically
    const updateFields = []
    const updateValues = []
    
    if (updates.name !== undefined) {
      updateFields.push('name = ?')
      updateValues.push(updates.name)
    }
    
    if (updates.description !== undefined) {
      updateFields.push('description = ?')
      updateValues.push(updates.description)
    }
    
    updateFields.push('updated_at = CURRENT_TIMESTAMP')
    updateValues.push(projectId, userId)
    
    const updateStmt = db.prepare(`
      UPDATE projects 
      SET ${updateFields.join(', ')}
      WHERE id = ? AND user_id = ?
    `)
    
    updateStmt.run(...updateValues)
    
    // Return updated project
    return await this.getProject(projectId, userId)
  }

  static async deleteProject(projectId: string, userId: string): Promise<boolean> {
    // Check if project exists and belongs to user
    const existingProject = await this.getProject(projectId, userId)
    if (!existingProject) {
      return false
    }
    
    // Delete project from database
    const deleteStmt = db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?')
    deleteStmt.run(projectId, userId)
    
    // Delete project directory
    const projectDir = join(process.cwd(), 'data', 'projects', projectId)
    
    try {
      await fs.rm(projectDir, { recursive: true, force: true })
    } catch (error) {
      console.warn(`Failed to delete project directory: ${projectDir}`, error)
    }
    
    return true
  }

  static async projectExists(projectId: string, userId: string): Promise<boolean> {
    const stmt = db.prepare('SELECT id FROM projects WHERE id = ? AND user_id = ?')
    const project = stmt.get(projectId, userId)
    return !!project
  }
}