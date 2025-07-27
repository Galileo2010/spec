import { describe, it, expect, beforeAll } from 'bun:test'
import { TasksService } from '../src/services/tasksService'

describe('Tasks Service', () => {
  let tasksService: TasksService

  beforeAll(() => {
    tasksService = new TasksService()
  })

  it('should generate tasks from design and requirements', async () => {
    const requirements = [
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为用户，我希望能够注册和登录系统。' }]
      }
    ]

    const design = [
      {
        type: 'heading',
        level: 2,
        children: [{ text: '系统架构' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '采用前后端分离架构，使用 React + Node.js' }]
      }
    ]

    const tasks = await tasksService.generateTasks(design, requirements)

    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBeGreaterThan(0)
    
    // Check for task list structure
    const hasTaskList = tasks.some(item => item.type === 'list')
    expect(hasTaskList).toBe(true)
  })

  it('should validate task structure', async () => {
    const validTasks = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '实施计划' }]
      },
      {
        type: 'heading',
        level: 2,
        children: [{ text: '开发任务' }]
      },
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '☐ 1.1 搭建项目基础架构' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☐ 1.2 实现用户认证功能' }]
          }
        ]
      }
    ]

    const validation = await tasksService.validateTasks(validTasks)

    expect(validation.isValid).toBe(true)
    expect(validation.completeness).toBeGreaterThan(0)
    expect(Array.isArray(validation.suggestions)).toBe(true)
  })

  it('should identify missing task structure', async () => {
    const incompleteTasks = [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '实施计划' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '这是一个不完整的任务文档' }]
      }
    ]

    const validation = await tasksService.validateTasks(incompleteTasks)

    expect(validation.isValid).toBe(false)
    expect(validation.issues).toContain('缺少任务列表')
  })

  it('should extract tasks from content', () => {
    const content = [
      {
        type: 'heading',
        level: 2,
        children: [{ text: '前端开发' }]
      },
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '☐ 1.1 创建 React 项目' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☑ 1.2 配置路由系统' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☐ 1.3 实现用户界面 (高优先级)' }]
          }
        ]
      }
    ]

    const tasks = tasksService.extractTasksFromContent(content)

    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBe(3)
    
    // Check task properties
    const firstTask = tasks[0]
    expect(firstTask.title).toContain('创建 React 项目')
    expect(firstTask.status).toBe('not_started')
    expect(firstTask.tags).toContain('前端开发')

    const completedTask = tasks[1]
    expect(completedTask.status).toBe('completed')

    const highPriorityTask = tasks[2]
    expect(highPriorityTask.priority).toBe('high')
  })

  it('should analyze task dependencies', () => {
    const tasks = [
      {
        id: 'task-1',
        title: '创建数据库',
        description: '设置数据库结构',
        status: 'not_started' as const,
        priority: 'high' as const,
        dependencies: [],
        requirements: [],
        tags: ['backend']
      },
      {
        id: 'task-2',
        title: '实现 API',
        description: '开发 REST API',
        status: 'not_started' as const,
        priority: 'medium' as const,
        dependencies: ['task-1'],
        requirements: [],
        tags: ['backend']
      },
      {
        id: 'task-3',
        title: '前端集成',
        description: '集成前端和后端',
        status: 'not_started' as const,
        priority: 'medium' as const,
        dependencies: ['task-2'],
        requirements: [],
        tags: ['frontend']
      }
    ]

    const dependencies = tasksService.analyzeDependencies(tasks)

    expect(Array.isArray(dependencies)).toBe(true)
    expect(dependencies.length).toBe(2)
    
    // Check dependency structure
    const firstDep = dependencies.find(d => d.from === 'task-1' && d.to === 'task-2')
    expect(firstDep).toBeDefined()
    expect(firstDep?.type).toBe('blocks')
  })

  it('should generate task timeline', () => {
    const tasks = [
      {
        id: 'task-1',
        title: '项目初始化',
        description: '设置项目',
        status: 'not_started' as const,
        priority: 'high' as const,
        estimatedHours: 8,
        dependencies: [],
        requirements: [],
        tags: ['setup']
      },
      {
        id: 'task-2',
        title: '开发功能',
        description: '实现核心功能',
        status: 'not_started' as const,
        priority: 'medium' as const,
        estimatedHours: 16,
        dependencies: ['task-1'],
        requirements: [],
        tags: ['development']
      }
    ]

    const dependencies = [
      { from: 'task-1', to: 'task-2', type: 'blocks' as const }
    ]

    const timeline = tasksService.generateTaskTimeline(tasks, dependencies)

    expect(timeline.phases).toBeDefined()
    expect(Array.isArray(timeline.phases)).toBe(true)
    expect(timeline.phases.length).toBeGreaterThan(0)
    expect(timeline.estimatedDuration).toBeGreaterThan(0)
    expect(Array.isArray(timeline.criticalPath)).toBe(true)
  })

  it('should return task templates', () => {
    const templates = tasksService.getTaskTemplates()

    expect(typeof templates).toBe('object')
    expect(templates['web-development']).toBeDefined()
    expect(Array.isArray(templates['web-development'])).toBe(true)
    
    // Check template structure
    const webTemplate = templates['web-development']
    const hasHeading = webTemplate.some(item => item.type === 'heading')
    const hasList = webTemplate.some(item => item.type === 'list')
    expect(hasHeading).toBe(true)
    expect(hasList).toBe(true)
  })

  it('should handle complex project requirements', async () => {
    const complexRequirements = [
      {
        type: 'paragraph',
        children: [{ text: '构建一个分布式微服务系统，支持实时数据处理和机器学习功能' }]
      }
    ]

    const complexDesign = [
      {
        type: 'paragraph',
        children: [{ text: '采用微服务架构，包含多个独立服务和消息队列' }]
      }
    ]

    const tasks = await tasksService.generateTasks(complexDesign, complexRequirements)

    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBeGreaterThan(0)
    
    // Should generate more complex task structure for complex projects
    const taskText = JSON.stringify(tasks)
    expect(taskText.toLowerCase()).toContain('complex')
  })

  it('should handle agile methodology options', async () => {
    const requirements = [
      {
        type: 'paragraph',
        children: [{ text: '开发一个任务管理应用' }]
      }
    ]

    const design = [
      {
        type: 'paragraph',
        children: [{ text: '使用 React 和 Node.js 构建' }]
      }
    ]

    const options = {
      methodology: 'agile' as const,
      teamSize: 5,
      timeline: '3 months'
    }

    const tasks = await tasksService.generateTasks(design, requirements, options)

    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBeGreaterThan(0)
  })

  it('should validate tasks with priorities and dependencies', async () => {
    const tasksWithPriorities = [
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '☐ 高优先级任务：实现核心功能' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☐ 依赖任务1的任务2' }]
          }
        ]
      }
    ]

    const validation = await tasksService.validateTasks(tasksWithPriorities)

    expect(validation.isValid).toBe(true)
    // Should detect priorities and dependencies in validation
  })

  it('should handle empty inputs gracefully', async () => {
    const tasks = await tasksService.generateTasks([], [])

    expect(Array.isArray(tasks)).toBe(true)
    // Should still generate some basic task structure
  })

  it('should parse different task formats', () => {
    const content = [
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '- [ ] 未完成任务' }]
          },
          {
            type: 'list-item',
            children: [{ text: '- [x] 已完成任务' }]
          },
          {
            type: 'list-item',
            children: [{ text: '🔄 进行中的任务' }]
          }
        ]
      }
    ]

    const tasks = tasksService.extractTasksFromContent(content)

    expect(tasks.length).toBe(3)
    expect(tasks[0].status).toBe('not_started')
    expect(tasks[1].status).toBe('completed')
    expect(tasks[2].status).toBe('in_progress')
  })
})