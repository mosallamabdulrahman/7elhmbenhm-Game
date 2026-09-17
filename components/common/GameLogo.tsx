import React from "react";

export interface GameLogoProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

// Centralized Game Logo component
// To change the logo globally, just change the src path here!
export default function GameLogo({
  className = "w-10 h-10",
  alt = "حيلهم بينهم",
  ...props
}: GameLogoProps) {
  return (
    <img
      src="/images/logo.png"
      alt={alt}
      className={`object-contain ${className}`}
      {...props}
    />
  );
}
