export function CannabisLeaf({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="currentColor"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32 2C32 2 30 16 24 22C18 28 6 30 6 30C6 30 14 32 20 30C14 36 4 40 4 40C4 40 16 40 24 36C22 42 18 52 18 52C18 52 26 44 28 36C28 36 30 46 30 56L32 62L34 56C34 46 36 36 36 36C38 44 46 52 46 52C46 52 42 42 40 36C48 40 60 40 60 40C60 40 50 36 44 30C50 32 58 30 58 30C58 30 46 28 40 22C34 16 32 2 32 2Z" />
    </svg>
  );
}

export function CannabisLeafOutline({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M32 2C32 2 30 16 24 22C18 28 6 30 6 30C6 30 14 32 20 30C14 36 4 40 4 40C4 40 16 40 24 36C22 42 18 52 18 52C18 52 26 44 28 36C28 36 30 46 30 56L32 62L34 56C34 46 36 36 36 36C38 44 46 52 46 52C46 52 42 42 40 36C48 40 60 40 60 40C60 40 50 36 44 30C50 32 58 30 58 30C58 30 46 28 40 22C34 16 32 2 32 2Z" />
    </svg>
  );
}

export function BookOpenIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M3.5 5.5A2.5 2.5 0 0 1 6 3h6.5v15H6a2.5 2.5 0 0 0-2.5 2.5V5.5Z" />
      <path d="M20.5 5.5A2.5 2.5 0 0 0 18 3h-6.5v15H18a2.5 2.5 0 0 1 2.5 2.5V5.5Z" />
      <path d="M12 6h4" />
      <path d="M12 9h4" />
    </svg>
  );
}
