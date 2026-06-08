'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { ProjectFull } from '@/lib/types'
import { createProject, updateProject } from '@/app/portal/admin/actions'
import styles from './ProjectForm.module.scss'

export default function ProjectForm({ project }: { project?: ProjectFull }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [formError, setFormError] = useState<string | null>(null)

  const isEdit = !!project

  const [name, setName] = useState(project?.name ?? '')
  const [clientName, setClientName] = useState(project?.client_name ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [isActive, setIsActive] = useState(project?.is_active ?? true)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setFormError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = isEdit
        ? await updateProject(formData)
        : await createProject(formData)
      if (!result.error) {
        router.push('/portal/admin/projects')
      } else {
        setFormError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {isEdit && <input type="hidden" name="id" value={project.id} />}

      {formError && <p className={styles.formError}>{formError}</p>}

      <div className={styles.field}>
        <label htmlFor="name" className={styles.label}>
          Project Name <span className={styles.required}>*</span>
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="client_name" className={styles.label}>
          Client Name
        </label>
        <input
          id="client_name"
          name="client_name"
          type="text"
          className={styles.input}
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="description" className={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          name="description"
          className={styles.textarea}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className={styles.checkboxField}>
        <input
          id="is_active"
          name="is_active"
          type="checkbox"
          className={styles.checkbox}
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          value="true"
        />
        <label htmlFor="is_active" className={styles.checkboxLabel}>
          Active
        </label>
      </div>

      <div className={styles.actions}>
        <Link href="/portal/admin/projects" className={styles.cancelLink}>
          Cancel
        </Link>
        <button
          type="submit"
          className={styles.submitBtn}
          disabled={isPending}
        >
          {isPending ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}
