export const REACTION_OPTIONS = [
  { value: "like", label: "أعجبني", lottie: "Like.json" },
  { value: "dislike", label: "لم يعجبني", lottie: "Dislike.json" },
  { value: "love", label: "أحببته", lottie: "Love.json" },
  { value: "support", label: "دعم", lottie: "Support.json" },
  { value: "funny", label: "هاهاها", lottie: "funny.json" },
  { value: "sad", label: "حزين", lottie: "Sad.json" },
  { value: "wow", label: "واااو", lottie: "Wow.json" },
  { value: "angry", label: "غاضب", lottie: "Angry.json" },
  { value: "congrat", label: "مبروك", lottie: "Congrat.json" },
  { value: "amazing", label: "مدهش", lottie: "Amazing.json" },
  { value: "done", label: "أحسنت", lottie: "Done.json" },
  { value: "goodluck", label: "بالتوفيق", lottie: "Goodluck.json" },
  { value: "impossible", label: "محال", lottie: "Impossible.json" },
  { value: "idisagree", label: "لا أتفق", lottie: "Idisagree.json" },
  { value: "crying", label: "أبكيتني", lottie: "Crying.json" },
  { value: "imsick", label: "أنا مريض", lottie: "Imsick.json" },
  { value: "itscold", label: "الجو بارد", lottie: "Itscold.json" },
  { value: "itshot", label: "الجو حار", lottie: "Itshot.json" },
  { value: "disgust", label: "مقرف", lottie: "Disgust.json" },
  { value: "godbless", label: "بارك الله فيك", lottie: "Godbless.json" },
  { value: "eidmubarak", label: "عيد مبارك", lottie: "Eidmubarak.json" },
  { value: "godgrant", label: "الله يشافيك", lottie: "Godgrant.json" },
  { value: "ramadankareem", label: "رمضان كريم", lottie: "Ramadankareem.json" },
  { value: "blessedfriday", label: "جمعة مباركة", lottie: "Blessedfriday.json" },
  { value: "godhave", label: "الله يرحمه", lottie: "Godhave.json" },
  { value: "wonderful", label: "رائع", lottie: "Wonderful.json" },
  { value: "celebrate", label: "احتفال", lottie: "Like.json" },
  { value: "insightful", label: "ملهم", lottie: "Surprising.json" },
  { value: "boring", label: "ممل", lottie: "Boring.json" },
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

