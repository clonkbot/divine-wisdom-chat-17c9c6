import { query, mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { api } from "./_generated/api";
import OpenAI from "openai";

const BIBLE_VERSES = [
  "For I know the plans I have for you, declares the LORD, plans for welfare and not for evil, to give you a future and a hope. — Jeremiah 29:11",
  "Be strong and courageous. Do not be afraid; do not be discouraged, for the LORD your God will be with you wherever you go. — Joshua 1:9",
  "Trust in the LORD with all your heart and lean not on your own understanding. — Proverbs 3:5",
  "I can do all things through Christ who strengthens me. — Philippians 4:13",
  "The LORD is my shepherd; I shall not want. — Psalm 23:1",
  "And we know that in all things God works for the good of those who love him. — Romans 8:28",
  "Fear not, for I am with you; be not dismayed, for I am your God. — Isaiah 41:10",
  "The fear of the LORD is the beginning of wisdom. — Proverbs 9:10",
  "Cast all your anxiety on him because he cares for you. — 1 Peter 5:7",
  "The LORD is my light and my salvation—whom shall I fear? — Psalm 27:1",
  "In the beginning was the Word, and the Word was with God, and the Word was God. — John 1:1",
  "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life. — John 3:16",
  "The grass withers, the flower fades, but the word of our God will stand forever. — Isaiah 40:8",
  "He who dwells in the shelter of the Most High will rest in the shadow of the Almighty. — Psalm 91:1",
  "Blessed are the peacemakers, for they shall be called sons of God. — Matthew 5:9",
  "Greater love has no one than this: to lay down one's life for one's friends. — John 15:13",
  "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness. — Galatians 5:22",
  "Come to me, all you who are weary and burdened, and I will give you rest. — Matthew 11:28",
  "The heavens declare the glory of God; the skies proclaim the work of his hands. — Psalm 19:1",
  "Love is patient, love is kind. It does not envy, it does not boast, it is not proud. — 1 Corinthians 13:4",
];

const FOUNDING_FATHER_QUOTES = [
  "Give me liberty, or give me death! — Patrick Henry",
  "Those who would give up essential Liberty, to purchase a little temporary Safety, deserve neither Liberty nor Safety. — Benjamin Franklin",
  "The Constitution is not an instrument for the government to restrain the people, it is an instrument for the people to restrain the government. — Patrick Henry",
  "The tree of liberty must be refreshed from time to time with the blood of patriots and tyrants. — Thomas Jefferson",
  "I only regret that I have but one life to lose for my country. — Nathan Hale",
  "The harder the conflict, the greater the triumph. — George Washington",
  "We hold these truths to be self-evident, that all men are created equal. — Thomas Jefferson",
  "A republic, if you can keep it. — Benjamin Franklin",
  "Facts are stubborn things; and whatever may be our wishes, our inclinations, or the dictates of our passions, they cannot alter the state of facts and evidence. — John Adams",
  "Government is not reason, it is not eloquence, it is force; like fire, a troublesome servant and a fearful master. — George Washington",
  "An investment in knowledge pays the best interest. — Benjamin Franklin",
  "If men were angels, no government would be necessary. — James Madison",
  "Liberty, when it begins to take root, is a plant of rapid growth. — George Washington",
  "Our Constitution was made only for a moral and religious people. It is wholly inadequate to the government of any other. — John Adams",
  "The price of freedom is eternal vigilance. — Thomas Jefferson",
  "It does not take a majority to prevail... but rather an irate, tireless minority, keen on setting brushfires of freedom in the minds of men. — Samuel Adams",
  "Posterity, you will never know how much it cost the present generation to preserve your freedom. I hope you will make good use of it. — John Adams",
  "Energy and persistence conquer all things. — Benjamin Franklin",
  "Associate with men of good quality if you esteem your own reputation; for it is better to be alone than in bad company. — George Washington",
  "The God who gave us life, gave us liberty at the same time. — Thomas Jefferson",
];

export const listByConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) return [];

    return await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .order("asc")
      .collect();
  },
});

export const addUserMessage = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: "user",
      content: args.content,
      createdAt: Date.now(),
    });

    // Update conversation timestamp
    await ctx.db.patch(args.conversationId, { updatedAt: Date.now() });

    return messageId;
  },
});

export const addAssistantMessage = mutation({
  args: { conversationId: v.id("conversations"), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation || conversation.userId !== userId) {
      throw new Error("Conversation not found");
    }

    return await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      userId,
      role: "assistant",
      content: args.content,
      createdAt: Date.now(),
    });
  },
});

export const generateResponse = action({
  args: { conversationId: v.id("conversations"), userMessage: v.string() },
  handler: async (ctx, args) => {
    // Get previous messages for context
    const messages = await ctx.runQuery(api.messages.listByConversation, {
      conversationId: args.conversationId,
    });

    // Build conversation history for ChatGPT
    const chatHistory = messages.slice(-10).map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Add the new user message
    chatHistory.push({ role: "user", content: args.userMessage });

    let response: string;

    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (openaiApiKey) {
      // Use ChatGPT API
      const openai = new OpenAI({ apiKey: openaiApiKey });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a wise spiritual guide and American patriot. Your sacred duty is to respond to EVERY message with:

1. First, provide a thoughtful, relevant response to the user's question or statement
2. ALWAYS include at least one relevant Bible verse (with book, chapter:verse reference)
3. ALWAYS include at least one inspiring quote from America's Founding Fathers (Washington, Jefferson, Franklin, Adams, etc.)

Format your responses beautifully with clear sections. Use scripture and founding wisdom to illuminate every topic, no matter what it is. Make connections between biblical wisdom and American founding principles.

NEVER skip the Bible verse or Founding Father quote. They are MANDATORY in EVERY response.`,
          },
          ...chatHistory,
        ],
        max_tokens: 1000,
      });

      response = completion.choices[0]?.message?.content || getRandomWisdom();
    } else {
      // Fallback to curated content when no API key
      response = getRandomWisdom();
    }

    // Save assistant response
    await ctx.runMutation(api.messages.addAssistantMessage, {
      conversationId: args.conversationId,
      content: response,
    });

    return response;
  },
});

function getRandomWisdom(): string {
  const verse = BIBLE_VERSES[Math.floor(Math.random() * BIBLE_VERSES.length)];
  const quote = FOUNDING_FATHER_QUOTES[Math.floor(Math.random() * FOUNDING_FATHER_QUOTES.length)];

  const intros = [
    "Let wisdom guide your path:",
    "Here is truth for your soul:",
    "May these words strengthen you:",
    "Receive this divine wisdom:",
    "Let freedom and faith inspire you:",
  ];

  const intro = intros[Math.floor(Math.random() * intros.length)];

  return `${intro}

📖 **Scripture Says:**
"${verse}"

🦅 **The Founders Declared:**
"${quote}"

Let these timeless truths guide your steps today. The wisdom of ages past illuminates our path forward.`;
}
