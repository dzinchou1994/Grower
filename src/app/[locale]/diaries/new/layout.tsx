import { Noto_Serif_Georgian } from "next/font/google";

const diaryNotebook = Noto_Serif_Georgian({
  subsets: ["georgian"],
  weight: ["600", "700"],
  variable: "--font-diary-notebook",
  display: "swap",
});

export default function NewDiaryLayout({ children }: { children: React.ReactNode }) {
  return <div className={diaryNotebook.variable}>{children}</div>;
}
