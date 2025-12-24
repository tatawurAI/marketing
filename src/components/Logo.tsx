'use client';

import Image from 'next/image';
import styles from './Logo.module.scss';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  small: 40,
  medium: 44,
  large: 52,
};

export function Logo({
  size = 'medium',
  showText = true,
  className = '',
}: LogoProps) {
  const logoClasses = [styles.logo, styles[size], className]
    .filter(Boolean)
    .join(' ');

  const imageSize = sizeMap[size];

  return (
    <div className={logoClasses}>
      <div className={styles.logoIcon}>
        <Image
          src="/logo.svg"
          alt="Tatawur AI"
          width={imageSize}
          height={imageSize}
          className={styles.logoImage}
          priority
        />
        <div className={styles.iconGlow} />
      </div>
      {showText && (
        <div className={styles.logoText}>
          <span className={styles.name}>Tatawur AI</span>
        </div>
      )}
    </div>
  );
}
