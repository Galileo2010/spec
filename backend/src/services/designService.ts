import { AIService } from './aiService'

export interface TechStack {
  frontend: string[]
  backend: string[]
  database: string[]
  infrastructure: string[]
  tools: string[]
}

export interface ArchitecturePattern {
  name: string
  description: string
  benefits: string[]
  drawbacks: string[]
  useCases: string[]
}

export interface ComponentDesign {
  name: string
  type: 'service' | 'component' | 'module' | 'library'
  responsibilities: string[]
  interfaces: string[]
  dependencies: string[]
}

export class DesignService {
  private aiService: AIService

  constructor() {
    this.aiService = AIService.getInstance()
  }

  async generateDesign(requirements: any[], techStackPreference?: string): Promise<any[]> {
    try {
      // Analyze requirements to extract design constraints
      const designConstraints = this.analyzeRequirements(requirements)
      
      // Determine optimal tech stack
      const recommendedTechStack = this.recommendTechStack(designConstraints, techStackPreference)
      
      // Generate design document using AI
      const design = await this.aiService.generateSpec({
        input: this.formatRequirementsForDesign(requirements),
        specType: 'design',
        context: {
          techStack: recommendedTechStack,
          constraints: designConstraints
        }
      })

      // Enhance with architecture patterns and best practices
      const enhancedDesign = this.enhanceWithArchitecturePatterns(design, designConstraints)
      
      return enhancedDesign
    } catch (error) {
      console.error('Error generating design:', error)
      throw new Error('Failed to generate design document')
    }
  }

  async validateDesign(content: any[]): Promise<{
    isValid: boolean
    issues: string[]
    suggestions: string[]
    completeness: number
    consistency: number
  }> {
    try {
      const analysis = await this.aiService.analyzeContent(content, 'design')
      
      // Additional validation specific to design documents
      const validation = this.validateDesignStructure(content)
      
      return {
        isValid: validation.hasArchitecture && validation.hasTechStack && validation.hasComponents,
        issues: validation.issues,
        suggestions: analysis.suggestions || [],
        completeness: analysis.completeness || 0,
        consistency: analysis.consistency || 0
      }
    } catch (error) {
      console.error('Error validating design:', error)
      throw new Error('Failed to validate design document')
    }
  }

  getArchitecturePatterns(): ArchitecturePattern[] {
    return [
      {
        name: 'Microservices Architecture',
        description: '将应用程序分解为小型、独立的服务',
        benefits: ['可扩展性', '技术多样性', '独立部署', '故障隔离'],
        drawbacks: ['复杂性增加', '网络延迟', '数据一致性挑战'],
        useCases: ['大型应用', '高并发系统', '多团队开发']
      },
      {
        name: 'Monolithic Architecture',
        description: '单一部署单元的传统架构',
        benefits: ['简单部署', '易于测试', '性能优秀', '开发简单'],
        drawbacks: ['扩展性限制', '技术栈锁定', '单点故障'],
        useCases: ['小型应用', '快速原型', '团队较小']
      },
      {
        name: 'Serverless Architecture',
        description: '基于函数即服务(FaaS)的架构',
        benefits: ['自动扩展', '按需付费', '无服务器管理', '快速部署'],
        drawbacks: ['冷启动延迟', '供应商锁定', '调试困难'],
        useCases: ['事件驱动应用', '不规律负载', '快速开发']
      },
      {
        name: 'Event-Driven Architecture',
        description: '基于事件的松耦合架构',
        benefits: ['松耦合', '可扩展性', '实时处理', '灵活性'],
        drawbacks: ['复杂性', '事件顺序', '调试困难'],
        useCases: ['实时系统', '异步处理', '集成系统']
      }
    ]
  }

  getTechStackRecommendations(): { [key: string]: TechStack } {
    return {
      'web-app': {
        frontend: ['React', 'TypeScript', 'Tailwind CSS', 'Vite'],
        backend: ['Node.js', 'Express', 'TypeScript'],
        database: ['PostgreSQL', 'Redis'],
        infrastructure: ['Docker', 'AWS/Azure', 'Nginx'],
        tools: ['Git', 'Jest', 'ESLint', 'Prettier']
      },
      'mobile-app': {
        frontend: ['React Native', 'TypeScript', 'Expo'],
        backend: ['Node.js', 'Express', 'GraphQL'],
        database: ['PostgreSQL', 'MongoDB'],
        infrastructure: ['AWS Amplify', 'Firebase'],
        tools: ['Metro', 'Flipper', 'Detox']
      },
      'api-service': {
        frontend: [],
        backend: ['Node.js', 'Fastify', 'TypeScript', 'OpenAPI'],
        database: ['PostgreSQL', 'Redis'],
        infrastructure: ['Docker', 'Kubernetes', 'API Gateway'],
        tools: ['Swagger', 'Postman', 'Artillery']
      },
      'data-platform': {
        frontend: ['React', 'D3.js', 'TypeScript'],
        backend: ['Python', 'FastAPI', 'Apache Airflow'],
        database: ['PostgreSQL', 'ClickHouse', 'Elasticsearch'],
        infrastructure: ['Docker', 'Kubernetes', 'Apache Kafka'],
        tools: ['Jupyter', 'Apache Spark', 'Grafana']
      }
    }
  }

  private analyzeRequirements(requirements: any[]): {
    projectType: string
    scalabilityNeeds: 'low' | 'medium' | 'high'
    performanceNeeds: 'low' | 'medium' | 'high'
    securityNeeds: 'low' | 'medium' | 'high'
    complexityLevel: 'simple' | 'moderate' | 'complex'
    userLoad: 'small' | 'medium' | 'large'
  } {
    const text = this.extractTextFromContent(requirements).toLowerCase()
    
    // Analyze project type
    let projectType = 'web-app'
    if (text.includes('mobile') || text.includes('app')) {
      projectType = 'mobile-app'
    } else if (text.includes('api') || text.includes('service')) {
      projectType = 'api-service'
    } else if (text.includes('data') || text.includes('analytics')) {
      projectType = 'data-platform'
    }

    // Analyze scalability needs
    let scalabilityNeeds: 'low' | 'medium' | 'high' = 'medium'
    if (text.includes('million') || text.includes('scale') || text.includes('distributed')) {
      scalabilityNeeds = 'high'
    } else if (text.includes('small') || text.includes('prototype')) {
      scalabilityNeeds = 'low'
    }

    // Analyze performance needs
    let performanceNeeds: 'low' | 'medium' | 'high' = 'medium'
    if (text.includes('real-time') || text.includes('fast') || text.includes('performance')) {
      performanceNeeds = 'high'
    }

    // Analyze security needs
    let securityNeeds: 'low' | 'medium' | 'high' = 'medium'
    if (text.includes('payment') || text.includes('financial') || text.includes('security') || text.includes('authentication')) {
      securityNeeds = 'high'
    }

    // Determine complexity
    const featureCount = (text.match(/requirement|feature|function/g) || []).length
    let complexityLevel: 'simple' | 'moderate' | 'complex' = 'moderate'
    if (featureCount > 10) {
      complexityLevel = 'complex'
    } else if (featureCount < 5) {
      complexityLevel = 'simple'
    }

    return {
      projectType,
      scalabilityNeeds,
      performanceNeeds,
      securityNeeds,
      complexityLevel,
      userLoad: scalabilityNeeds === 'high' ? 'large' : scalabilityNeeds === 'low' ? 'small' : 'medium'
    }
  }

  private recommendTechStack(constraints: any, preference?: string): TechStack {
    const recommendations = this.getTechStackRecommendations()
    
    if (preference && recommendations[preference]) {
      return recommendations[preference]
    }

    // Default recommendation based on project type
    return recommendations[constraints.projectType] || recommendations['web-app']
  }

  private formatRequirementsForDesign(requirements: any[]): string {
    return this.extractTextFromContent(requirements)
  }

  private extractTextFromContent(content: any[]): string {
    let text = ''
    
    for (const item of content) {
      if (item.children) {
        text += this.extractTextFromChildren(item.children) + ' '
      }
    }
    
    return text.trim()
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

  private enhanceWithArchitecturePatterns(design: any[], constraints: any): any[] {
    // Add architecture pattern recommendations
    const patterns = this.getArchitecturePatterns()
    let recommendedPattern = patterns[0] // Default to microservices
    
    if (constraints.complexityLevel === 'simple') {
      recommendedPattern = patterns.find(p => p.name === 'Monolithic Architecture') || patterns[0]
    } else if (constraints.scalabilityNeeds === 'high') {
      recommendedPattern = patterns.find(p => p.name === 'Microservices Architecture') || patterns[0]
    }

    // Insert architecture pattern section
    const architectureIndex = design.findIndex(item => 
      item.type === 'heading' && 
      item.children && 
      item.children[0]?.text?.includes('架构')
    )

    if (architectureIndex !== -1) {
      design.splice(architectureIndex + 1, 0, {
        type: 'heading',
        level: 3,
        children: [{ text: '推荐架构模式' }]
      }, {
        type: 'paragraph',
        children: [{ text: `**${recommendedPattern.name}**: ${recommendedPattern.description}` }]
      }, {
        type: 'paragraph',
        children: [{ text: `**优势**: ${recommendedPattern.benefits.join(', ')}` }]
      })
    }

    return design
  }

  private validateDesignStructure(content: any[]): {
    hasArchitecture: boolean
    hasTechStack: boolean
    hasComponents: boolean
    hasMermaidDiagrams: boolean
    issues: string[]
  } {
    let hasArchitecture = false
    let hasTechStack = false
    let hasComponents = false
    let hasMermaidDiagrams = false
    const issues: string[] = []

    for (const item of content) {
      if (item.type === 'heading') {
        const text = this.extractTextFromChildren(item.children).toLowerCase()
        if (text.includes('架构') || text.includes('architecture')) {
          hasArchitecture = true
        }
        if (text.includes('技术栈') || text.includes('tech stack')) {
          hasTechStack = true
        }
        if (text.includes('组件') || text.includes('component')) {
          hasComponents = true
        }
      }
      
      if (item.type === 'code-block' && item.language === 'mermaid') {
        hasMermaidDiagrams = true
      }
    }

    if (!hasArchitecture) {
      issues.push('缺少系统架构设计')
    }
    
    if (!hasTechStack) {
      issues.push('缺少技术栈说明')
    }
    
    if (!hasComponents) {
      issues.push('缺少组件设计')
    }

    if (!hasMermaidDiagrams) {
      issues.push('建议添加架构图表')
    }

    return {
      hasArchitecture,
      hasTechStack,
      hasComponents,
      hasMermaidDiagrams,
      issues
    }
  }
}