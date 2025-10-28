// services/conversationHandler.js

const greetings = [
  "hi", "hello", "hey", "good morning", "good afternoon", "good evening", "what’s up", "how are you"
];

const casualStarts = [
  "i got your number", "someone gave me your number", "my friend sent me your contact", "are you around", "you there"
];

export function detectGreeting(text) {
  const lower = text.toLowerCase();
  return greetings.some(g => lower.includes(g));
}

export function detectCasualStart(text) {
  const lower = text.toLowerCase();
  return casualStarts.some(c => lower.includes(c));
}

export function getGreetingReply() {
  const replies = [
    "Hey 👋🏽 great to hear from you! What are you looking for today?",
    "Hi there 😄 what do you need? Phones, accessories, or something else?",
    "Yo 👋🏽 what’s up! Need help finding something?",
    "Welcome! 👋🏽 Let’s find you something nice — what do you want to check out?",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}

export function getCasualReply() {
  const replies = [
    "Haha nice one 😄 you got the right contact — I help people find phones, gadgets & accessories. What’s on your mind?",
    "Oh cool! 👋🏽 You’re at the right place. What kind of item are you checking out?",
    "That’s awesome 😎 I can help you browse phones, AirPods, watches… What do you want to see?",
  ];
  return replies[Math.floor(Math.random() * replies.length)];
}
