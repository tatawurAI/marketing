'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import type { ProjectFull } from '@/lib/types'
import { toggleProjectActive } from '@/app/portal/admin/actions'
import styles from './ProjectTable.module.scss'

export default function ProjectTable({ projects }: { projects: ProjectFull[] }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle(id: string, nextActive: boolean) {
    startTransition(async () => {
      await toggleProjectActive(id, nextActive)
    })
  }

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th className={styles.th}>Name</th>
          <th className={styles.th}>Client</th>
          <th className={styles.th}>Status</th>
          <th className={styles.th}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {projects.map((project) => (
          <tr key={project.id} className={styles.tr}>
            <td className={styles.td}>{project.name}</td>
            <td className={styles.td}>{project.client_name ?? '—'}</td>
            <td className={styles.td}>
              <span
                className={
                  project.is_active ? styles.badgeActive : styles.badgeInactive
                }
              >
                {project.is_active ? 'Active' : 'Inactive'}
              </span>
            </td>
            <td className={styles.tdActions}>
              <Link
                href={`/portal/admin/projects/${project.id}`}
                className={styles.actionLink}
              >
                Edit
              </Link>
              <button
                type="button"
                className={styles.actionBtn}
                onClick={() => handleToggle(project.id, !project.is_active)}
                disabled={isPending}
              >
                {project.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
