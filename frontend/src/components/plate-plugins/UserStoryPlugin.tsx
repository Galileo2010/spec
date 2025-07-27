import { createPluginFactory, PlateElement, PlateElementProps } from '@udecode/plate-common'
import { User, Target, Lightbulb } from 'lucide-react'

// User Story element type
export interface UserStoryElement {
  type: 'user-story'
  role: string
  feature: string
  benefit: string
  children: any[]
}

// User Story component
export function UserStoryElement({ 
  attributes, 
  children, 
  element 
}: PlateElementProps<UserStoryElement>) {
  const userStory = element as UserStoryElement

  return (
    <PlateElement
      {...attributes}
      className="my-4 p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/20 rounded-r-lg"
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <User className="h-4 w-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            用户故事
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start space-x-2">
              <User className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">作为</span>
                <span className="mx-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                  {userStory.role || '[角色]'}
                </span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Target className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">我希望</span>
                <span className="mx-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                  {userStory.feature || '[功能]'}
                </span>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium">以便</span>
                <span className="mx-2 px-2 py-1 bg-blue-100 dark:bg-blue-900 rounded text-blue-800 dark:text-blue-200">
                  {userStory.benefit || '[价值]'}
                </span>
              </div>
            </div>
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
export const createUserStoryPlugin = createPluginFactory({
  key: 'user-story',
  isElement: true,
  component: UserStoryElement,
})

// Helper function to insert user story
export const insertUserStory = (editor: any, role = '', feature = '', benefit = '') => {
  const userStoryNode: UserStoryElement = {
    type: 'user-story',
    role,
    feature,
    benefit,
    children: [{ type: 'p', children: [{ text: '' }] }],
  }
  
  // Insert the user story node
  editor.insertNode(userStoryNode)
}