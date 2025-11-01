import React from 'react'
import Link from 'next/link'

interface ButtonProps {
  variant?: 'primary' | 'secondary'
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
}

export default function Button({ 
  variant = 'primary', 
  href, 
  onClick, 
  children,
  className = ''
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-semibold transition-all duration-200 rounded-xl px-6 py-3"
  
  const variantStyles = {
    primary: "bg-[#00B3FF] hover:bg-[#16E0FF] text-white shadow-md hover:shadow-lg",
    secondary: "border border-[#243041] text-[#F2F6FA] hover:border-[#00B3FF] hover:text-[#00B3FF]"
  }
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${className}`
  
  if (href) {
    return (
      <Link href={href} className={combinedStyles}>
        {children}
      </Link>
    )
  }
  
  return (
    <button onClick={onClick} className={combinedStyles}>
      {children}
    </button>
  )
}
