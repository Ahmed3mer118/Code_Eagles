import React from 'react'

const Loading = ({
  size = 'md',
  variant = 'spinner',
  color = 'primary',
  fullScreen = false,
  message = 'Loading...'
}) => {
  // Size variants
  const sizeClasses = {
    sm: 'h-6 w-6 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-[3px]',
    xl: 'h-16 w-16 border-[4px]'
  }

  // Color variants
  const colorClasses = {
    primary: 'border-t-blue-600 border-b-blue-600',
    secondary: 'border-t-gray-600 border-b-gray-600',
    success: 'border-t-green-600 border-b-green-600',
    danger: 'border-t-red-600 border-b-red-600'
  }

  // Variant components
  const variants = {
    spinner: (
      <div
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} border-transparent`}
      />
    ),
    dots: (
      <div className="flex space-x-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`rounded-full ${sizeClasses[size].replace('h-', 'h-').replace('w-', 'w-')} ${colorClasses[color].replace('border-t-', 'bg-').replace('border-b-', '')} animate-bounce`}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    ),
    bar: (
      <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${colorClasses[color].replace('border-t-', 'bg-').replace('border-b-', '')} animate-progress`}
        />
      </div>
    )
  }

  return (
    <div
      className={`min-h-[500px] flex flex-col items-center justify-center gap-3 ${
        fullScreen
          ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50'
          : 'w-full h-full'
      }`}
    >
      {variants[variant] || variants.spinner}
      {message && (
        <p
          className={`text-${
            color === 'primary'
              ? 'blue'
              : color === 'secondary'
              ? 'gray'
              : color === 'success'
              ? 'green'
              : 'red'
          }-600 font-medium`}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default Loading