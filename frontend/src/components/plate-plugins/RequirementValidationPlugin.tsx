import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

// Requirement Validation element type
export interface RequirementValidationElement {
  type: 'requirement-validation'
  validationResults: {
    completeness: number
    clarity: number
    testability: number
    consistency: number
  }
  issues: Array<{
    id: string
    type: 'error' | 'warning' | 'info'
    message: string
    suggestion?: string
  }>
  children: any[]
}

// Validation issue component
function ValidationIssue({ 
  issue, 
  onResolve 
}: { 
  issue: any
  onResolve: (id: string) => void 
}) {
  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <Info className="h-4 w-4 text-gray-500" />
    }
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/20'
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950/20'
      case 'info':
        return 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20'
      default:
        return 'border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/20'
    }
  }

  return (
    <div className={`p-3 border rounded-lg ${getIssueColor(issue.type)}`}>
      <div className="flex items-start space-x-3">
        {getIssueIcon(issue.type)}
        <div className="flex-1">
          <p className="text-sm font-medium">{issue.message}</p>
          {issue.suggestion && (
            <p className="text-xs text-muted-foreground mt-1">
              建议: {issue.suggestion}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onResolve(issue.id)}
          className="text-xs"
        >
          解决
        </Button>
      </div>
    </div>
  )
}

// Score indicator component
function ScoreIndicator({ 
  label, 
  score 
}: { 
  label: string
  score: number 
}) {
  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-200'
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200'
    return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-200'
  }

  const getScoreIcon = (score: number) => {
    if (score >= 0.8) return <CheckCircle className="h-4 w-4" />
    if (score >= 0.6) return <AlertTriangle className="h-4 w-4" />
    return <XCircle className="h-4 w-4" />
  }

  return (
    <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${getScoreColor(score)}`}>
      {getScoreIcon(score)}
      <span className="text-sm font-medium">{label}</span>
      <Badge variant="secondary" className="ml-auto">
        {Math.round(score * 100)}%
      </Badge>
    </div>
  )
}

// Requirement Validation component
export function RequirementValidationElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<RequirementValidationElement>) {
  const validation = element as RequirementValidationElement

  const resolveIssue = (issueId: string) => {
    // TODO: Implement issue resolution
    console.log('Resolve issue:', issueId)
  }

  const overallScore = (
    validation.validationResults.completeness +
    validation.validationResults.clarity +
    validation.validationResults.testability +
    validation.validationResults.consistency
  ) / 4

  return (
    <PlateElement
      {...attributes}
      className="my-4 p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-950/20 rounded-r-lg"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
          <CheckCircle className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-purple-900 dark:text-purple-100 mb-3">
            需求质量评估
          </div>
          
          {/* Overall score */}
          <div className="mb-4">
            <ScoreIndicator label="总体质量" score={overallScore} />
          </div>

          {/* Detailed scores */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <ScoreIndicator 
              label="完整性" 
              score={validation.validationResults.completeness} 
            />
            <ScoreIndicator 
              label="清晰度" 
              score={validation.validationResults.clarity} 
            />
            <ScoreIndicator 
              label="可测试性" 
              score={validation.validationResults.testability} 
            />
            <ScoreIndicator 
              label="一致性" 
              score={validation.validationResults.consistency} 
            />
          </div>

          {/* Issues */}
          {validation.issues.length > 0 && (
            <div>
              <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                发现的问题 ({validation.issues.length})
              </h4>
              <div className="space-y-2">
                {validation.issues.map((issue) => (
                  <ValidationIssue
                    key={issue.id}
                    issue={issue}
                    onResolve={resolveIssue}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-3 pl-11">
        {children}
      </div>
    </PlateElement>
  )
}

// Plugin factory
export const createRequirementValidationPlugin = createPluginFactory({
  key: 'requirement-validation',
  isElement: true,
  component: RequirementValidationElement,
})

// Helper function to insert requirement validation
export const insertRequirementValidation = (
  editor: any, 
  validationResults: any, 
  issues: any[] = []
) => {
  const validationNode: RequirementValidationElement = {
    type: 'requirement-validation',
    validationResults,
    issues,
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  editor.insertNode(validationNode)
}