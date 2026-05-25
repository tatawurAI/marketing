'use client';

import Image from 'next/image';
import styles from './Logo.module.scss';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const fullLogoHeight = {
  small: 32,
  medium: 36,
  large: 44,
};

const markSize = {
  small: 32,
  medium: 36,
  large: 44,
};

export function Logo({
  size = 'medium',
  showText = true,
  className = '',
}: LogoProps) {
  const logoClasses = [styles.logo, styles[size], className]
    .filter(Boolean)
    .join(' ');

  if (showText) {
    const height = fullLogoHeight[size];
    const width = Math.round(height * 3.7); // tatawur-lockup-horizontal viewBox 370×100

    return (
      <div className={logoClasses}>
        <Image
          src="/brand/tatawur-lockup-horizontal-ivory.svg"
          alt="Tatawur AI"
          width={width}
          height={height}
          className={styles.fullLogo}
          priority
        />
      </div>
    );
  }

  const sz = markSize[size];

  return (
    <div className={logoClasses}>
      <div className={styles.logoIcon}>
        <Image
          src="/brand/tatawur-mark-ivory.svg"
          alt="Tatawur AI"
          width={sz}
          height={sz}
          className={styles.logoImage}
          priority
        />
        <div className={styles.iconGlow} />
      </div>
    </div>
  );
}
