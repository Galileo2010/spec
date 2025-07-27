import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { Link, ExternalLink, Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

// Requirement Link element type
export interface RequirementLinkElement {
  type: 'requirement-link'
  requirementId: string
  requirementTitle: string
  linkType: 'reference' | 'dependency' | 'related'
  children: any[]
}

// Requirement Link component
export function RequirementLinkElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<RequirementLinkElement>) {
  const reqLink = element as RequirementLinkElement

  const getLinkTypeColor = (type: string) => {
    switch (type) {
      case 'reference':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
      case 'dependency':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
      case 'related':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getLinkTypeLabel = (type: string) => {
    switch (type) {
      case 'reference':
        return '引用'
      case 'dependency':
        return '依赖'
      case 'related':
        return '相关'
      default:
        return '链接'
    }
  }

  const handleLinkClick = () => {
    // TODO: Navigate to the referenced requirement
    console.log('Navigate to requirement:', reqLink.requirementId)
  }

  return (
    <PlateElement
      {...attributes}
      className="inline-flex items-center space-x-1 mx-1"
    >
      <Badge 
        variant="outline" 
        className={`cursor-pointer hover:shadow-md transition-shadow ${getLinkTypeColor(reqLink.linkType)}`}
        onClick={handleLinkClick}
      >
        <Hash className="h-3 w-3 mr-1" />
        <span className="text-xs">{getLinkTypeLabel(reqLink.linkType)}</span>
        <ExternalLink className="h-3 w-3 ml-1" />
      </Badge>
      <span className="text-sm font-medium">
        {reqLink.requirementTitle || reqLink.requirementId}
      </span>
      {children}
    </PlateElement>
  )
}

// Plugin factory
export const createRequirementLinkPlugin = createPluginFactory({
  key: 'requirement-link',
  isElement: true,
  component: RequirementLinkElement,
})

// Helper function to insert requirement link
export const insertRequirementLink = (
  editor: any, 
  requirementId: string, 
  requirementTitle: string, 
  linkType: 'reference' | 'dependency' | 'related' = 'reference'
) => {
  const linkNode: RequirementLinkElement = {
    type: 'requirement-link',
    requirementId,
    requirementTitle,
    linkType,
    children: [{ text: '' }],
  }
  
  editor.insertNode(linkNode)
}