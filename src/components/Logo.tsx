'use client';

import Image from 'next/image';
import styles from './Logo.module.scss';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  className?: string;
}

const iconSizeMap = {
  small: 40,
  medium: 44,
  large: 52,
};

const fullLogoHeight = {
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
    const width = Math.round(height * 4.52); // Full.svg aspect ratio: 452/100

    return (
      <div className={logoClasses}>
        <Image
          src="/logo-full.svg"
          alt="Tatawur AI"
          width={width}
          height={height}
          className={styles.fullLogo}
          priority
        />
      </div>
    );
  }

  const imageSize = iconSizeMap[size];

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
    </div>
  );
}
