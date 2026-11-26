

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
  idlePlay: "কিছু কিনো না প্লিজ, আমি তোমার জন্য অপেক্ষা করছি! চলো একসাথে দেখি? 🥺🐼",
  cardHoverMessages: [
    "এটা ট্রাই করে তো দেখো, না হলে কীভাবে বুঝবে কত সুন্দর? 🥺💛",
    "কিছু কিনো না প্লিজ, আমি তো তোমার জন্য অপেক্ষা করছি! 🐼🧶",
    "এইটা তোমাকে দারুণ মানাবে! একবার ট্রাই করেই দেখো না? ✨",
    "শুধু দেখেই যাবে? একটা ব্যাগে নাও না, আমার খুব খুশি লাগবে! 🥺💛",
    "তাঁতিরা কত ভালোবাসা দিয়ে বুনেছে… না নিলে বুঝবে কীভাবে? 🌸",
    "এতক্ষণ ধরে অপেক্ষা করছি, একটা কিছু পছন্দ করো না প্লিজ! 🐼❤️",
  ],
  lowStock: (left: number) => `Psst… only ${left} left in this size. I'd grab it before someone else does!`,
  productHelp: "Not sure about the size or colour? Call us. A real person will help you choose.",
  bagWaiting: (count: number) =>
    `You have ${count} ${count === 1 ? "piece" : "pieces"} waiting in your bag. Shall we finish up?`,
  hoverAdd: "Click for add to bag! 🐼",
  added: "Yay! Added to your bag! Happy dance! 🐼🎉",
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


export const PANDA_COPY: PandaCopy = en;
