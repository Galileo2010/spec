import { AIService } from './aiService'

export interface TaskItem {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  estimatedHours: number
  dependencies: string[]
  requirements: string[]
  status: 'not_started' | 'in_progress' | 'completed'
  assignee?: string
  tags: string[]
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
  type: 'blocks' | 'depends_on' | 'related'
}

export class TasksService {
  private aiService: AIService

  constructor() {
    this.aiService = AIService.getInstance()
  }

  async generateTasks(
    requirements: any[], 
    design: any[], 
    context?: any
  ): Promise<any[]> {
    try {
      // Analyze requirements and design to extract task information
      const taskAnalysis = this.analyzeForTasks(requirements, design)
      
      // Generate tasks using AI
      const tasks = await this.aiService.generateSpec({
        input: this.formatInputForTasks(requirements, design),
        specType: 'tasks',
        context: {
          ...context,
          requirements,
          design,
          analysis: taskAnalysis
        }
      })

      // Enhance with task dependencies and best practices
      const enhancedTasks = this.enhanceWithDependencies(tasks, taskAnalysis)
      
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
  }> {
    try {
      const analysis = await this.aiService.analyzeContent(content, 'tasks')
      
      // Additional validation specific to tasks
      const validation = this.validateTaskStructure(content)
      
      return {
        isValid: validation.hasTaskLists && validation.hasEstimates,
        issues: validation.issues,
        suggestions: analysis.suggestions || [],
        completeness: analysis.completeness || 0,
        feasibility: analysis.feasibility || 0
      }
    } catch (error) {
      console.error('Error validating tasks:', error)
      throw new Error('Failed to validate tasks document')
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

  analyzeDependencies(tasks: TaskItem[]): TaskDependency[] {
    const dependencies: TaskDependency[] = []
    
    // Simple dependency analysis based on task names and descriptions
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i]
        const task2 = tasks[j]
        
        // Check if task2 depends on task1
        if (this.checkDependency(task1, task2)) {
          dependencies.push({
            from: task1.id,
            to: task2.id,
            type: 'blocks'
          })
        }
      }
    }
    
    return dependencies
  }

  estimateTaskEffort(taskDescription: string, complexity: 'simple' | 'moderate' | 'complex'): number {
    // Simple estimation based on keywords and complexity
    const baseHours = {
      'simple': 4,
      'moderate': 8,
      'complex': 16
    }
    
    let multiplier = 1
    const description = taskDescription.toLowerCase()
    
    // Adjust based on task type
    if (description.includes('setup') || description.includes('config')) {
      multiplier = 0.5
    } else if (description.includes('integration') || description.includes('api')) {
      multiplier = 1.5
    } else if (description.includes('testing') || description.includes('test')) {
      multiplier = 0.8
    } else if (description.includes('ui') || description.includes('frontend')) {
      multiplier = 1.2
    } else if (description.includes('database') || description.includes('migration')) {
      multiplier = 1.3
    }
    
    return Math.round(baseHours[complexity] * multiplier)
  }

  private analyzeForTasks(requirements: any[], design: any[]): {
    projectType: string
    complexity: 'simple' | 'moderate' | 'complex'
    estimatedDuration: string
    keyModules: string[]
    criticalPath: string[]
  } {
    const requirementsText = this.extractTextFromContent(requirements)
    const designText = this.extractTextFromContent(design)
    const combinedText = (requirementsText + ' ' + designText).toLowerCase()
    
    // Determine project type
    let projectType = 'web-development'
    if (combinedText.includes('mobile') || combinedText.includes('app')) {
      projectType = 'mobile-development'
    } else if (combinedText.includes('api') || combinedText.includes('service')) {
      projectType = 'api-development'
    } else if (combinedText.includes('data') || combinedText.includes('analytics')) {
      projectType = 'data-platform'
    }

    // Determine complexity
    const featureCount = (combinedText.match(/feature|function|requirement/g) || []).length
    let complexity: 'simple' | 'moderate' | 'complex' = 'moderate'
    if (featureCount > 15) {
      complexity = 'complex'
    } else if (featureCount < 8) {
      complexity = 'simple'
    }

    // Extract key modules
    const keyModules = this.extractModules(combinedText)
    
    // Estimate duration
    const estimatedDuration = this.estimateProjectDuration(complexity, keyModules.length)
    
    return {
      projectType,
      complexity,
      estimatedDuration,
      keyModules,
      criticalPath: this.identifyCriticalPath(keyModules)
    }
  }

  private formatInputForTasks(requirements: any[], design: any[]): string {
    const reqText = this.extractTextFromContent(requirements)
    const designText = this.extractTextFromContent(design)
    
    return `基于以下需求和设计文档，生成具体的开发任务：

需求文档摘要：
${reqText.substring(0, 1000)}

设计文档摘要：
${designText.substring(0, 1000)}

请生成结构化的任务列表，包括任务分组、优先级和依赖关系。`
  }

  private extractTextFromContent(content: any[]): string {
    return content.map(item => this.extractTextFromItem(item)).join(' ')
  }

  private extractTextFromItem(item: any): string {
    if (item.children) {
      return item.children.map((child: any) => this.extractTextFromItem(child)).join(' ')
    }
    return item.text || ''
  }

  private enhanceWithDependencies(tasks: any[], analysis: any): any[] {
    // Add task estimation and dependency information
    return tasks.map(item => {
      if (item.type === 'list' && item.listType === 'unordered') {
        return {
          ...item,
          children: item.children.map((listItem: any) => {
            if (listItem.type === 'list-item') {
              const text = this.extractTextFromItem(listItem)
              const enhanced = this.enhanceTaskItem(text, analysis)
              return {
                ...listItem,
                children: [{ text: enhanced }]
              }
            }
            return listItem
          })
        }
      }
      return item
    })
  }

  private enhanceTaskItem(taskText: string, analysis: any): string {
    // Add estimation and priority information
    const estimation = this.estimateTaskEffort(taskText, analysis.complexity)
    const priority = this.determinePriority(taskText, analysis.criticalPath)
    
    return `${taskText} (预估: ${estimation}小时, 优先级: ${priority})`
  }

  private determinePriority(taskText: string, criticalPath: string[]): string {
    const text = taskText.toLowerCase()
    
    // Check if task is on critical path
    for (const critical of criticalPath) {
      if (text.includes(critical.toLowerCase())) {
        return '高'
      }
    }
    
    // Check for high priority keywords
    if (text.includes('setup') || text.includes('基础') || text.includes('架构')) {
      return '高'
    }
    
    // Check for low priority keywords
    if (text.includes('优化') || text.includes('文档') || text.includes('测试')) {
      return '低'
    }
    
    return '中'
  }

  private validateTaskStructure(content: any[]): {
    hasTaskLists: boolean
    hasEstimates: boolean
    hasPriorities: boolean
    issues: string[]
  } {
    let hasTaskLists = false
    let hasEstimates = false
    let hasPriorities = false
    const issues: string[] = []

    for (const item of content) {
      if (item.type === 'list') {
        hasTaskLists = true
        
        // Check for estimates and priorities in list items
        for (const listItem of item.children || []) {
          if (listItem.type === 'list-item') {
            const text = this.extractTextFromItem(listItem)
            if (text.includes('预估') || text.includes('小时')) {
              hasEstimates = true
            }
            if (text.includes('优先级') || text.includes('高') || text.includes('中') || text.includes('低')) {
              hasPriorities = true
            }
          }
        }
      }
    }

    if (!hasTaskLists) {
      issues.push('缺少任务列表')
    }
    
    if (!hasEstimates) {
      issues.push('缺少时间估算')
    }
    
    if (!hasPriorities) {
      issues.push('缺少优先级标识')
    }

    return {
      hasTaskLists,
      hasEstimates,
      hasPriorities,
      issues
    }
  }

  private extractModules(text: string): string[] {
    const modules = []
    const moduleKeywords = [
      'authentication', '认证', 'auth',
      'user management', '用户管理', 'user',
      'database', '数据库', 'db',
      'api', 'interface', '接口',
      'frontend', '前端', 'ui',
      'backend', '后端', 'server',
      'payment', '支付', 'billing',
      'notification', '通知', 'message',
      'search', '搜索', 'query',
      'analytics', '分析', 'reporting'
    ]
    
    for (const keyword of moduleKeywords) {
      if (text.includes(keyword)) {
        modules.push(keyword)
      }
    }
    
    return modules.slice(0, 8) // Limit to 8 modules
  }

  private identifyCriticalPath(modules: string[]): string[] {
    // Define critical path based on typical development dependencies
    const criticalOrder = [
      'database', 'authentication', 'api', 'frontend', 'backend'
    ]
    
    return modules.filter(module => 
      criticalOrder.some(critical => module.includes(critical))
    )
  }

  private estimateProjectDuration(complexity: string, moduleCount: number): string {
    const baseWeeks = {
      'simple': 4,
      'moderate': 8,
      'complex': 16
    }
    
    const weeks = baseWeeks[complexity as keyof typeof baseWeeks] + Math.floor(moduleCount / 2)
    
    if (weeks <= 4) return '1个月'
    if (weeks <= 8) return '2个月'
    if (weeks <= 12) return '3个月'
    if (weeks <= 24) return '6个月'
    return '6个月以上'
  }

  private checkDependency(task1: TaskItem, task2: TaskItem): boolean {
    // Simple dependency check based on common patterns
    const t1 = task1.title.toLowerCase()
    const t2 = task2.title.toLowerCase()
    
    // Database setup should come before API development
    if (t1.includes('database') && t2.includes('api')) return true
    
    // Authentication should come before user features
    if (t1.includes('auth') && t2.includes('user')) return true
    
    // Backend should come before frontend
    if (t1.includes('backend') && t2.includes('frontend')) return true
    
    // Setup tasks should come first
    if (t1.includes('setup') && !t2.includes('setup')) return true
    
    return false
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
            children: [{ text: '☐ 1.1 项目环境搭建 (预估: 4小时, 优先级: 高)' }]
          },
          {
            type: 'list-item',
            children: [{ text: '☐ 1.2 代码仓库初始化 (预估: 2小时, 优先级: 高)' }]
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