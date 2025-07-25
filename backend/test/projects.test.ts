import { describe, it, expect, beforeAll, beforeEach } from 'bun:test'
import { ProjectService } from '../src/services/projectService'
import { UserService } from '../src/services/userService'
import { initDatabase } from '../src/db/init'

describe('Project CRUD Operations', () => {
  let testUserId: string

  beforeAll(async () => {
    await initDatabase()
    
    // Create a test user
    const userData = {
      email: 'project-test@example.com',
      password: 'password123',
      name: 'Project Test User'
    }
    
    const { user } = await UserService.register(userData)
    testUserId = user.id
  })

  it('should create a new project', async () => {
    const projectData = {
      name: 'Test Project',
      description: 'A test project for unit testing'
    }

    const project = await ProjectService.createProject(projectData, testUserId)

    expect(project.name).toBe(projectData.name)
    expect(project.description).toBe(projectData.description)
    expect(project.userId).toBe(testUserId)
    expect(project.id).toBeDefined()
    expect(project.createdAt).toBeInstanceOf(Date)
    expect(project.updatedAt).toBeInstanceOf(Date)
  })

  it('should get all projects for user', async () => {
    // Create another project
    await ProjectService.createProject({
      name: 'Second Test Project',
      description: 'Another test project'
    }, testUserId)

    const projects = await ProjectService.getProjects(testUserId)

    expect(projects.length).toBeGreaterThanOrEqual(2)
    expect(projects.every(p => p.userId === testUserId)).toBe(true)
  })

  it('should get a specific project', async () => {
    const projectData = {
      name: 'Specific Test Project',
      description: 'Project for specific retrieval test'
    }

    const createdProject = await ProjectService.createProject(projectData, testUserId)
    const retrievedProject = await ProjectService.getProject(createdProject.id, testUserId)

    expect(retrievedProject).not.toBeNull()
    expect(retrievedProject?.name).toBe(projectData.name)
    expect(retrievedProject?.id).toBe(createdProject.id)
  })

  it('should return null for non-existent project', async () => {
    const project = await ProjectService.getProject('non-existent-id', testUserId)
    expect(project).toBeNull()
  })

  it('should update a project', async () => {
    const projectData = {
      name: 'Update Test Project',
      description: 'Project for update testing'
    }

    const createdProject = await ProjectService.createProject(projectData, testUserId)
    
    const updates = {
      name: 'Updated Project Name',
      description: 'Updated description'
    }

    const updatedProject = await ProjectService.updateProject(createdProject.id, updates, testUserId)

    expect(updatedProject).not.toBeNull()
    expect(updatedProject?.name).toBe(updates.name)
    expect(updatedProject?.description).toBe(updates.description)
    expect(updatedProject?.id).toBe(createdProject.id)
  })

  it('should return null when updating non-existent project', async () => {
    const updates = { name: 'New Name' }
    const result = await ProjectService.updateProject('non-existent-id', updates, testUserId)
    expect(result).toBeNull()
  })

  it('should delete a project', async () => {
    const projectData = {
      name: 'Delete Test Project',
      description: 'Project for deletion testing'
    }

    const createdProject = await ProjectService.createProject(projectData, testUserId)
    
    const deleteResult = await ProjectService.deleteProject(createdProject.id, testUserId)
    expect(deleteResult).toBe(true)

    // Verify project is deleted
    const retrievedProject = await ProjectService.getProject(createdProject.id, testUserId)
    expect(retrievedProject).toBeNull()
  })

  it('should return false when deleting non-existent project', async () => {
    const result = await ProjectService.deleteProject('non-existent-id', testUserId)
    expect(result).toBe(false)
  })

  it('should check if project exists', async () => {
    const projectData = {
      name: 'Existence Test Project',
      description: 'Project for existence testing'
    }

    const createdProject = await ProjectService.createProject(projectData, testUserId)
    
    const exists = await ProjectService.projectExists(createdProject.id, testUserId)
    expect(exists).toBe(true)

    const notExists = await ProjectService.projectExists('non-existent-id', testUserId)
    expect(notExists).toBe(false)
  })

  it('should not allow access to other users projects', async () => {
    // Create another user
    const otherUserData = {
      email: 'other-user@example.com',
      password: 'password123',
      name: 'Other User'
    }
    
    const { user: otherUser } = await UserService.register(otherUserData)
    
    // Create project with first user
    const projectData = {
      name: 'Private Project',
      description: 'Should not be accessible by other users'
    }
    
    const project = await ProjectService.createProject(projectData, testUserId)
    
    // Try to access with other user
    const retrievedProject = await ProjectService.getProject(project.id, otherUser.id)
    expect(retrievedProject).toBeNull()
    
    // Try to update with other user
    const updateResult = await ProjectService.updateProject(project.id, { name: 'Hacked' }, otherUser.id)
    expect(updateResult).toBeNull()
    
    // Try to delete with other user
    const deleteResult = await ProjectService.deleteProject(project.id, otherUser.id)
    expect(deleteResult).toBe(false)
  })
})