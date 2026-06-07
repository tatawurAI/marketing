'use client'

import { useRef, useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import styles from './UserMenu.module.scss'

interface Props {
  user: User | null
  onSignOut: () => void
}

export function UserMenu({ user, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return (
      <a href="/portal/login" className={styles.signIn}>
        Sign in
      </a>
    )
  }

  const initials = (user.email ?? '??').slice(0, 2).toUpperCase()

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        className={styles.avatar}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open user menu"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initials}
      </button>
      {open && (
        <div className={styles.dropdown} role="menu">
          <span className={styles.email}>{user.email}</span>
          <div className={styles.divider} />
          <a
            href="/portal/dashboard"
            className={styles.portalLink}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Team Portal
          </a>
          <button
            className={styles.signOutBtn}
            role="menuitem"
            onClick={() => { setOpen(false); onSignOut() }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
