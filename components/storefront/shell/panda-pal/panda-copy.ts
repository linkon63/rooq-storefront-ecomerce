import type { Locale } from "@/lib/i18n/locales";

/** Everything Tulo (তুলো, "cotton fluff") says, in both storefront languages. */
const en = {
  name: "Tulo",
  label: "Tulo the panda, your shopping buddy. Tap to talk.",
  sleepingLabel: "Tulo is napping. Tap to wake him up.",
  greetFirst: "Hi, I'm Tulo! 🐼 I look after the handloom here. Tap me any time you need help.",
  greetBack: "You're back! I kept your favourite corner warm. 🐼",
  menu: "Hi! How can I help you today?",
  awake: "Yawn… I'm awake! What can I do for you?",
  tickle: "Hehe, that tickles! 🧶",
  idlePlay: "I'm playing with my thread spool… want to see the new sarees together?",
  lowStock: (left: number) => `Psst… only ${left} left in this size. I'd grab it before someone else does!`,
  productHelp: "Not sure about the size or colour? Call us. A real person will help you choose.",
  bagWaiting: (count: number) =>
    `You have ${count} ${count === 1 ? "piece" : "pieces"} waiting in your bag. Shall we finish up?`,
  added: "Great pick! 💛",
  stitchEnd: "You followed the thread all the way to me! Need help choosing? Chat with us.",
  rage: "Is something not working? Sorry about that! Call us and we'll sort it out.",
  exit: "Leaving already? If anything went wrong, just give us a call.",
  empty: "Nothing here yet. Let me show you what's new!",
  error: "Oops, this page tripped over a thread. Call us if it keeps happening.",
  checkoutHelp: "Stuck at checkout? We can take your order over the phone too.",
  thanks: "Thank you for your order! The weavers will be so happy. 🎉",
  sleepAck: "Okay, I'll nap in my basket. Tap me when you need me. 💤",
  actions: {
    whatsapp: "WhatsApp",
    newIn: "See new in",
    sale: "See sale",
    openBag: "Open bag",
    sleep: "Hide Tulo",
    close: "Close",
    callUs: "Call us",
  },
};

export type PandaCopy = typeof en;

const bn: PandaCopy = {
  name: "তুলো",
  label: "তুলো পান্ডা, আপনার শপিং সঙ্গী। কথা বলতে ট্যাপ করুন।",
  sleepingLabel: "তুলো ঘুমাচ্ছে। জাগাতে ট্যাপ করুন।",
  greetFirst: "হাই, আমি তুলো! 🐼 এখানকার তাঁতের দেখাশোনা করি। দরকার হলে যেকোনো সময় আমাকে ট্যাপ করুন।",
  greetBack: "আপনি আবার এসেছেন! আপনার প্রিয় কোণটা গরম করে রেখেছি। 🐼",
  menu: "হাই! আজ কীভাবে সাহায্য করতে পারি?",
  awake: "হাই তুলে… জেগে গেছি! কী করতে পারি বলুন?",
  tickle: "হিহি, কাতুকুতু লাগে! 🧶",
  idlePlay: "আমি সুতার নাটাই নিয়ে খেলছি… চলুন একসাথে নতুন শাড়িগুলো দেখি?",
  lowStock: (left: number) => `শুনুন… এই সাইজে আর মাত্র ${left}টি বাকি। অন্য কেউ নেওয়ার আগে নিয়ে নিন!`,
  productHelp: "সাইজ বা রং নিয়ে দ্বিধা? আমাদের কল করুন, একজন মানুষ বেছে নিতে সাহায্য করবে।",
  bagWaiting: (count: number) => `আপনার ব্যাগে ${count}টি পণ্য অপেক্ষা করছে। অর্ডারটা শেষ করবেন?`,
  added: "দারুণ পছন্দ! 💛",
  stitchEnd: "সুতা ধরে একদম আমার কাছে চলে এসেছেন! বেছে নিতে সাহায্য লাগবে? আমাদের সাথে চ্যাট করুন।",
  rage: "কিছু কি কাজ করছে না? দুঃখিত! আমাদের কল করুন, আমরা ঠিক করে দেব।",
  exit: "এখনই চলে যাচ্ছেন? কোনো সমস্যা হলে একটা কল দিন।",
  empty: "এখানে এখনো কিছু নেই। চলুন নতুন কী এসেছে দেখাই!",
  error: "উফ, পেজটা সুতায় জড়িয়ে গেছে। বারবার হলে আমাদের কল করুন।",
  checkoutHelp: "চেকআউটে আটকে গেছেন? ফোনেও আমরা অর্ডার নিতে পারি।",
  thanks: "অর্ডারের জন্য ধন্যবাদ! তাঁতিরা খুব খুশি হবেন। 🎉",
  sleepAck: "ঠিক আছে, ঝুড়িতে একটু ঘুমাই। দরকার হলে ট্যাপ করবেন। 💤",
  actions: {
    whatsapp: "হোয়াটসঅ্যাপ",
    newIn: "নতুন সংগ্রহ",
    sale: "সেল দেখুন",
    openBag: "ব্যাগ খুলুন",
    sleep: "তুলোকে লুকান",
    close: "বন্ধ করুন",
    callUs: "কল করুন",
  },
};

export const PANDA_COPY: Record<Locale, PandaCopy> = { en, bn };

