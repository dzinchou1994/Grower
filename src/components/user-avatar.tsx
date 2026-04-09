import { getAvatarOptionByImage } from "@/lib/avatar-options";

type Size = "sm" | "md" | "lg";

function sizeClass(size: Size) {
  if (size === "sm") {
    return "h-7 w-7 text-base";
  }
  if (size === "lg") {
    return "h-12 w-12 text-3xl";
  }
  return "h-9 w-9 text-2xl";
}

export function UserAvatar({
  username,
  image,
  size = "md",
}: {
  username: string;
  image?: string | null;
  size?: Size;
}) {
  const option = getAvatarOptionByImage(image);

  return (
    <span
      suppressHydrationWarning
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-gradient-to-br from-slate-800 to-slate-950 ${sizeClass(size)}`}
      title={`${username} - ${option.label}`}
      aria-label={`${username} avatar`}
    >
      {option.imagePath ? (
        <img
          src={option.imagePath}
          alt=""
          className="h-full w-full object-cover"
          draggable={false}
        />
      ) : (
        <span className="text-[1em] leading-none">{option.emoji ?? "🧔"}</span>
      )}
    </span>
  );
}
