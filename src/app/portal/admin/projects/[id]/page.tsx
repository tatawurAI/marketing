import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ProjectFull } from '@/lib/types'
import ProjectForm from '@/components/admin/ProjectForm'

type PageProps = {
  params: { id: string }
}

export default async function AdminProjectEditPage({ params }: PageProps) {
  if (params.id === 'new') {
    return <ProjectForm />
  }

  const supabase = createClient()

  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!data) notFound()

  const project = data as ProjectFull

  return <ProjectForm project={project} />
}
