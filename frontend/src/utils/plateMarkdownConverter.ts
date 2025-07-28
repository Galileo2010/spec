// 简化的节点类型定义，避免依赖Plate.js
export interface TDescendant {
  type?: string
  children?: TDescendant[]
  text?: string
  [key: string]: any
}

// Plate.js 文档节点类型定义
interface PlateNode {
  type: string
  children?: PlateNode[]
  text?: string
  [key: string]: any
}

// Markdown 转换器类
export class PlateMarkdownConverter {
  
  // Plate.js 文档转换为 Markdown
  static plateToMarkdown(nodes: TDescendant[]): string {
    return nodes.map(node => this.nodeToMarkdown(node as PlateNode, 0)).join('\n\n')
  }

  // 单个节点转换为 Markdown
  private static nodeToMarkdown(node: PlateNode, depth: number = 0): string {
    const indent = '  '.repeat(depth)
    
    switch (node.type) {
      case 'h1':
        return `# ${this.extractText(node)}`
      
      case 'h2':
        return `## ${this.extractText(node)}`
      
      case 'h3':
        return `### ${this.extractText(node)}`
      
      case 'h4':
        return `#### ${this.extractText(node)}`
      
      case 'h5':
        return `##### ${this.extractText(node)}`
      
      case 'h6':
        return `###### ${this.extractText(node)}`
      
      case 'p':
        const text = this.extractText(node)
        return text || ''
      
      case 'blockquote':
        const quoteText = this.extractText(node)
        return `> ${quoteText}`
      
      case 'code_block':
        const codeText = this.extractText(node)
        const language = node.lang || ''
        return `\`\`\`${language}\n${codeText}\n\`\`\``
      
      case 'ul':
        return node.children?.map((child, index) => 
          `${indent}- ${this.nodeToMarkdown(child, depth + 1)}`
        ).join('\n') || ''
      
      case 'ol':
        return node.children?.map((child, index) => 
          `${indent}${index + 1}. ${this.nodeToMarkdown(child, depth + 1)}`
        ).join('\n') || ''
      
      case 'li':
        return this.extractText(node)
      
      case 'hr':
        return '---'
      
      // 自定义插件节点
      case 'user-story':
        return this.userStoryToMarkdown(node)
      
      case 'acceptance-criteria':
        return this.acceptanceCriteriaToMarkdown(node)
      
      case 'requirement-link':
        return this.requirementLinkToMarkdown(node)
      
      case 'mermaid-diagram':
        return this.mermaidDiagramToMarkdown(node)
      
      case 'architecture-template':
        return this.architectureTemplateToMarkdown(node)
      
      case 'api-documentation':
        return this.apiDocumentationToMarkdown(node)
      
      case 'task-list':
        return this.taskListToMarkdown(node)
      
      default:
        // 处理文本节点
        if (node.text !== undefined) {
          let text = node.text
          
          // 处理格式化
          if (node.bold) text = `**${text}**`
          if (node.italic) text = `*${text}*`
          if (node.underline) text = `<u>${text}</u>`
          if (node.strikethrough) text = `~~${text}~~`
          if (node.code) text = `\`${text}\``
          
          return text
        }
        
        // 处理包含子节点的未知节点
        return node.children?.map(child => this.nodeToMarkdown(child, depth)).join('') || ''
    }
  }

  // 提取节点中的纯文本
  private static extractText(node: PlateNode): string {
    if (node.text !== undefined) {
      return node.text
    }
    
    if (node.children) {
      return node.children.map(child => this.extractText(child)).join('')
    }
    
    return ''
  }

  // 用户故事转 Markdown
  private static userStoryToMarkdown(node: PlateNode): string {
    const { role, feature, benefit } = node
    return `**用户故事:**

作为 ${role || '[角色]'}，我希望 ${feature || '[功能]'}，以便 ${benefit || '[价值]'}。`
  }

  // 验收标准转 Markdown
  private static acceptanceCriteriaToMarkdown(node: PlateNode): string {
    const criteria = node.criteria || []
    let markdown = '**验收标准:**\n\n'
    
    criteria.forEach((criterion: any, index: number) => {
      markdown += `${index + 1}. **${criterion.type}** ${criterion.condition} **THEN** 系统 **SHALL** ${criterion.result}\n`
    })
    
    return markdown
  }

  // 需求链接转 Markdown
  private static requirementLinkToMarkdown(node: PlateNode): string {
    const { requirementId, requirementTitle, linkType } = node
    const linkTypeLabel = linkType === 'reference' ? '引用' : 
                         linkType === 'dependency' ? '依赖' : '相关'
    return `[${linkTypeLabel}: ${requirementTitle || requirementId}](#${requirementId})`
  }

  // Mermaid 图表转 Markdown
  private static mermaidDiagramToMarkdown(node: PlateNode): string {
    const { diagramType, code, title } = node
    let markdown = title ? `**${title}**\n\n` : ''
    markdown += `\`\`\`mermaid\n${code || ''}\n\`\`\``
    return markdown
  }

  // 架构模板转 Markdown
  private static architectureTemplateToMarkdown(node: PlateNode): string {
    const { templateType, components, title } = node
    let markdown = `## ${title || '架构设计'}\n\n`
    markdown += `**架构类型:** ${templateType}\n\n`
    
    if (components && components.length > 0) {
      markdown += '### 组件列表\n\n'
      components.forEach((component: any) => {
        markdown += `#### ${component.name}\n`
        markdown += `- **类型:** ${component.type}\n`
        markdown += `- **描述:** ${component.description}\n`
        if (component.technologies.length > 0) {
          markdown += `- **技术栈:** ${component.technologies.join(', ')}\n`
        }
        if (component.connections.length > 0) {
          markdown += `- **连接:** ${component.connections.join(', ')}\n`
        }
        markdown += '\n'
      })
    }
    
    return markdown
  }

  // API 文档转 Markdown
  private static apiDocumentationToMarkdown(node: PlateNode): string {
    const { endpoints, title, baseUrl } = node
    let markdown = `## ${title || 'API 文档'}\n\n`
    
    if (baseUrl) {
      markdown += `**Base URL:** \`${baseUrl}\`\n\n`
    }
    
    if (endpoints && endpoints.length > 0) {
      endpoints.forEach((endpoint: any) => {
        markdown += `### ${endpoint.method} ${endpoint.path}\n\n`
        markdown += `${endpoint.description}\n\n`
        
        if (endpoint.parameters.length > 0) {
          markdown += '**参数:**\n\n'
          markdown += '| 名称 | 类型 | 必需 | 描述 |\n'
          markdown += '|------|------|------|------|\n'
          endpoint.parameters.forEach((param: any) => {
            markdown += `| ${param.name} | ${param.type} | ${param.required ? '是' : '否'} | ${param.description} |\n`
          })
          markdown += '\n'
        }
        
        if (endpoint.responses.length > 0) {
          markdown += '**响应:**\n\n'
          endpoint.responses.forEach((response: any) => {
            markdown += `**${response.status}** - ${response.description}\n\n`
            if (response.example) {
              markdown += `\`\`\`json\n${response.example}\n\`\`\`\n\n`
            }
          })
        }
      })
    }
    
    return markdown
  }

  // 任务列表转 Markdown
  private static taskListToMarkdown(node: PlateNode): string {
    const { tasks, title } = node
    let markdown = `## ${title || '任务列表'}\n\n`
    
    if (tasks && tasks.length > 0) {
      tasks.forEach((task: any) => {
        const checkbox = task.status === 'completed' ? '[x]' : '[ ]'
        markdown += `- ${checkbox} **${task.title}**\n`
        markdown += `  - ${task.description}\n`
        markdown += `  - **状态:** ${this.getStatusLabel(task.status)}\n`
        markdown += `  - **优先级:** ${this.getPriorityLabel(task.priority)}\n`
        
        if (task.assignee) {
          markdown += `  - **负责人:** ${task.assignee}\n`
        }
        
        if (task.estimatedHours) {
          markdown += `  - **预估时间:** ${task.estimatedHours}小时\n`
        }
        
        if (task.dependencies.length > 0) {
          markdown += `  - **依赖:** ${task.dependencies.join(', ')}\n`
        }
        
        if (task.requirements.length > 0) {
          markdown += `  - **需求:** ${task.requirements.join(', ')}\n`
        }
        
        markdown += '\n'
      })
    }
    
    return markdown
  }

  // 状态标签转换
  private static getStatusLabel(status: string): string {
    switch (status) {
      case 'completed': return '已完成'
      case 'in_progress': return '进行中'
      case 'blocked': return '阻塞'
      default: return '未开始'
    }
  }

  // 优先级标签转换
  private static getPriorityLabel(priority: string): string {
    switch (priority) {
      case 'urgent': return '紧急'
      case 'high': return '高'
      case 'medium': return '中'
      case 'low': return '低'
      default: return '中'
    }
  }

  // Markdown 转换为 Plate.js 文档
  static markdownToPlate(markdown: string): TDescendant[] {
    const lines = markdown.split('\n')
    const nodes: PlateNode[] = []
    let currentNode: PlateNode | null = null
    let inCodeBlock = false
    let codeBlockContent: string[] = []
    let codeBlockLanguage = ''

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      
      // 处理代码块
      if (line.startsWith('```')) {
        if (inCodeBlock) {
          // 结束代码块
          nodes.push({
            type: 'code_block',
            lang: codeBlockLanguage,
            children: [{ text: codeBlockContent.join('\n') }]
          })
          inCodeBlock = false
          codeBlockContent = []
          codeBlockLanguage = ''
        } else {
          // 开始代码块
          inCodeBlock = true
          codeBlockLanguage = line.substring(3).trim()
        }
        continue
      }
      
      if (inCodeBlock) {
        codeBlockContent.push(line)
        continue
      }
      
      // 处理标题
      if (line.startsWith('#')) {
        const level = line.match(/^#+/)?.[0].length || 1
        const text = line.substring(level).trim()
        nodes.push({
          type: `h${Math.min(level, 6)}`,
          children: [{ text }]
        })
        continue
      }
      
      // 处理引用
      if (line.startsWith('> ')) {
        nodes.push({
          type: 'blockquote',
          children: [{ text: line.substring(2) }]
        })
        continue
      }
      
      // 处理水平线
      if (line.trim() === '---') {
        nodes.push({ type: 'hr', children: [{ text: '' }] })
        continue
      }
      
      // 处理列表
      if (line.match(/^[\s]*[-*+]\s/)) {
        const text = line.replace(/^[\s]*[-*+]\s/, '')
        if (!currentNode || currentNode.type !== 'ul') {
          currentNode = { type: 'ul', children: [] }
          nodes.push(currentNode)
        }
        currentNode.children!.push({
          type: 'li',
          children: [{ text }]
        })
        continue
      }
      
      if (line.match(/^[\s]*\d+\.\s/)) {
        const text = line.replace(/^[\s]*\d+\.\s/, '')
        if (!currentNode || currentNode.type !== 'ol') {
          currentNode = { type: 'ol', children: [] }
          nodes.push(currentNode)
        }
        currentNode.children!.push({
          type: 'li',
          children: [{ text }]
        })
        continue
      }
      
      // 处理段落
      if (line.trim()) {
        currentNode = null
        nodes.push({
          type: 'p',
          children: [{ text: line }]
        })
      } else {
        currentNode = null
      }
    }
    
    // 如果没有节点，添加一个空段落
    if (nodes.length === 0) {
      nodes.push({
        type: 'p',
        children: [{ text: '' }]
      })
    }
    
    return nodes as TDescendant[]
  }

  // 验证转换结果
  static validateConversion(original: TDescendant[], converted: TDescendant[]): {
    isValid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []
    
    // 基本结构验证
    if (!Array.isArray(converted)) {
      errors.push('转换结果不是有效的数组')
      return { isValid: false, errors, warnings }
    }
    
    if (converted.length === 0) {
      warnings.push('转换结果为空')
    }
    
    // 节点类型验证
    converted.forEach((node, index) => {
      if (!node.type) {
        errors.push(`节点 ${index} 缺少 type 属性`)
      }
      
      if (!node.children && node.text === undefined) {
        errors.push(`节点 ${index} 既没有 children 也没有 text`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  // 获取文档统计信息
  static getDocumentStats(nodes: TDescendant[]): {
    wordCount: number
    characterCount: number
    nodeCount: number
    headingCount: number
    listCount: number
    codeBlockCount: number
  } {
    let wordCount = 0
    let characterCount = 0
    let nodeCount = 0
    let headingCount = 0
    let listCount = 0
    let codeBlockCount = 0
    
    const countNode = (node: PlateNode) => {
      nodeCount++
      
      if (node.type?.startsWith('h')) {
        headingCount++
      } else if (node.type === 'ul' || node.type === 'ol') {
        listCount++
      } else if (node.type === 'code_block') {
        codeBlockCount++
      }
      
      if (node.text) {
        const text = node.text.trim()
        characterCount += text.length
        if (text) {
          wordCount += text.split(/\s+/).length
        }
      }
      
      if (node.children) {
        node.children.forEach(countNode)
      }
    }
    
    nodes.forEach(node => countNode(node as PlateNode))
    
    return {
      wordCount,
      characterCount,
      nodeCount,
      headingCount,
      listCount,
      codeBlockCount
    }
  }
}