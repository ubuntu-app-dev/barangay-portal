export default function MunicipalRoleIcon({
  className = "h-7 w-7",
}: {
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9l9-5 9 5z" />
      <path d="M6 11v7M10 11v7M14 11v7M18 11v7" />
      <path d="M4 20h16" />
    </svg>
  );
}
