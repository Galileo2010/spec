import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckSquare, 
  Square, 
  Clock, 
  User, 
  Calendar,
  Plus,
  Edit3,
  Trash2,
  ArrowRight,
  Flag
} from 'lucide-react'

// Task List element type
export interface TaskListElement {
  type: 'task-list'
  tasks: Array<{
    id: string
    title: string
    description: string
    status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
    priority: 'low' | 'medium' | 'high' | 'urgent'
    assignee?: string
    estimatedHours?: number
    dueDate?: string
    dependencies: string[]
    requirements: string[]
    subtasks: string[]
  }>
  title?: string
  children: any[]
}

// Task item component
function TaskItem({ 
  task, 
  onUpdate, 
  onDelete,
  allTasks 
}: { 
  task: any
  onUpdate: (id: string, updates: any) => void
  onDelete: (id: string) => void
  allTasks: any[]
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckSquare className="h-4 w-4 text-green-600" />
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'blocked':
        return <Square className="h-4 w-4 text-red-600" />
      default:
        return <Square className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'blocked':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900 dark:text-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'in_progress':
        return '进行中'
      case 'blocked':
        return '阻塞'
      default:
        return '未开始'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '紧急'
      case 'high':
        return '高'
      case 'medium':
        return '中'
      case 'low':
        return '低'
      default:
        return '中'
    }
  }

  const toggleStatus = () => {
    const statusOrder = ['not_started', 'in_progress', 'completed']
    const currentIndex = statusOrder.indexOf(task.status)
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length]
    onUpdate(task.id, { status: nextStatus })
  }

  const getDependentTasks = () => {
    return allTasks.filter(t => task.dependencies.includes(t.id))
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="p-4 bg-white dark:bg-gray-900">
        <div className="flex items-start space-x-3">
          <button
            onClick={toggleStatus}
            className="mt-1 hover:scale-110 transition-transform"
          >
            {getStatusIcon(task.status)}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 
                  className={`font-medium ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}
                >
                  {task.title}
                </h4>
                <Badge className={getStatusColor(task.status)}>
                  {getStatusLabel(task.status)}
                </Badge>
                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                  <Flag className="h-3 w-3 mr-1" />
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="h-6 w-6 p-0"
                >
                  <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="h-6 w-6 p-0"
                >
                  <Edit3 className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
              {task.assignee && (
                <div className="flex items-center space-x-1">
                  <User className="h-3 w-3" />
                  <span>{task.assignee}</span>
                </div>
              )}
              {task.estimatedHours && (
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
              {task.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{task.dueDate}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pl-7 space-y-3">
            {/* Dependencies */}
            {task.dependencies.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">依赖任务</h5>
                <div className="flex flex-wrap gap-1">
                  {getDependentTasks().map((depTask) => (
                    <Badge key={depTask.id} variant="secondary" className="text-xs">
                      {depTask.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {task.requirements.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">相关需求</h5>
                <div className="flex flex-wrap gap-1">
                  {task.requirements.map((req, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Subtasks */}
            {task.subtasks.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-1">子任务</h5>
                <div className="space-y-1">
                  {task.subtasks.map((subtask, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Square className="h-3 w-3 text-gray-400" />
                      <span>{subtask}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Task List component
export function TaskListElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<TaskListElement>) {
  const taskList = element as TaskListElement
  const [tasks, setTasks] = useState(taskList.tasks || [])

  const addTask = () => {
    const newTask = {
      id: Date.now().toString(),
      title: '新任务',
      description: '任务描述',
      status: 'not_started' as const,
      priority: 'medium' as const,
      dependencies: [],
      requirements: [],
      subtasks: [],
    }
    setTasks([...tasks, newTask])
  }

  const updateTask = (id: string, updates: any) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id))
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const inProgress = tasks.filter(t => t.status === 'in_progress').length
    const blocked = tasks.filter(t => t.status === 'blocked').length
    
    return { total, completed, inProgress, blocked }
  }

  const stats = getTaskStats()

  return (
    <PlateElement
      {...attributes}
      className="my-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <CheckSquare className="h-5 w-5 text-blue-600" />
            <span className="font-semibold">任务列表</span>
          </div>
          {taskList.title && (
            <span className="text-sm text-muted-foreground">
              {taskList.title}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2 text-xs">
            <Badge variant="secondary">{stats.total} 总计</Badge>
            <Badge className="bg-green-100 text-green-800">{stats.completed} 完成</Badge>
            <Badge className="bg-blue-100 text-blue-800">{stats.inProgress} 进行中</Badge>
            {stats.blocked > 0 && (
              <Badge className="bg-red-100 text-red-800">{stats.blocked} 阻塞</Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addTask}
          >
            <Plus className="mr-2 h-4 w-4" />
            添加任务
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      {stats.total > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>进度</span>
            <span>{Math.round((stats.completed / stats.total) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(stats.completed / stats.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Tasks */}
      <div className="space-y-3 mb-4">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onUpdate={updateTask}
            onDelete={deleteTask}
            allTasks={tasks}
          />
        ))}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <CheckSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>暂无任务</p>
          <Button
            variant="outline"
            size="sm"
            onClick={addTask}
            className="mt-2"
          >
            <Plus className="mr-2 h-4 w-4" />
            添加第一个任务
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
export const createTaskListPlugin = createPluginFactory({
  key: 'task-list',
  isElement: true,
  component: TaskListElement,
})

// Helper function to insert task list
export const insertTaskList = (
  editor: any, 
  title?: string
) => {
  const taskListNode: TaskListElement = {
    type: 'task-list',
    tasks: [],
    title,
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  editor.insertNode(taskListNode)
}