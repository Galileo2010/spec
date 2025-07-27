import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { CheckCircle, AlertCircle, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

// Acceptance Criteria element type
export interface AcceptanceCriteriaElement {
  type: 'acceptance-criteria'
  criteria: Array<{
    id: string
    condition: string
    action: string
    result: string
    type: 'WHEN' | 'IF' | 'GIVEN'
  }>
  children: any[]
}

// Individual criterion component
function CriterionItem({ 
  criterion, 
  onUpdate, 
  onDelete 
}: { 
  criterion: any
  onUpdate: (id: string, field: string, value: string) => void
  onDelete: (id: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'WHEN':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'IF':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'GIVEN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <div className="flex items-start space-x-3 p-3 border rounded-lg bg-white dark:bg-gray-800">
      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getTypeColor(criterion.type)}`}>
            {criterion.type}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(criterion.id)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
        
        {isEditing ? (
          <div className="space-y-2">
            <input
              type="text"
              value={criterion.condition}
              onChange={(e) => onUpdate(criterion.id, 'condition', e.target.value)}
              placeholder="条件..."
              className="w-full px-2 py-1 text-sm border rounded"
            />
            <input
              type="text"
              value={criterion.action}
              onChange={(e) => onUpdate(criterion.id, 'action', e.target.value)}
              placeholder="系统动作..."
              className="w-full px-2 py-1 text-sm border rounded"
            />
            <input
              type="text"
              value={criterion.result}
              onChange={(e) => onUpdate(criterion.id, 'result', e.target.value)}
              placeholder="预期结果..."
              className="w-full px-2 py-1 text-sm border rounded"
            />
            <Button size="sm" onClick={() => setIsEditing(false)}>
              完成
            </Button>
          </div>
        ) : (
          <div 
            className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded"
            onClick={() => setIsEditing(true)}
          >
            <span className="font-medium">{criterion.type}</span>
            <span className="mx-2">{criterion.condition || '[条件]'}</span>
            <span className="font-medium">THEN 系统 SHALL</span>
            <span className="mx-2">{criterion.result || '[结果]'}</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Acceptance Criteria component
export function AcceptanceCriteriaElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<AcceptanceCriteriaElement>) {
  const acceptanceCriteria = element as AcceptanceCriteriaElement
  const [criteria, setCriteria] = useState(acceptanceCriteria.criteria || [])

  const addCriterion = (type: 'WHEN' | 'IF' | 'GIVEN') => {
    const newCriterion = {
      id: Date.now().toString(),
      condition: '',
      action: '',
      result: '',
      type,
    }
    setCriteria([...criteria, newCriterion])
  }

  const updateCriterion = (id: string, field: string, value: string) => {
    setCriteria(criteria.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ))
  }

  const deleteCriterion = (id: string) => {
    setCriteria(criteria.filter(c => c.id !== id))
  }

  return (
    <PlateElement
      {...attributes}
      className="my-4 p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-950/20 rounded-r-lg"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-green-900 dark:text-green-100 mb-3">
            验收标准 (EARS 格式)
          </div>
          
          <div className="space-y-3">
            {criteria.map((criterion) => (
              <CriterionItem
                key={criterion.id}
                criterion={criterion}
                onUpdate={updateCriterion}
                onDelete={deleteCriterion}
              />
            ))}
          </div>

          <div className="mt-4 flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCriterion('WHEN')}
              className="text-green-600 border-green-300 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              WHEN 条件
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCriterion('IF')}
              className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              IF 条件
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addCriterion('GIVEN')}
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              GIVEN 前提
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-3 pl-11">
        {children}
      </div>
    </PlateElement>
  )
}

// Plugin factory
export const createAcceptanceCriteriaPlugin = createPluginFactory({
  key: 'acceptance-criteria',
  isElement: true,
  component: AcceptanceCriteriaElement,
})

// Helper function to insert acceptance criteria
export const insertAcceptanceCriteria = (editor: any) => {
  const acceptanceCriteriaNode: AcceptanceCriteriaElement = {
    type: 'acceptance-criteria',
    criteria: [],
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  editor.insertNode(acceptanceCriteriaNode)
}