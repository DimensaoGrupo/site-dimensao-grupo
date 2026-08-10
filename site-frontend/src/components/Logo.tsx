import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  className?: string;
  /** Rendered height in px; width follows the ~4.95:1 source ratio automatically. */
  height?: number;
};

export default function Logo({ className = "", height = 40 }: LogoProps) {
  const width = Math.round(height * (800 / 161.6));

  return (
    <Link
      href="#home"
      aria-label="Grupo Dimensão — página inicial"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <Image
        src="/images/logo-placeholder.png"
        alt="Grupo Dimensão"
        width={width}
        height={height}
        priority
      />
    </Link>
  );
}
