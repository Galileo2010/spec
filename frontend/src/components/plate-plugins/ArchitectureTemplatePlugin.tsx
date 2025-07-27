import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Layers, 
  Database, 
  Server, 
  Globe, 
  Smartphone,
  Cloud,
  Settings,
  Plus,
  Edit3
} from 'lucide-react'

// Architecture Template element type
export interface ArchitectureTemplateElement {
  type: 'architecture-template'
  templateType: 'layered' | 'microservices' | 'mvc' | 'clean' | 'hexagonal' | 'event-driven'
  components: Array<{
    id: string
    name: string
    type: 'frontend' | 'backend' | 'database' | 'service' | 'api' | 'middleware'
    description: string
    technologies: string[]
    connections: string[]
  }>
  title?: string
  children: any[]
}

// Component item
function ComponentItem({ 
  component, 
  onEdit, 
  onDelete 
}: { 
  component: any
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'frontend':
        return <Globe className="h-4 w-4" />
      case 'backend':
        return <Server className="h-4 w-4" />
      case 'database':
        return <Database className="h-4 w-4" />
      case 'service':
        return <Settings className="h-4 w-4" />
      case 'api':
        return <Layers className="h-4 w-4" />
      case 'middleware':
        return <Cloud className="h-4 w-4" />
      default:
        return <Settings className="h-4 w-4" />
    }
  }

  const getComponentColor = (type: string) => {
    switch (type) {
      case 'frontend':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
      case 'backend':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
      case 'database':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200'
      case 'service':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200'
      case 'api':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
      case 'middleware':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900 dark:text-indigo-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className={`p-4 border-2 rounded-lg ${getComponentColor(component.type)}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getComponentIcon(component.type)}
          <span className="font-semibold">{component.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(component.id)}
          className="h-6 w-6 p-0"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
      
      <p className="text-sm mb-3">{component.description}</p>
      
      {component.technologies.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {component.technologies.map((tech, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {tech}
            </Badge>
          ))}
        </div>
      )}
      
      {component.connections.length > 0 && (
        <div className="text-xs text-muted-foreground">
          连接到: {component.connections.join(', ')}
        </div>
      )}
    </div>
  )
}

// Architecture Template component
export function ArchitectureTemplateElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<ArchitectureTemplateElement>) {
  const template = element as ArchitectureTemplateElement
  const [components, setComponents] = useState(template.components || [])
  const [isEditing, setIsEditing] = useState(false)

  const getTemplateIcon = (type: string) => {
    switch (type) {
      case 'layered':
        return <Layers className="h-5 w-5" />
      case 'microservices':
        return <Server className="h-5 w-5" />
      case 'mvc':
        return <Globe className="h-5 w-5" />
      case 'clean':
        return <Settings className="h-5 w-5" />
      case 'hexagonal':
        return <Database className="h-5 w-5" />
      case 'event-driven':
        return <Cloud className="h-5 w-5" />
      default:
        return <Layers className="h-5 w-5" />
    }
  }

  const getTemplateLabel = (type: string) => {
    switch (type) {
      case 'layered':
        return '分层架构'
      case 'microservices':
        return '微服务架构'
      case 'mvc':
        return 'MVC 架构'
      case 'clean':
        return '清洁架构'
      case 'hexagonal':
        return '六边形架构'
      case 'event-driven':
        return '事件驱动架构'
      default:
        return '架构模板'
    }
  }

  const addComponent = () => {
    const newComponent = {
      id: Date.now().toString(),
      name: '新组件',
      type: 'service' as const,
      description: '组件描述',
      technologies: [],
      connections: [],
    }
    setComponents([...components, newComponent])
  }

  const editComponent = (id: string) => {
    // TODO: Implement component editing
    console.log('Edit component:', id)
  }

  const deleteComponent = (id: string) => {
    setComponents(components.filter(c => c.id !== id))
  }

  return (
    <PlateElement
      {...attributes}
      className="my-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {getTemplateIcon(template.templateType)}
            <span className="font-semibold">架构设计</span>
          </div>
          <Badge variant="outline">
            {getTemplateLabel(template.templateType)}
          </Badge>
          {template.title && (
            <span className="text-sm text-muted-foreground">
              {template.title}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={addComponent}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加组件
          </Button>
        </div>
      </div>

      {/* Architecture overview */}
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h4 className="font-medium mb-2">架构概述</h4>
        <p className="text-sm text-muted-foreground">
          {template.templateType === 'layered' && '分层架构将应用程序分为表示层、业务层和数据层，每层只能与相邻层通信。'}
          {template.templateType === 'microservices' && '微服务架构将应用程序分解为小型、独立的服务，每个服务负责特定的业务功能。'}
          {template.templateType === 'mvc' && 'MVC 架构将应用程序分为模型（Model）、视图（View）和控制器（Controller）三个组件。'}
          {template.templateType === 'clean' && '清洁架构强调依赖倒置，核心业务逻辑不依赖于外部框架和技术细节。'}
          {template.templateType === 'hexagonal' && '六边形架构（端口和适配器）将核心业务逻辑与外部系统隔离。'}
          {template.templateType === 'event-driven' && '事件驱动架构通过事件的产生、传播和消费来实现组件间的松耦合通信。'}
        </p>
      </div>

      {/* Components grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {components.map((component) => (
          <ComponentItem
            key={component.id}
            component={component}
            onEdit={editComponent}
            onDelete={deleteComponent}
          />
        ))}
      </div>

      {components.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Layers className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>暂无架构组件</p>
          <Button
            variant="outline"
            size="sm"
            onClick={addComponent}
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加第一个组件
          </Button>
        </div>
      )}
      
      <div className="mt-4">
        {children}
      </div>
    </PlateElement>
  )
}

// Plugin factory
export const createArchitectureTemplatePlugin = createPluginFactory({
  key: 'architecture-template',
  isElement: true,
  component: ArchitectureTemplateElement,
})

// Helper function to insert architecture template
export const insertArchitectureTemplate = (
  editor: any, 
  templateType: 'layered' | 'microservices' | 'mvc' | 'clean' | 'hexagonal' | 'event-driven' = 'layered',
  title?: string
) => {
  const templateNode: ArchitectureTemplateElement = {
    type: 'architecture-template',
    templateType,
    components: [],
    title,
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  editor.insertNode(templateNode)
}