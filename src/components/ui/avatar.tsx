import React from "react";

interface AvatarProps {
  src?: string | null;
  alt: string;
  initialsText: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Avatar({ src, alt, initialsText, size = "md", className = "" }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden border border-white/10 bg-white/5 grid place-items-center ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => { 
            const img = e.currentTarget as HTMLImageElement;
            img.style.display = 'none';
            // Show initials fallback
            const parent = img.parentElement;
            if (parent) {
              parent.innerHTML = `<span class="font-medium text-white/70">${initialsText}</span>`;
            }
          }}
        />
      ) : (
        <span className="font-medium text-white/70">{initialsText}</span>
      )}
    </div>
  );
}