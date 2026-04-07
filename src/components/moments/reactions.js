export const REACTION_OPTIONS = [
  { value: "like", label: "أعجبني", emoji: "👍" },
  { value: "dislike", label: "لم يعجبني", emoji: "👎" },
  { value: "love", label: "أحببته", emoji: "❤️" },
  { value: "support", label: "دعم", emoji: "🫶" },
  { value: "funny", label: "مضحك جدا", emoji: "😂" },
  { value: "sad", label: "حزين", emoji: "😔" },
  { value: "wow", label: "واااو", emoji: "😮" },
  { value: "angry", label: "غاضب", emoji: "😡" },
  { value: "congrat", label: "مبروك", emoji: "🎉" },
  { value: "amazing", label: "مدهش", emoji: "🤩" },
  { value: "done", label: "أحسنت", emoji: "✅" },
  { value: "goodluck", label: "بالتوفيق", emoji: "🍀" },
  { value: "impossible", label: "محال", emoji: "🚫" },
  { value: "idisagree", label: "لا أتفق", emoji: "🙅" },
  { value: "crying", label: "أبكيتني", emoji: "😭" },
  { value: "imsick", label: "أنا مريض", emoji: "🤒" },
  { value: "itscold", label: "الجو بارد", emoji: "🥶" },
  { value: "itshot", label: "الجو حار", emoji: "🥵" },
  { value: "disgust", label: "مقرف", emoji: "🤢" },
  { value: "godbless", label: "بارك الله فيك", emoji: "🤲" },
  { value: "eidmubarak", label: "عيد مبارك", emoji: "🕌" },
  { value: "godgrant", label: "الله يشافيك", emoji: "🙏" },
  { value: "ramadankareem", label: "رمضان كريم", emoji: "🌙" },
  { value: "blessedfriday", label: "جمعة مباركة", emoji: "📿" },
  { value: "godhave", label: "الله يرحمه", emoji: "🕊️" },
  { value: "wonderful", label: "رائع", emoji: "✨" },
  { value: "celebrate", label: "احتفال", emoji: "🥳" },
  { value: "insightful", label: "ملهم", emoji: "💡" },
  { value: "boring", label: "ممل", emoji: "😴" },
];

export const REACTION_PICKER_ORDER = [
  "like",
  "dislike",
  "love",
  "support",
  "funny",
  "sad",
  "wow",
  "angry",
  "congrat",
  "amazing",
  "done",
  "goodluck",
  "impossible",
  "idisagree",
  "crying",
  "imsick",
  "itscold",
  "itshot",
  "disgust",
  "godbless",
  "eidmubarak",
  "godgrant",
  "ramadankareem",
  "blessedfriday",
  "godhave",
  "wonderful",
  "celebrate",
  "insightful",
  "boring",
];

export function orderedReactionOptions() {
  const byValue = new Map(REACTION_OPTIONS.map((item) => [item.value, item]));
  const ordered = REACTION_PICKER_ORDER.map((value) => byValue.get(value)).filter(Boolean);
  const leftovers = REACTION_OPTIONS.filter((item) => !REACTION_PICKER_ORDER.includes(item.value));
  return [...ordered, ...leftovers];
}

export function reactionByValue(value) {
  return REACTION_OPTIONS.find((item) => item.value === value) || null;
}
