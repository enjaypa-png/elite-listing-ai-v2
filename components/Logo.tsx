import Link from 'next/link'

interface LogoProps {
  variant?: 'full' | 'icon' | 'text'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  href?: string
  theme?: 'dark' | 'light'
}

export function Logo({ variant = 'full', size = 'md', className = '', href, theme = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  }

  const content = (
    <div className={`flex items-center ${className}`}>
      {variant === 'full' && (
        <div className="flex items-center space-x-3">
          <div className="relative">
            {/* Logo mark - Cyan bars matching brand */}
            <svg
              className={sizeClasses[size]}
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cyan gradient bars */}
              <rect x="30" y="20" width="15" height="35" fill="#00B3FF" transform="rotate(25 37.5 37.5)" />
              <rect x="45" y="15" width="15" height="45" fill="#16E0FF" transform="rotate(25 52.5 37.5)" />
              <rect x="60" y="10" width="15" height="55" fill="#5CE9FF" transform="rotate(25 67.5 37.5)" />
              {/* White/gray bars */}
              <rect x="30" y="55" width="15" height="35" fill="#FFFFFF" transform="rotate(25 37.5 72.5)" />
              <rect x="45" y="50" width="15" height="45" fill="#E5E7EB" transform="rotate(25 52.5 72.5)" />
              <rect x="60" y="45" width="15" height="55" fill="#D1D5DB" transform="rotate(25 67.5 72.5)" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold">
              <span className="text-[var(--primary)]">Elite</span>
            </span>
            <span className="text-xl font-semibold text-[var(--text)] -mt-1">Listing ai</span>
          </div>
        </div>
      )}
      
      {variant === 'icon' && (
        <svg
          className={sizeClasses[size]}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Cyan gradient bars */}
          <rect x="30" y="20" width="15" height="35" fill="#00B3FF" transform="rotate(25 37.5 37.5)" />
          <rect x="45" y="15" width="15" height="45" fill="#16E0FF" transform="rotate(25 52.5 37.5)" />
          <rect x="60" y="10" width="15" height="55" fill="#5CE9FF" transform="rotate(25 67.5 37.5)" />
          {/* White/gray bars */}
          <rect x="30" y="55" width="15" height="35" fill="#FFFFFF" transform="rotate(25 37.5 72.5)" />
          <rect x="45" y="50" width="15" height="45" fill="#E5E7EB" transform="rotate(25 52.5 72.5)" />
          <rect x="60" y="45" width="15" height="55" fill="#D1D5DB" transform="rotate(25 67.5 72.5)" />
        </svg>
      )}
      
      {variant === 'text' && (
        <div className="flex flex-col">
          <span className="text-2xl font-bold">
            <span className="text-[var(--primary)]">Elite</span>
          </span>
          <span className="text-xl font-semibold text-[var(--text)] -mt-1">Listing ai</span>
        </div>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}
