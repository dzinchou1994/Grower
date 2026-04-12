import type { Locale } from "@/lib/i18n";

export type ContentCommentLabels = {
  sectionTitle: string;
  empty: string;
  postComment: string;
  commentPlaceholder: string;
  loginToComment: string;
  posting: string;
  couldNotPost: string;
  networkError: string;
};

export function getContentCommentLabels(locale: Locale): ContentCommentLabels {
  if (locale === "ka") {
    return {
      sectionTitle: "კომენტარები",
      empty: "ჯერ არავის დაუწერია — იყავი პირველი.",
      postComment: "გამოქვეყნება",
      commentPlaceholder: "შენი აზრი ან კითხვა…",
      loginToComment: "კომენტარის დასაწერად შედი ანგარიშში.",
      posting: "იგზავნება…",
      couldNotPost: "კომენტარის გაგზავნა ვერ მოხერხდა.",
      networkError: "ქსელის შეცდომა.",
    };
  }
  if (locale === "ru") {
    return {
      sectionTitle: "Комментарии",
      empty: "Пока нет комментариев — будьте первым.",
      postComment: "Опубликовать",
      commentPlaceholder: "Ваш комментарий или вопрос…",
      loginToComment: "Войдите в аккаунт, чтобы комментировать.",
      posting: "Публикация…",
      couldNotPost: "Не удалось отправить комментарий.",
      networkError: "Ошибка сети.",
    };
  }
  return {
    sectionTitle: "Comments",
    empty: "No comments yet — be the first.",
    postComment: "Post comment",
    commentPlaceholder: "Your thoughts or question…",
    loginToComment: "Sign in to comment.",
    posting: "Posting…",
    couldNotPost: "Could not post comment.",
    networkError: "Network error.",
  };
}
