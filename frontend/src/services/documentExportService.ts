import { TDescendant } from '@udecode/plate-common'
import { PlateMarkdownConverter } from '@/utils/plateMarkdownConverter'

export interface ExportOptions {
  format: 'markdown' | 'html' | 'pdf' | 'json'
  includeMetadata?: boolean
  template?: string
  styling?: {
    theme: 'default' | 'github' | 'minimal'
    fontSize: number
    fontFamily: string
  }
}

export interface ExportResult {
  success: boolean
  data?: string | Blob
  filename: string
  mimeType: string
  error?: string
}

export interface DocumentMetadata {
  title: string
  author: string
  createdAt: Date
  updatedAt: Date
  version: string
  specType: 'requirements' | 'design' | 'tasks'
  projectId: string
}

export class DocumentExportService {
  
  // 导出为 Markdown
  static async exportToMarkdown(
    content: TDescendant[], 
    metadata?: DocumentMetadata,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      let markdown = PlateMarkdownConverter.plateToMarkdown(content)
      
      // 添加元数据
      if (options.includeMetadata && metadata) {
        const metadataHeader = this.generateMetadataHeader(metadata)
        markdown = `${metadataHeader}\n\n${markdown}`
      }
      
      const filename = this.generateFilename(metadata?.title || 'document', 'md')
      
      return {
        success: true,
        data: markdown,
        filename,
        mimeType: 'text/markdown'
      }
    } catch (error) {
      return {
        success: false,
        filename: 'error.md',
        mimeType: 'text/markdown',
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  // 导出为 HTML
  static async exportToHTML(
    content: TDescendant[], 
    metadata?: DocumentMetadata,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      // 先转换为 Markdown，然后转换为 HTML
      const markdown = PlateMarkdownConverter.plateToMarkdown(content)
      const html = this.markdownToHTML(markdown, options.styling)
      
      // 添加完整的 HTML 文档结构
      const fullHTML = this.wrapInHTMLDocument(html, metadata, options.styling)
      
      const filename = this.generateFilename(metadata?.title || 'document', 'html')
      
      return {
        success: true,
        data: fullHTML,
        filename,
        mimeType: 'text/html'
      }
    } catch (error) {
      return {
        success: false,
        filename: 'error.html',
        mimeType: 'text/html',
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  // 导出为 JSON
  static async exportToJSON(
    content: TDescendant[], 
    metadata?: DocumentMetadata,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      const data = {
        metadata: options.includeMetadata ? metadata : undefined,
        content,
        exportedAt: new Date().toISOString(),
        format: 'plate-js',
        version: '1.0'
      }
      
      const json = JSON.stringify(data, null, 2)
      const filename = this.generateFilename(metadata?.title || 'document', 'json')
      
      return {
        success: true,
        data: json,
        filename,
        mimeType: 'application/json'
      }
    } catch (error) {
      return {
        success: false,
        filename: 'error.json',
        mimeType: 'application/json',
        error: error instanceof Error ? error.message : '导出失败'
      }
    }
  }

  // 导出为 PDF (需要后端支持)
  static async exportToPDF(
    content: TDescendant[], 
    metadata?: DocumentMetadata,
    options: Partial<ExportOptions> = {}
  ): Promise<ExportResult> {
    try {
      // 先转换为 HTML
      const htmlResult = await this.exportToHTML(content, metadata, options)
      
      if (!htmlResult.success) {
        return htmlResult
      }
      
      // 调用后端 PDF 生成服务
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlResult.data,
          options: {
            format: 'A4',
            margin: '1in',
            ...options
          }
        })
      })
      
      if (!response.ok) {
        throw new Error('PDF 生成失败')
      }
      
      const blob = await response.blob()
      const filename = this.generateFilename(metadata?.title || 'document', 'pdf')
      
      return {
        success: true,
        data: blob,
        filename,
        mimeType: 'application/pdf'
      }
    } catch (error) {
      return {
        success: false,
        filename: 'error.pdf',
        mimeType: 'application/pdf',
        error: error instanceof Error ? error.message : 'PDF 导出失败'
      }
    }
  }

  // 批量导出所有规范文档
  static async exportAllSpecs(
    specs: {
      requirements?: TDescendant[]
      design?: TDescendant[]
      tasks?: TDescendant[]
    },
    projectMetadata: Omit<DocumentMetadata, 'specType'>,
    format: ExportOptions['format'] = 'markdown'
  ): Promise<{
    success: boolean
    files: ExportResult[]
    zipBlob?: Blob
    error?: string
  }> {
    try {
      const exportPromises: Promise<ExportResult>[] = []
      
      // 导出需求文档
      if (specs.requirements) {
        const metadata: DocumentMetadata = {
          ...projectMetadata,
          specType: 'requirements',
          title: `${projectMetadata.title} - 需求文档`
        }
        exportPromises.push(this.exportByFormat(specs.requirements, metadata, format))
      }
      
      // 导出设计文档
      if (specs.design) {
        const metadata: DocumentMetadata = {
          ...projectMetadata,
          specType: 'design',
          title: `${projectMetadata.title} - 设计文档`
        }
        exportPromises.push(this.exportByFormat(specs.design, metadata, format))
      }
      
      // 导出任务文档
      if (specs.tasks) {
        const metadata: DocumentMetadata = {
          ...projectMetadata,
          specType: 'tasks',
          title: `${projectMetadata.title} - 任务文档`
        }
        exportPromises.push(this.exportByFormat(specs.tasks, metadata, format))
      }
      
      const results = await Promise.all(exportPromises)
      
      // 如果有多个文件，创建 ZIP 包
      let zipBlob: Blob | undefined
      if (results.length > 1) {
        zipBlob = await this.createZipArchive(results)
      }
      
      return {
        success: results.every(r => r.success),
        files: results,
        zipBlob
      }
    } catch (error) {
      return {
        success: false,
        files: [],
        error: error instanceof Error ? error.message : '批量导出失败'
      }
    }
  }

  // 根据格式导出
  private static async exportByFormat(
    content: TDescendant[], 
    metadata: DocumentMetadata, 
    format: ExportOptions['format']
  ): Promise<ExportResult> {
    switch (format) {
      case 'markdown':
        return this.exportToMarkdown(content, metadata, { includeMetadata: true })
      case 'html':
        return this.exportToHTML(content, metadata, { includeMetadata: true })
      case 'json':
        return this.exportToJSON(content, metadata, { includeMetadata: true })
      case 'pdf':
        return this.exportToPDF(content, metadata, { includeMetadata: true })
      default:
        throw new Error(`不支持的导出格式: ${format}`)
    }
  }

  // 生成元数据头部
  private static generateMetadataHeader(metadata: DocumentMetadata): string {
    return `---
title: ${metadata.title}
author: ${metadata.author}
created: ${metadata.createdAt.toISOString()}
updated: ${metadata.updatedAt.toISOString()}
version: ${metadata.version}
type: ${metadata.specType}
project: ${metadata.projectId}
---`
  }

  // 简单的 Markdown 到 HTML 转换
  private static markdownToHTML(markdown: string, styling?: ExportOptions['styling']): string {
    let html = markdown
      // 标题
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // 粗体和斜体
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      // 代码
      .replace(/`([^`]+)`/gim, '<code>$1</code>')
      // 链接
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
      // 段落
      .replace(/\n\n/gim, '</p><p>')
      // 列表
      .replace(/^\* (.+)$/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>')
    
    return `<p>${html}</p>`
  }

  // 包装为完整的 HTML 文档
  private static wrapInHTMLDocument(
    content: string, 
    metadata?: DocumentMetadata,
    styling?: ExportOptions['styling']
  ): string {
    const theme = styling?.theme || 'default'
    const fontSize = styling?.fontSize || 14
    const fontFamily = styling?.fontFamily || 'system-ui, sans-serif'
    
    const css = this.getThemeCSS(theme, fontSize, fontFamily)
    
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${metadata?.title || '文档'}</title>
    <style>${css}</style>
</head>
<body>
    <div class="container">
        ${metadata ? `
        <header>
            <h1>${metadata.title}</h1>
            <div class="metadata">
                <p><strong>作者:</strong> ${metadata.author}</p>
                <p><strong>创建时间:</strong> ${metadata.createdAt.toLocaleDateString()}</p>
                <p><strong>更新时间:</strong> ${metadata.updatedAt.toLocaleDateString()}</p>
                <p><strong>版本:</strong> ${metadata.version}</p>
            </div>
        </header>
        ` : ''}
        <main>
            ${content}
        </main>
    </div>
</body>
</html>`
  }

  // 获取主题 CSS
  private static getThemeCSS(theme: string, fontSize: number, fontFamily: string): string {
    const baseCSS = `
      body {
        font-family: ${fontFamily};
        font-size: ${fontSize}px;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
      }
      header {
        border-bottom: 2px solid #eee;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
      }
      .metadata {
        color: #666;
        font-size: 0.9em;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 2rem;
        margin-bottom: 1rem;
      }
      code {
        background: #f5f5f5;
        padding: 0.2em 0.4em;
        border-radius: 3px;
        font-family: 'Courier New', monospace;
      }
      pre {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 5px;
        overflow-x: auto;
      }
      ul, ol {
        padding-left: 2rem;
      }
      blockquote {
        border-left: 4px solid #ddd;
        margin: 1rem 0;
        padding-left: 1rem;
        color: #666;
      }
    `
    
    switch (theme) {
      case 'github':
        return baseCSS + `
          body { color: #24292e; }
          h1, h2 { border-bottom: 1px solid #eaecef; padding-bottom: 0.3em; }
          code { background: rgba(27,31,35,0.05); }
          pre { background: #f6f8fa; }
        `
      case 'minimal':
        return baseCSS + `
          body { color: #333; }
          h1, h2, h3, h4, h5, h6 { font-weight: 400; }
          code { background: #f0f0f0; }
        `
      default:
        return baseCSS
    }
  }

  // 生成文件名
  private static generateFilename(title: string, extension: string): string {
    const sanitized = title
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase()
    
    const timestamp = new Date().toISOString().slice(0, 10)
    return `${sanitized}-${timestamp}.${extension}`
  }

  // 创建 ZIP 压缩包 (简化版本，实际需要使用 JSZip 库)
  private static async createZipArchive(files: ExportResult[]): Promise<Blob> {
    // 这里应该使用 JSZip 库来创建真正的 ZIP 文件
    // 现在返回一个模拟的 Blob
    const content = files.map(file => 
      `=== ${file.filename} ===\n${file.data}\n\n`
    ).join('')
    
    return new Blob([content], { type: 'application/zip' })
  }

  // 下载文件
  static downloadFile(result: ExportResult): void {
    if (!result.success || !result.data) {
      console.error('无法下载文件:', result.error)
      return
    }
    
    const blob = result.data instanceof Blob 
      ? result.data 
      : new Blob([result.data], { type: result.mimeType })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = result.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 预览文件内容
  static previewFile(result: ExportResult): string | null {
    if (!result.success || !result.data) {
      return null
    }
    
    if (typeof result.data === 'string') {
      return result.data
    }
    
    // 对于 Blob 类型，只能预览文本类型
    if (result.mimeType.startsWith('text/')) {
      // 这里需要异步读取 Blob，简化处理
      return '[二进制文件，无法预览]'
    }
    
    return null
  }
}