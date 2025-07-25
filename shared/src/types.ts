import { z } from 'zod'

// User types
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type User = z.infer<typeof UserSchema>

// Project types
export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Project = z.infer<typeof ProjectSchema>

// Spec files types (Plate.js document structure)
export const SpecFilesSchema = z.object({
  requirements: z.array(z.any()).optional(), // TDescendant[]
  design: z.array(z.any()).optional(),       // TDescendant[]
  tasks: z.array(z.any()).optional(),        // TDescendant[]
})

export type SpecFiles = z.infer<typeof SpecFilesSchema>

// API request/response types
export const CreateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
})

export type CreateProjectRequest = z.infer<typeof CreateProjectSchema>

export const UpdateProjectSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
})

export type UpdateProjectRequest = z.infer<typeof UpdateProjectSchema>

// Auth types
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export type LoginRequest = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
})

export type RegisterRequest = z.infer<typeof RegisterSchema>

// AI generation types
export const GenerateSpecSchema = z.object({
  input: z.string().min(1, 'Input description is required'),
  specType: z.enum(['requirements', 'design', 'tasks']),
  context: z.object({
    requirements: z.array(z.any()).optional(),
    design: z.array(z.any()).optional(),
  }).optional(),
})

export type GenerateSpecRequest = z.infer<typeof GenerateSpecSchema>

// Error types
export const APIErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.any().optional(),
  timestamp: z.date(),
})

export type APIError = z.infer<typeof APIErrorSchema>

export const ErrorResponseSchema = z.object({
  error: APIErrorSchema,
  requestId: z.string(),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>