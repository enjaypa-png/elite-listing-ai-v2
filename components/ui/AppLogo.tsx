import Link from 'next/link';
import Image from 'next/image';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  href?: string;
}

export function AppLogo({ size = 'md', href = '/dashboard' }: AppLogoProps) {
  const heights = {
    sm: 28,
    md: 36,
    lg: 40
  };

  const height = heights[size];

  return (
    <Link 
      href={href}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'opacity 0.2s'
      }}
      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
    >
      <Image
        src="/logo.png"
        alt="Elite Listing AI"
        width={height * 3.5}
        height={height}
        style={{
          objectFit: 'contain'
        }}
        priority
      />
    </Link>
  );
}
