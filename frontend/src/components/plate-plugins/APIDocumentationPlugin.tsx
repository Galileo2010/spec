import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Globe, 
  Plus, 
  Edit3, 
  Copy,
  Play,
  Code,
  FileText
} from 'lucide-react'

// API Documentation element type
export interface APIDocumentationElement {
  type: 'api-documentation'
  endpoints: Array<{
    id: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    path: string
    summary: string
    description: string
    parameters: Array<{
      name: string
      type: string
      required: boolean
      description: string
    }>
    responses: Array<{
      status: number
      description: string
      example?: string
    }>
  }>
  title?: string
  baseUrl?: string
  children: any[]
}

// API Endpoint component
function APIEndpoint({ 
  endpoint, 
  onEdit, 
  onDelete,
  baseUrl 
}: { 
  endpoint: any
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  baseUrl?: string
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
      case 'POST':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200'
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
      case 'PATCH':
        return 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const copyEndpoint = () => {
    const fullUrl = `${baseUrl || ''}${endpoint.path}`
    navigator.clipboard.writeText(fullUrl)
  }

  const testEndpoint = () => {
    // TODO: Implement API testing
    console.log('Test endpoint:', endpoint.path)
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div 
        className="p-4 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Badge className={`font-mono text-xs ${getMethodColor(endpoint.method)}`}>
              {endpoint.method}
            </Badge>
            <code className="text-sm font-mono">{endpoint.path}</code>
            <span className="text-sm text-muted-foreground">{endpoint.summary}</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                copyEndpoint()
              }}
              className="h-6 w-6 p-0"
            >
              <Copy className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                testEndpoint()
              }}
              className="h-6 w-6 p-0"
            >
              <Play className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onEdit(endpoint.id)
              }}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          {/* Description */}
          <div className="mb-4">
            <h5 className="font-medium mb-2">描述</h5>
            <p className="text-sm text-muted-foreground">{endpoint.description}</p>
          </div>

          {/* Parameters */}
          {endpoint.parameters.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium mb-2">参数</h5>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2">名称</th>
                      <th className="text-left py-2">类型</th>
                      <th className="text-left py-2">必需</th>
                      <th className="text-left py-2">描述</th>
                    </tr>
                  </thead>
                  <tbody>
                    {endpoint.parameters.map((param: any, index: number) => (
                      <tr key={index} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 font-mono">{param.name}</td>
                        <td className="py-2">
                          <Badge variant="secondary" className="text-xs">
                            {param.type}
                          </Badge>
                        </td>
                        <td className="py-2">
                          {param.required ? (
                            <Badge variant="destructive" className="text-xs">必需</Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">可选</Badge>
                          )}
                        </td>
                        <td className="py-2 text-muted-foreground">{param.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Responses */}
          {endpoint.responses.length > 0 && (
            <div>
              <h5 className="font-medium mb-2">响应</h5>
              <div className="space-y-3">
                {endpoint.responses.map((response: any, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge 
                        variant={response.status < 300 ? "default" : "destructive"}
                        className="font-mono"
                      >
                        {response.status}
                      </Badge>
                      <span className="text-sm">{response.description}</span>
                    </div>
                    {response.example && (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                        <code>{response.example}</code>
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// API Documentation component
export function APIDocumentationElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<APIDocumentationElement>) {
  const apiDoc = element as APIDocumentationElement
  const [endpoints, setEndpoints] = useState(apiDoc.endpoints || [])

  const addEndpoint = () => {
    const newEndpoint = {
      id: Date.now().toString(),
      method: 'GET' as const,
      path: '/api/new-endpoint',
      summary: '新接口',
      description: '接口描述',
      parameters: [],
      responses: [
        {
          status: 200,
          description: '成功响应',
          example: '{\n  "success": true,\n  "data": {}\n}'
        }
      ],
    }
    setEndpoints([...endpoints, newEndpoint])
  }

  const editEndpoint = (id: string) => {
    // TODO: Implement endpoint editing
    console.log('Edit endpoint:', id)
  }

  const deleteEndpoint = (id: string) => {
    setEndpoints(endpoints.filter(e => e.id !== id))
  }

  const generateOpenAPI = () => {
    // TODO: Generate OpenAPI specification
    console.log('Generate OpenAPI spec')
  }

  return (
    <PlateElement
      {...attributes}
      className="my-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">API 文档</span>
          </div>
          {apiDoc.title && (
            <span className="text-sm text-muted-foreground">
              {apiDoc.title}
            </span>
          )}
          {apiDoc.baseUrl && (
            <Badge variant="outline" className="font-mono text-xs">
              {apiDoc.baseUrl}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={generateOpenAPI}
          >
            <Code className="mr-2 h-4 w-4" />
            OpenAPI
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={addEndpoint}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加接口
          </Button>
        </div>
      </div>

      {/* API endpoints */}
      <div className="space-y-3 mb-4">
        {endpoints.map((endpoint) => (
          <APIEndpoint
            key={endpoint.id}
            endpoint={endpoint}
            onEdit={editEndpoint}
            onDelete={deleteEndpoint}
            baseUrl={apiDoc.baseUrl}
          />
        ))}
      </div>

      {endpoints.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>暂无 API 接口</p>
          <Button
            variant="outline"
            size="sm"
            onClick={addEndpoint}
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加第一个接口
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
export const createAPIDocumentationPlugin = createPluginFactory({
  key: 'api-documentation',
  isElement: true,
  component: APIDocumentationElement,
})

// Helper function to insert API documentation
export const insertAPIDocumentation = (
  editor: any, 
  title?: string,
  baseUrl?: string
) => {
  const apiDocNode: APIDocumentationElement = {
    type: 'api-documentation',
    endpoints: [],
    title,
    baseUrl,
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  editor.insertNode(apiDocNode)
}