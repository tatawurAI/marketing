import styles from './LockBanner.module.scss'

export default function LockBanner({ isLocked }: { isLocked: boolean }) {
  if (!isLocked) return null
  return (
    <div className={styles.banner} role="status">
      This week is locked and cannot be edited.
    </div>
  )
}
