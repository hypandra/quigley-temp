'use client'

import { useSession } from '@/lib/auth-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { config } from '@/lib/config'
import { ImageGenerator } from '@/components/examples/image-generator'
import { FileUploader } from '@/components/examples/file-uploader'

export default function DashboardPage() {
  const { data: session } = useSession()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Welcome back, {session?.user.name || session?.user.email}
      </p>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Welcome card - always shown */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Your {config.name} project is ready
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>This template includes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Authentication with BetterAuth</li>
              <li>PostgreSQL database with Supabase</li>
              <li>shadcn/ui components</li>
              {config.features.aiImages && <li>AI image generation (Gemini)</li>}
              {config.features.fileUploads && <li>File uploads (BunnyCDN)</li>}
            </ul>
            <p className="pt-2">
              Edit <code className="text-xs bg-muted px-1 py-0.5 rounded">src/lib/config.ts</code> to customize.
            </p>
          </CardContent>
        </Card>

        {/* Feature status card */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Status</CardTitle>
            <CardDescription>
              Enabled features for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">AI Image Generation</span>
                <span className={`text-xs px-2 py-1 rounded ${config.features.aiImages ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {config.features.aiImages ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">File Uploads</span>
                <span className={`text-xs px-2 py-1 rounded ${config.features.fileUploads ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                  {config.features.fileUploads ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            {(!config.features.aiImages || !config.features.fileUploads) && (
              <p className="text-xs text-muted-foreground mt-4">
                Enable features in <code className="bg-muted px-1 py-0.5 rounded">src/lib/config.ts</code>
              </p>
            )}
          </CardContent>
        </Card>

        {/* AI Image Generator - shown when enabled */}
        {config.features.aiImages && config.features.fileUploads && (
          <ImageGenerator />
        )}

        {/* File Uploader - shown when enabled */}
        {config.features.fileUploads && (
          <FileUploader />
        )}
      </div>

      {/* Help text when no features enabled */}
      {!config.features.aiImages && !config.features.fileUploads && (
        <Card className="mt-6">
          <CardContent className="py-8 text-center text-muted-foreground">
            <p>Enable features in <code className="bg-muted px-1 py-0.5 rounded">src/lib/config.ts</code> to see demo components.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
