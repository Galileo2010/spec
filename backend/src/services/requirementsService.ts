import { AIService } from './aiService'

export interface RequirementTemplate {
  id: string
  name: string
  description: string
  template: any[]
}

export interface UserStory {
  id: string
  role: string
  feature: string
  benefit: string
  priority: 'high' | 'medium' | 'low'
  acceptanceCriteria: AcceptanceCriteria[]
}

export interface AcceptanceCriteria {
  id: string
  condition: string
  action: string
  result: string
  format: 'EARS' // Easy Approach to Requirements Syntax
}

export class RequirementsService {
  private aiService: AIService

  constructor() {
    this.aiService = AIService.getInstance()
  }

  async generateRequirements(input: string, context?: any): Promise<any[]> {
    try {
      // Parse input to extract key information
      const parsedInput = this.parseInput(input)
      
      // Generate structured requirements using AI
      const requirements = await this.aiService.generateSpec({
        input,
        specType: 'requirements',
        context
      })

      // Enhance with EARS format validation
      const enhancedRequirements = this.enhanceWithEARS(requirements, parsedInput)
      
      return enhancedRequirements
    } catch (error) {
      console.error('Error generating requirements:', error)
      throw new Error('Failed to generate requirements document')
    }
  }

  async validateRequirements(content: any[]): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
    completeness: number
  }> {
    try {
      const analysis = await this.aiService.analyzeContent(content, 'requirements')
      
      // Additional validation specific to requirements
      const validation = this.validateRequirementStructure(content)
      
      return {
        isValid: validation.hasUserStories && validation.hasAcceptanceCriteria,
        issues: validation.issues,
        suggestions: analysis.suggestions || [],
        completeness: analysis.completeness || 0
      }
    } catch (error) {
      console.error('Error validating requirements:', error)
      throw new Error('Failed to validate requirements')
    }
  }

  getRequirementTemplates(): RequirementTemplate[] {
    return [
      {
        id: 'web-app',
        name: 'Web 应用程序',
        description: '标准的 Web 应用程序需求模板',
        template: this.getWebAppTemplate()
      },
      {
        id: 'mobile-app',
        name: '移动应用程序',
        description: '移动应用程序需求模板',
        template: this.getMobileAppTemplate()
      },
      {
        id: 'api-service',
        name: 'API 服务',
        description: 'RESTful API 服务需求模板',
        template: this.getAPIServiceTemplate()
      },
      {
        id: 'data-platform',
        name: '数据平台',
        description: '数据处理和分析平台需求模板',
        template: this.getDataPlatformTemplate()
      }
    ]
  }

  private parseInput(input: string): {
    projectType: string
    keyFeatures: string[]
    stakeholders: string[]
    constraints: string[]
  } {
    // Simple parsing logic - in real implementation, this could use NLP
    const lowerInput = input.toLowerCase()
    
    let projectType = 'web-app'
    if (lowerInput.includes('mobile') || lowerInput.includes('app')) {
      projectType = 'mobile-app'
    } else if (lowerInput.includes('api') || lowerInput.includes('service')) {
      projectType = 'api-service'
    } else if (lowerInput.includes('data') || lowerInput.includes('analytics')) {
      projectType = 'data-platform'
    }

    // Extract key features (simplified)
    const keyFeatures = []
    const featureKeywords = ['login', 'register', 'search', 'upload', 'download', 'chat', 'payment', 'notification']
    for (const keyword of featureKeywords) {
      if (lowerInput.includes(keyword)) {
        keyFeatures.push(keyword)
      }
    }

    // Extract stakeholders (simplified)
    const stakeholders = []
    const stakeholderKeywords = ['user', 'admin', 'customer', 'manager', 'developer']
    for (const keyword of stakeholderKeywords) {
      if (lowerInput.includes(keyword)) {
        stakeholders.push(keyword)
      }
    }

    return {
      projectType,
      keyFeatures,
      stakeholders: stakeholders.length > 0 ? stakeholders : ['user'],
      constraints: []
    }
  }

  private enhanceWithEARS(requirements: any[], parsedInput: any): any[] {
    // Add EARS format validation and enhancement
    return requirements.map(item => {
      if (item.type === 'list' && item.listType === 'ordered') {
        // Enhance acceptance criteria with EARS format
        return {
          ...item,
          children: item.children.map((listItem: any) => {
            if (listItem.type === 'list-item') {
              const text = this.extractText(listItem.children)
              const earsText = this.convertToEARS(text)
              return {
                ...listItem,
                children: [{ text: earsText }]
              }
            }
            return listItem
          })
        }
      }
      return item
    })
  }

  private convertToEARS(text: string): string {
    // Convert text to EARS format if not already
    if (text.includes('WHEN') && text.includes('THEN') && text.includes('SHALL')) {
      return text
    }

    // Simple conversion logic
    if (text.includes('用户') && text.includes('系统')) {
      return `WHEN 用户执行操作 THEN 系统 SHALL ${text}`
    }

    return `WHEN 条件满足 THEN 系统 SHALL ${text}`
  }

  private extractText(children: any[]): string {
    return children.map(child => child.text || '').join('')
  }

  private validateRequirementStructure(content: any[]): {
    hasUserStories: boolean
    hasAcceptanceCriteria: boolean
    issues: string[]
  } {
    let hasUserStories = false
    let hasAcceptanceCriteria = false
    const issues: string[] = []

    for (const item of content) {
      if (item.type === 'paragraph') {
        const text = this.extractText(item.children)
        if (text.includes('用户故事') || text.includes('User Story')) {
          hasUserStories = true
        }
      }
      
      if (item.type === 'list' && item.listType === 'ordered') {
        hasAcceptanceCriteria = true
        
        // Check EARS format in list items
        for (const listItem of item.children) {
          if (listItem.type === 'list-item') {
            const text = this.extractText(listItem.children)
            if (!text.includes('WHEN') || !text.includes('THEN') || !text.includes('SHALL')) {
              issues.push(`验收标准不符合 EARS 格式: "${text}"`)
            }
          }
        }
      }
    }

    if (!hasUserStories) {
      issues.push('缺少用户故事定义')
    }
    
    if (!hasAcceptanceCriteria) {
      issues.push('缺少验收标准')
    }

    return {
      hasUserStories,
      hasAcceptanceCriteria,
      issues
    }
  }

  private getWebAppTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '需求文档' }]
      },
      {
        type: 'heading',
        level: 2,
        children: [{ text: '项目概述' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '本文档定义了 Web 应用程序的功能需求和验收标准。' }]
      },
      {
        type: 'heading',
        level: 2,
        children: [{ text: '功能需求' }]
      },
      {
        type: 'heading',
        level: 3,
        children: [{ text: 'Requirement 1: 用户认证' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '**用户故事:** 作为用户，我希望能够注册和登录系统，以便访问个人化功能。' }]
      },
      {
        type: 'heading',
        level: 4,
        children: [{ text: '验收标准' }]
      },
      {
        type: 'list',
        listType: 'ordered',
        children: [
          {
            type: 'list-item',
            children: [{ text: 'WHEN 用户提供有效的邮箱和密码 THEN 系统 SHALL 创建新用户账户' }]
          },
          {
            type: 'list-item',
            children: [{ text: 'WHEN 用户使用正确的凭据登录 THEN 系统 SHALL 授予访问权限' }]
          }
        ]
      }
    ]
  }

  private getMobileAppTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '移动应用需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '本文档定义了移动应用程序的功能需求，包括 iOS 和 Android 平台的特定要求。' }]
      }
    ]
  }

  private getAPIServiceTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: 'API 服务需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '本文档定义了 RESTful API 服务的功能需求和接口规范。' }]
      }
    ]
  }

  private getDataPlatformTemplate(): any[] {
    return [
      {
        type: 'heading',
        level: 1,
        children: [{ text: '数据平台需求文档' }]
      },
      {
        type: 'paragraph',
        children: [{ text: '本文档定义了数据处理和分析平台的功能需求。' }]
      }
    ]
  }
}