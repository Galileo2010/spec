import { AIService } from './aiService'

export interface TaskItem {
  id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  estimatedHours?: number
  dependencies: string[]
  requirements: string[]
  tags: string[]
  assignee?: string
}

export interface TaskGroup {
  id: string
  name: string
  description: string
  tasks: TaskItem[]
  order: number
}

export interface TaskDependency {
  from: string
  to: string
  type: 'blocks' | 'enables' | 'related'
}

export class TasksService {
  private aiService: AIService

  constructor() {
    this.aiService = AIService.getInstance()
  }

  async generateTasks(
    design: any[], 
    requirements: any[], 
    options?: {
      methodology?: 'agile' | 'waterfall' | 'kanban'
      teamSize?: number
      timeline?: string
    }
  ): Promise<any[]> {
    try {
      // Analyze design and requirements to extract task information
      const taskAnalysis = this.analyzeForTasks(design, requirements)
      
      // Generate tasks using AI
      const tasks = await this.aiService.generateSpec({
        input: this.formatInputForTasks(design, requirements),
        specType: 'tasks',
        context: {
          design,
          requirements,
          analysis: taskAnalysis,
          options
        }
      })

      // Enhance with task dependencies and priorities
      const enhancedTasks = this.enhanceWithTaskStructure(tasks, taskAnalysis)
      
      return enhancedTasks
    } catch (error) {
      console.error('Error generating tasks:', error)
      throw new Error('Failed to generate tasks document')
    }
  }

  async validateTasks(content: any[]): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
    completeness: number
    feasibility: number
    dependencies: number
  }> {
    try {
      const analysis = await this.aiService.analyzeContent(content, 'tasks')
      
      // Additional validation specific to tasks
      const validation = this.validateTaskStructure(content)
      
      return {
        isValid: validation.hasTaskLists && validation.hasCheckboxes,
        issues: validation.issues,
        suggestions: analysis.suggestions || [],
        completeness: analysis.completeness || 0,
        feasibility: analysis.feasibility || 0,
        dependencies: analysis.dependencies || 0
      }
    } catch (error) {
      console.error('Error validating tasks:', error)
      throw new Error('Failed to validate tasks document')
    }
  }

  extractTasksFromContent(content: any[]): TaskItem[] {
    const tasks: TaskItem[] = []
    let currentGroup = ''
    let taskCounter = 0

    for (const item of content) {
      if (item.type === 'heading') {
        currentGroup = this.extractTextFromChildren(item.children)
      } else if (item.type === 'list') {
        const listTasks = this.extractTasksFromList(item, currentGroup)
        tasks.push(...listTasks)
      }
    }

    return tasks
  }

  analyzeDependencies(tasks: TaskItem[]): TaskDependency[] {
    const dependencies: TaskDependency[] = []
    
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        const dependentTask = tasks.find(t => t.id === depId)
        if (dependentTask) {
          dependencies.push({
            from: depId,
            to: task.id,
            type: 'blocks'
          })
        }
      }
    }

    return dependencies
  }

  generateTaskTimeline(tasks: TaskItem[], dependencies: TaskDependency[]): {
    phases: TaskGroup[]
    criticalPath: string[]
    estimatedDuration: number
  } {
    // Simple task scheduling algorithm
    const phases: TaskGroup[] = []
    const processed = new Set<string>()
    let phaseCounter = 1

    while (processed.size < tasks.length) {
      const availableTasks = tasks.filter(task => 
        !processed.has(task.id) && 
        task.dependencies.every(depId => processed.has(depId))
      )

      if (availableTasks.length === 0) {
        // Handle circular dependencies or orphaned tasks
        const remainingTasks = tasks.filter(task => !processed.has(task.id))
        availableTasks.push(...remainingTasks)
      }

      if (availableTasks.length > 0) {
        phases.push({
          id: `phase-${phaseCounter}`,
          name: `阶段 ${phaseCounter}`,
          description: `第 ${phaseCounter} 个开发阶段`,
          tasks: availableTasks,
          order: phaseCounter
        })

        availableTasks.forEach(task => processed.add(task.id))
        phaseCounter++
      }
    }

    // Calculate critical path (simplified)
    const criticalPath = this.findCriticalPath(tasks, dependencies)
    
    // Calculate estimated duration
    const estimatedDuration = phases.reduce((total, phase) => {
      const phaseHours = Math.max(...phase.tasks.map(t => t.estimatedHours || 8))
      return total + phaseHours
    }, 0)

    return {
      phases,
      criticalPath,
      estimatedDuration
    }
  }

  getTaskTemplates(): { [key: string]: any[] } {
    return {
      'web-development': this.getWebDevelopmentTemplate(),
      'mobile-development': this.getMobileDevelopmentTemplate(),
      'api-development': this.getAPIDevelopmentTemplate(),
      'data-platform': this.getDataPlatformTemplate()
    }
  }

  private analyzeForTasks(design: any[], requirements: any[]): {
    complexity: 'simple' | 'moderate' | 'complex'
    estimatedTasks: number
    suggestedPhases: string[]
    keyComponents: string[]
  } {
    const designText = this.extractTextFromContent(design).toLowerCase()
    const requirementsText = this.extractTextFromContent(requirements).toLowerCase()
    const combinedText = `${designText} ${requirementsText}`

    // Analyze complexity
    const complexityIndicators = ['microservice', 'distributed', 'scalable', 'real-time', 'machine learning']
    const complexityScore = complexityIndicators.filter(indicator => 
      combinedText.includes(indicator)
    ).length

    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
    if (complexityScore >= 3) {
      complexity = 'complex'
    } else if (complexityScore <= 1) {
      complexity = 'simple'
    }

    // Estimate number of tasks
    const featureCount = (combinedText.match(/feature|function|requirement/g) || []).length
    const estimatedTasks = Math.max(featureCount * 3, 10) // At least 10 tasks

    // Suggest phases
    const suggestedPhases = [
      '项目初始化',
      '核心功能开发',
      '集成测试',
      '部署发布'
    ]

    if (complexity === 'complex') {
      suggestedPhases.splice(2, 0, '性能优化', '安全加固')
    }

    // Extract key components
    const keyComponents = this.extractKeyComponents(combinedText)

    return {
      complexity,
      estimatedTasks,
      suggestedPhases,
      keyComponents
    }
  }

  private extractKeyComponents(text: string): string[] {
    const components = []
    const componentKeywords = [
      'frontend', 'backend', 'database', 'api', 'authentication', 
      'authorization', 'payment', 'notification', 'search', 'analytics'
    ]

    for (const keyword of componentKeywords) {
      if (text.includes(keyword)) {
        components.push(keyword)
      }
    }

    return components
  }

  private formatInputForTasks(design: any[], requirements: any[]): string {
    const designText = this.extractTextFromContent(design)
    const requirementsText = this.extractTextFromContent(requirements)
    
    return `基于以下设计文档和需求文档，生成具体的开发任务：

设计文档：
${designText}

需求文档：
${requirementsText}

请生成结构化的任务列表，包含任务依赖关系和优先级。`
  }

  private extractTextFromContent(content: any[]): string {
    return content.map(item => {
      if (item.children) {
        return this.extractTextFromChildren(item.children)
      }
      return ''
    }).join(' ').trim()
  }

  private extractTextFromChildren(children: any[]): string {
    return children.map(child => {
      if (child.text) {
        return child.text
      }
      if (child.children) {
        return this.extractTextFromChildren(child.children)
      }
      return ''
    }).join('')
  }

  private enhanceWithTaskStructure(tasks: any[], analysis: any): any[] {
    // Add task management enhancements
    const enhancedTasks = [...tasks]

    // Insert task overview section
    const overviewIndex = enhancedTasks.findIndex(item => 
      item.type === 'heading' && item.level === 2
    )

    if (overviewIndex !== -1) {
      enhancedTasks.splice(overviewIndex, 0, {
        type: 'heading',
        level: 2,
        children: [{ text: '任务概览' }]
      }, {
        type: 'paragraph',
        children: [{ 
          text: `项目复杂度：${analysis.complexity}，预估任务数量：${analysis.estimatedTasks}` 
        }]
      }, {
        type: 'paragraph',
        children: [{ 
          text: `建议开发阶段：${analysis.suggestedPhases.join(' → ')}` 
        }]
      })
    }

    return enhancedTasks
  }

  private validateTaskStructure(content: any[]): {
    hasTaskLists: boolean
    hasCheckboxes: boolean
    hasPriorities: boolean
    hasDependencies: boolean
    issues: string[]
  } {
    let hasTaskLists = false
    let hasCheckboxes = false
    let hasPriorities = false
    let hasDependencies = false
    const issues: string[] = []

    for (const item of content) {
      if (item.type === 'list') {
        hasTaskLists = true
        
        for (const listItem of item.children || []) {
          if (listItem.type === 'list-item') {
            const text = this.extractTextFromChildren(listItem.children)
            
            if (text.includes('☐') || text.includes('☑') || text.includes('- [ ]') || text.includes('- [x]')) {
              hasCheckboxes = true
            }
            
            if (text.includes('优先级') || text.includes('priority') || text.includes('高') || text.includes('中') || text.includes('低')) {
              hasPriorities = true
            }
            
            if (text.includes('依赖') || text.includes('depends') || text.includes('需要')) {
              hasDependencies = true
            }
          }
        }
      }
    }

    if (!hasTaskLists) {
      issues.push('缺少任务列表')
    }
    
    if (!hasCheckboxes) {
      issues.push('任务列表缺少复选框格式')
    }

    return {
      hasTaskLists,
      hasCheckboxes,
      hasPriorities,
      hasDependencies,
      issues
    }
  }

  private extractTasksFromList(listItem: any, group: string): TaskItem[] {
    const tasks: TaskItem[] = []
    
    if (listItem.children) {
      for (let i = 0; i < listItem.children.length; i++) {
        const item = listItem.children[i]
        if (item.type === 'list-item') {
          const text = this.extractTextFromChildren(item.children)
          const task = this.parseTaskFromText(text, group, i)
          if (task) {
            tasks.push(task)
          }
        }
      }
    }

    return tasks
  }

  private parseTaskFromText(text: string, group: string, index: number): TaskItem | null {
    if (!text.trim()) return null

    // Extract status from checkbox
    let status: 'not_started' | 'in_progress' | 'completed' = 'not_started'
    if (text.includes('☑') || text.includes('[x]')) {
      status = 'completed'
    } else if (text.includes('🔄') || text.includes('进行中')) {
      status = 'in_progress'
    }

    // Clean task title
    let title = text
      .replace(/☐|☑|\[ \]|\[x\]|🔄/g, '')
      .replace(/^\d+\.?\s*/, '')
      .trim()

    // Extract priority
    let priority: 'low' | 'medium' | 'high' = 'medium'
    if (text.includes('高优先级') || text.includes('urgent')) {
      priority = 'high'
    } else if (text.includes('低优先级') || text.includes('low')) {
      priority = 'low'
    }

    return {
      id: `${group.toLowerCase().replace(/\s+/g, '-')}-${index}`,
      title,
      description: title,
      status,
      priority,
      dependencies: [],
      requirements: [],
      tags: [group]
    }
  }

  private findCriticalPath(tasks: TaskItem[], dependencies: TaskDependency[]): string[] {
    // Simplified critical path calculation
    const criticalTasks = tasks
      .filter(task => task.priority === 'high' || task.dependencies.length > 0)
      .map(task => task.id)

    return criticalTasks
  }

  private getWebDevelopmentTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '实施计划' }]
      },
      {
        type: 'heading',
        level: 2,
        children: [{ text: '项目初始化' }]
      },
      {
        type: 'list',
        listType: 'unordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: '☐ 1.1 搭建开发环境' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☐ 1.2 初始化项目结构' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☐ 1.3 配置构建工具' }]
          }
        ]
      }
    ]
  }

  private getMobileDevelopmentTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '移动应用开发计划' }]
      }
    ]
  }

  private getAPIDevelopmentTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: 'API 开发计划' }]
      }
    ]
  }

  private getDataPlatformTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '数据平台开发计划' }]
      }
    ]
  }
}