import { Hono } from 'hono'
import { z } from 'zod'
import { GenerateSpecSchema } from '@shared/types'
import { AIService } from '../services/aiService'

export const aiRoutes = new Hono()

// Generate spec content using AI
aiRoutes.post('/generate', async (c) => {
  try {
    const body = await c.req.json()
    const request = GenerateSpecSchema.parse(body)
    
    const aiService = AIService.getInstance()
    const content = await aiService.generateSpec(request)
    
    return c.json({ content })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: 'Invalid input', details: error.errors }, 400)
    }
    console.error('AI generation error:', error)
    return c.json({ error: 'Failed to generate content' }, 500)
  }
})

// Analyze spec content
aiRoutes.post('/analyze', async (c) => {
  try {
    const body = await c.req.json()
    const { content, specType } = body
    
    if (!Array.isArray(content)) {
      return c.json({ error: 'Content must be an array' }, 400)
    }
    
    const aiService = AIService.getInstance()
    const analysis = await aiService.analyzeContent(content, specType)
    
    return c.json(analysis)
  } catch (error) {
    console.error('AI analysis error:', error)
    return c.json({ error: 'Failed to analyze content' }, 500)
  }
})

// Validate spec consistency
aiRoutes.post('/validate', async (c) => {
  try {
    const body = await c.req.json()
    const { requirements, design, tasks } = body
    
    // TODO: Implement consistency validation
    // For now, return mock validation
    const mockValidation = {
      isConsistent: true,
      issues: [],
      suggestions: [
        '需求文档结构清晰，建议添加更多验收标准',
        '设计文档技术栈选择合理',
        '任务分解粒度适中，依赖关系明确'
      ]
    }
    
    return c.json(mockValidation)
  } catch (error) {
    throw error
  }
})

// Mock content generation functions
function generateMockContent(specType: string, input: string) {
  switch (specType) {
    case 'requirements':
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
          children: [{ text: `基于用户输入"${input}"生成的需求文档。` }]
        },
        {
          type: 'heading',
          level: 2,
          children: [{ text: '功能需求' }]
        },
        {
          type: 'heading',
          level: 3,
          children: [{ text: 'Requirement 1' }]
        },
        {
          type: 'paragraph',
          children: [{ text: '**用户故事:** 作为用户，我希望能够使用系统的核心功能，以便提升工作效率。' }]
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
              children: [{ text: 'WHEN 用户访问系统 THEN 系统 SHALL 显示主界面' }]
            },
            {
              type: 'list-item', 
              children: [{ text: 'WHEN 用户执行操作 THEN 系统 SHALL 在2秒内响应' }]
            }
          ]
        }
      ]
      
    case 'design':
      return [
        {
          type: 'heading',
          level: 1,
          children: [{ text: '设计文档' }]
        },
        {
          type: 'heading',
          level: 2,
          children: [{ text: '系统架构' }]
        },
        {
          type: 'paragraph',
          children: [{ text: `基于需求"${input}"设计的系统架构。` }]
        },
        {
          type: 'heading',
          level: 3,
          children: [{ text: '技术栈' }]
        },
        {
          type: 'list',
          listType: 'unordered',
          children: [
            {
              type: 'list-item',
              children: [{ text: '前端: React + TypeScript' }]
            },
            {
              type: 'list-item',
              children: [{ text: '后端: Node.js + Express' }]
            },
            {
              type: 'list-item',
              children: [{ text: '数据库: PostgreSQL' }]
            }
          ]
        },
        {
          type: 'heading',
          level: 3,
          children: [{ text: '组件设计' }]
        },
        {
          type: 'code-block',
          language: 'typescript',
          children: [{ text: 'interface ComponentProps {\n  id: string;\n  name: string;\n  onUpdate: (data: any) => void;\n}' }]
        }
      ]
      
    case 'tasks':
      return [
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
          type: 'paragraph',
          children: [{ text: `基于设计文档生成的具体实施任务。` }]
        },
        {
          type: 'list',
          listType: 'unordered',
          children: [
            {
              type: 'list-item',
              children: [
                { text: '☐ 1. 搭建项目基础架构' },
                {
                  type: 'list',
                  listType: 'unordered',
                  children: [
                    {
                      type: 'list-item',
                      children: [{ text: '初始化前端项目' }]
                    },
                    {
                      type: 'list-item',
                      children: [{ text: '配置后端服务' }]
                    },
                    {
                      type: 'list-item',
                      children: [{ text: '设置数据库连接' }]
                    }
                  ]
                }
              ]
            },
            {
              type: 'list-item',
              children: [{ text: '☐ 2. 实现核心功能模块' }]
            },
            {
              type: 'list-item',
              children: [{ text: '☐ 3. 编写测试用例' }]
            },
            {
              type: 'list-item',
              children: [{ text: '☐ 4. 部署和发布' }]
            }
          ]
        }
      ]
      
    default:
      return [
        {
          type: 'paragraph',
          children: [{ text: '生成的内容将在这里显示...' }]
        }
      ]
  }
}

function generateMockAnalysis(specType: string, content: any[]) {
  switch (specType) {
    case 'requirements':
      return {
        completeness: 0.85,
        clarity: 0.90,
        testability: 0.80,
        suggestions: [
          '建议为每个需求添加优先级标识',
          '部分验收标准可以更具体化',
          '考虑添加非功能性需求'
        ],
        missingElements: [
          '性能要求',
          '安全性需求',
          '可用性标准'
        ]
      }
      
    case 'design':
      return {
        completeness: 0.88,
        consistency: 0.92,
        feasibility: 0.85,
        suggestions: [
          '建议添加错误处理策略',
          '考虑系统扩展性设计',
          '补充数据流图'
        ],
        missingElements: [
          '错误处理机制',
          '性能优化方案',
          '安全设计'
        ]
      }
      
    case 'tasks':
      return {
        completeness: 0.90,
        feasibility: 0.88,
        dependencies: 0.85,
        suggestions: [
          '任务3依赖任务1和2，建议调整顺序',
          '考虑添加测试任务的时间估算',
          '建议增加代码审查环节'
        ],
        missingElements: [
          '时间估算',
          '资源分配',
          '风险评估'
        ]
      }
      
    default:
      return {
        message: '分析完成',
        suggestions: []
      }
  }
}