import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { ProjectFull } from '@/lib/types'
import ProjectTable from '@/components/admin/ProjectTable'
import styles from './projects.module.scss'

export default async function AdminProjectsPage() {
  const supabase = createClient()

  const { data } = await supabase
    .from('projects')
    .select('*')
    .order('name')

  const projects = (data ?? []) as ProjectFull[]

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Projects</h1>
        <Link href="/portal/admin/projects/new" className={styles.newButton}>
          New Project
        </Link>
      </div>
      <ProjectTable projects={projects} />
    </div>
  )
}
