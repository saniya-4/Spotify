const { callGemini } = require("../config/gemini.js");
const AdRequest = require("../models/addRequest.js");

/* =========================
   SAFETY CONFIG
========================= */
let quotaBlockedUntil = 0;
const userCooldown = new Map();
const GEMINI_COOLDOWN_MS = 8000;

const GREETINGS = [
  "hi", "hello", "hey", "hlo", "hii",
  "hola", "yo", "sup", "heya", "howdy",
];

/* =========================
   SAFE GEMINI WRAPPER
========================= */
const safeCallGemini = async (prompt, userId = "global") => {
  const now = Date.now();
  const last = userCooldown.get(userId) || 0;
  if (now - last < GEMINI_COOLDOWN_MS) return "";
  if (Date.now() < quotaBlockedUntil) return "";
  userCooldown.set(userId, now);
  try {
    return (await callGemini(prompt)) || "";
  } catch (err) {
    console.log("Gemini Error:", err);
    if (err?.status === 429 || err?.error?.code === 429) {
      quotaBlockedUntil = Date.now() + 5 * 60 * 1000;
      console.log("Gemini quota hit → blocking for 5 minutes");
    }
    return "";
  }
};

/* =========================
   AD FIELDS
========================= */
const requiredFields = [
  "product", "target_audience", "platform",
  "ad_type", "duration", "deadline", "budget",
];

const questions = {
  product:         "What are you promoting? (e.g., Nike shoes, cake shop)",
  target_audience: "Who is your target audience? (age, gender, interests)",
  platform:        "Where will this run? (Instagram, YouTube, etc.)",
  ad_type:         "What type of ad? (video, reel, banner)",
  duration:        "Ad duration? (e.g., 30 sec)",
  deadline:        "Deadline? (e.g., 25th July) — must be a future date",
  budget:          "Budget? (e.g., ₹5000 or $100)",
};

/* =========================
   CUSTOMER FIELDS
========================= */
const customerFields = [
  "client_name", "brand_name", "business_type",
  "email", "phone", "whatsapp", "city", "website",
  "instagram_handle", "target_launch_date", "revision_rounds", "extra_notes",
];

const customerQuestions = {
  client_name:        "Perfect! Now let's save your details for the brief.\n\nWhat's your full name?",
  brand_name:         "What is your brand or business name?",
  business_type:      "Type of business? (e.g., startup, agency, retail shop, freelancer)",
  email:              "Your email address?",
  phone:              "Your phone number?",
  whatsapp:           "Is your WhatsApp the same number? Type 'same' or enter a different number.",
  city:               "Which city are you based in?",
  website:            "Your website URL? (type 'skip' if none)",
  instagram_handle:   "Your Instagram handle? (e.g., @yourbrand — type 'skip' if none)",
  target_launch_date: "When do you want the ad to go live? (e.g., 1st May)",
  revision_rounds:    "How many revision rounds do you expect? (e.g., 2)",
  extra_notes:        "Any special instructions for the creative team? (type 'skip' if none)",
};

/* =========================
   FIELD VALIDATORS
   Each returns { valid, error }
========================= */
const validators = {

  // Ad fields
  product: (val) => {
    if (!val || val.trim().length < 2)
      return { valid: false, error: `❌ Product name is too short. Please be more specific. (e.g., Nike running shoes)` };
    if (val.trim().length > 100)
      return { valid: false, error: `❌ Product name is too long. Please keep it under 100 characters.` };
    return { valid: true };
  },

  target_audience: (val) => {
    if (!val || val.trim().length < 3)
      return { valid: false, error: `❌ Please describe your target audience. (e.g., 18-25 year old men interested in fitness)` };
    return { valid: true };
  },

  platform: (val) => {
    const validPlatforms = ["instagram", "youtube", "facebook", "tiktok", "twitter", "linkedin"];
    const normalized = val?.toLowerCase() || "";
    const matched = validPlatforms.some((p) => normalized.includes(p));
    if (!matched)
      return { valid: false, error: `❌ Please enter a valid platform. (e.g., Instagram, YouTube, Facebook, TikTok)` };
    return { valid: true };
  },

  ad_type: (val) => {
    const validTypes = ["video", "reel", "banner", "story", "carousel", "image", "post"];
    const normalized = val?.toLowerCase() || "";
    const matched = validTypes.some((t) => normalized.includes(t));
    if (!matched)
      return { valid: false, error: `❌ Please enter a valid ad type. (e.g., video, reel, banner, story, carousel)` };
    return { valid: true };
  },

  duration: (val) => {
    if (!val || val.trim().length < 2)
      return { valid: false, error: `❌ Please enter a valid duration. (e.g., 30 sec, 1 min, 15 seconds)` };
    if (!/\d/.test(val))
      return { valid: false, error: `❌ Duration must include a number. (e.g., 30 sec, 1 min)` };
    return { valid: true };
  },

  budget: (val) => {
    if (!val || !/\d/.test(val))
      return { valid: false, error: `❌ Please enter a valid budget with a number. (e.g., ₹5000 or $100)` };
    const num = parseInt(val.replace(/[^\d]/g, ""));
    if (num <= 0)
      return { valid: false, error: `❌ Budget must be greater than 0.` };
    return { valid: true };
  },

  // Customer fields
  client_name: (val) => {
    if (!val || val.trim().length < 2)
      return { valid: false, error: `❌ Please enter your full name. (at least 2 characters)` };
    if (!/^[a-zA-Z\s'-]+$/.test(val.trim()))
      return { valid: false, error: `❌ Name should only contain letters, spaces, hyphens, or apostrophes.` };
    if (val.trim().length > 60)
      return { valid: false, error: `❌ Name seems too long. Please enter your real name.` };
    return { valid: true };
  },

  brand_name: (val) => {
    if (!val || val.trim().length < 2)
      return { valid: false, error: `❌ Brand name is too short. Please enter your actual brand name.` };
    if (val.trim().length > 80)
      return { valid: false, error: `❌ Brand name is too long. Please keep it under 80 characters.` };
    return { valid: true };
  },

  business_type: (val) => {
    if (!val || val.trim().length < 3)
      return { valid: false, error: `❌ Please describe your business type. (e.g., startup, retail shop, freelancer)` };
    return { valid: true };
  },

  email: (val) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val || !emailRegex.test(val.trim()))
      return { valid: false, error: `❌ Please enter a valid email address. (e.g., yourname@gmail.com)` };
    return { valid: true };
  },

  phone: (val) => {
    const digits = val?.replace(/[^\d]/g, "") || "";
    if (digits.length < 10)
      return { valid: false, error: `❌ Please enter a valid phone number with at least 10 digits.` };
    if (digits.length > 15)
      return { valid: false, error: `❌ Phone number seems too long. Please check and re-enter.` };
    return { valid: true };
  },

  whatsapp: (val) => {
    if (!val) return { valid: false, error: `❌ Please type 'same' or enter your WhatsApp number.` };
    if (val.toLowerCase() === "same") return { valid: true };
    const digits = val.replace(/[^\d]/g, "");
    if (digits.length < 10)
      return { valid: false, error: `❌ WhatsApp number must have at least 10 digits. Or type 'same' if it's the same as your phone.` };
    return { valid: true };
  },

  city: (val) => {
    if (!val || val.trim().length < 2)
      return { valid: false, error: `❌ Please enter a valid city name.` };
    if (!/^[a-zA-Z\s'-]+$/.test(val.trim()))
      return { valid: false, error: `❌ City name should only contain letters. Please check and re-enter.` };
    return { valid: true };
  },

  revision_rounds: (val) => {
    if (!val || !/^\d+$/.test(val.trim()))
      return { valid: false, error: `❌ Please enter a number for revision rounds. (e.g., 2)` };
    const num = parseInt(val.trim());
    if (num < 0 || num > 20)
      return { valid: false, error: `❌ Revision rounds must be between 0 and 20.` };
    return { valid: true };
  },

  target_launch_date: (val) => {
    const result = validateDeadline(val);
    if (!result.valid) {
      if (result.reason === "past")
        return { valid: false, error: `❌ That launch date is already in the past! Please enter a future date. (e.g., 1st May)` };
      return { valid: false, error: `❌ "${val}" doesn't look like a valid date. Please enter a proper date. (e.g., 1st May)` };
    }
    return { valid: true };
  },

  // Optional fields — always valid (skip allowed)
  website: (val) => {
    if (!val || val.toLowerCase() === "skip") return { valid: true };
    if (val.length > 200)
      return { valid: false, error: `❌ Website URL seems too long. Please check and re-enter or type 'skip'.` };
    return { valid: true };
  },

  instagram_handle: (val) => {
    if (!val || val.toLowerCase() === "skip") return { valid: true };
    if (val.length > 50)
      return { valid: false, error: `❌ Instagram handle seems too long. Please check and re-enter or type 'skip'.` };
    return { valid: true };
  },

  extra_notes: () => ({ valid: true }), // always valid
};

/* =========================
   HELPERS
========================= */
const isWeakValue = (value, field) => {
  if (!value) return true;
  const val = value.toLowerCase().trim();
  const weakWords = ["food", "product", "item", "thing", "service"];
  if (field === "budget") return !/\d/.test(val);
  if (field === "deadline") return val === "" || val === "past";
  return val.length < 2 || weakWords.includes(val);
};

const isLowBudget = (value) => {
  const num = parseInt(value.replace(/[^\d]/g, ""));
  return !isNaN(num) && num < 1000;
};

const extractProduct = (text) => {
  const match = text.match(
    /(?:for|about|promoting|advertise|advertising|of)\s+(?:the\s+)?(.+?)(?:\s+with|\s+that|\s+which|$)/i
  );
  return match ? match[1].trim() : text.trim();
};

const normalizePlatform = (text) =>
  text
    .replace(/instragam|instragram|\binstagram\b|\binsta\b/gi, "Instagram")
    .replace(/\byoutub[e]?\b|\byt\b/gi, "YouTube")
    .replace(/\bfb\b|\bfacebook\b/gi, "Facebook")
    .replace(/\btiktok\b/gi, "TikTok")
    .replace(/\btwitter\b/gi, "Twitter")
    .replace(/\blinkedin\b/gi, "LinkedIn")
    .replace(/\bboth\b/gi, "")
    .replace(/\s+/g, " ")
    .replace(/,\s*/g, ", ")
    .trim()
    .replace(/,\s*$/, "");

const validateDeadline = (text) => {
  const val = text.trim().toLowerCase();
  const monthMap = {
    jan:0, january:0, feb:1, february:1, mar:2, march:2,
    apr:3, april:3, may:4, jun:5, june:5, jul:6, july:6,
    aug:7, august:7, sep:8, september:8, oct:9, october:9,
    nov:10, november:10, dec:11, december:11,
  };
  const match = val.match(
    /(\d{1,2})(?:st|nd|rd|th)?\s+([a-z]+)|([a-z]+)\s+(\d{1,2})(?:st|nd|rd|th)?/
  );
  const slashMatch = val.match(/(\d{1,2})\/(\d{1,2})/);
  let day, monthIndex;
  if (match) {
    if (match[1] && match[2]) {
      day = parseInt(match[1]);
      monthIndex = monthMap[match[2]];
    } else if (match[3] && match[4]) {
      day = parseInt(match[4]);
      monthIndex = monthMap[match[3]];
    }
  } else if (slashMatch) {
    day = parseInt(slashMatch[1]);
    monthIndex = parseInt(slashMatch[2]) - 1;
  }
  if (day === undefined || monthIndex === undefined || isNaN(monthIndex))
    return { valid: false, reason: "invalid" };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadline = new Date(today.getFullYear(), monthIndex, day);
  if (deadline < today) return { valid: false, reason: "past" };
  return { valid: true };
};

const optionalVal = (val) =>
  !val || val.toLowerCase() === "skip" ? "—" : val;

const resolveWhatsapp = (phone, whatsapp) => {
  if (!whatsapp) return phone;
  return whatsapp.toLowerCase() === "same" ? phone : whatsapp;
};

/* =========================
   BASE RESPONSE SHAPE
========================= */
const baseState = (overrides) => ({
  status: "incomplete",
  reply: "",
  collectedData: {},
  customerData: {},
  lastAskedField: null,
  awaitingConfirmation: false,
  collectingCustomer: false,
  awaitingCustomerConfirm: false,
  ...overrides,
});

/* =========================
   MAIN CONTROLLER
========================= */
const chatWithAI = async (req, res) => {
  try {
    const {
      message,
      collectedData = {},
      customerData = {},
      userId = "global",
      lastAskedField = null,
      awaitingConfirmation = false,
      collectingCustomer = false,
      awaitingCustomerConfirm = false,
    } = req.body;

    if (!message) return res.status(400).json({ error: "Message required" });

    const cleanMsg = message.toLowerCase().trim();
    const isSkip = ["skip", "-", "n/a", "none"].includes(cleanMsg);
    const YES = ["yes", "y", "yeah", "yep", "ok", "okay", "sure", "go", "proceed"];
    const NO  = ["no", "n", "nope", "cancel", "stop", "change"];
    const isYes = YES.includes(cleanMsg);
    const isNo  = NO.includes(cleanMsg);

    /* ─────────────────────────────
       PHASE 0 — GREETING
    ───────────────────────────── */
    if (GREETINGS.includes(cleanMsg) && !collectingCustomer) {
      return res.json(baseState({
        reply: "Hey 👋 What product or service do you want to advertise?",
        lastAskedField: "product",
      }));
    }

    /* ─────────────────────────────
       PHASE 3 — CUSTOMER CONFIRM
    ───────────────────────────── */
    if (awaitingCustomerConfirm) {
      if (isNo) {
        return res.json(baseState({
          reply: "No problem! Let's redo your details.\n\n" + customerQuestions.client_name,
          collectedData,
          customerData: {},
          lastAskedField: "client_name",
          collectingCustomer: true,
        }));
      }

      if (!isYes) {
        return res.json(baseState({
          reply: "Please reply yes to generate the brief or no to re-enter your details.",
          collectedData,
          customerData,
          collectingCustomer: true,
          awaitingCustomerConfirm: true,
        }));
      }

      const cd = collectedData;
      const cu = customerData;
      const resolvedWA = resolveWhatsapp(cu.phone, cu.whatsapp);

      const prompt = `
You are an expert ad copywriter. Silently fix any spelling mistakes in the input.

CLIENT INFO:
- Name: ${cu.client_name}
- Brand: ${cu.brand_name}
- Business Type: ${cu.business_type}
- City: ${cu.city}
- Launch Date: ${cu.target_launch_date}
- Revision Rounds: ${cu.revision_rounds}
- Extra Notes: ${optionalVal(cu.extra_notes)}

AD DETAILS:
- Product/Service: ${cd.product}
- Target Audience: ${cd.target_audience}
- Platform: ${cd.platform}
- Ad Type: ${cd.ad_type}
- Duration: ${cd.duration}
- Campaign Deadline: ${cd.deadline}
- Budget: ${cd.budget}

Write a compelling, creative ad brief with:
1. A punchy headline
2. A short description (2–3 lines) tailored to the audience and platform
3. A strong call-to-action

Keep it concise and exciting.
      `.trim();

      const aiReply = await safeCallGemini(prompt, userId);

      const finalCard =
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤  CLIENT DETAILS\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Name          : ${cu.client_name}\n` +
        `Brand         : ${cu.brand_name}\n` +
        `Business Type : ${cu.business_type}\n` +
        `Email         : ${cu.email}\n` +
        `Phone         : ${cu.phone}\n` +
        `WhatsApp      : ${resolvedWA}\n` +
        `City          : ${cu.city}\n` +
        `Website       : ${optionalVal(cu.website)}\n` +
        `Instagram     : ${optionalVal(cu.instagram_handle)}\n` +
        `Launch Date   : ${cu.target_launch_date}\n` +
        `Revisions     : ${cu.revision_rounds}\n` +
        `Notes         : ${optionalVal(cu.extra_notes)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `📦  AD BRIEF\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Product   : ${cd.product}\n` +
        `Audience  : ${cd.target_audience}\n` +
        `Platform  : ${cd.platform}\n` +
        `Type      : ${cd.ad_type}\n` +
        `Duration  : ${cd.duration}\n` +
        `Deadline  : ${cd.deadline}\n` +
        `Budget    : ${cd.budget}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `✨  GENERATED BRIEF\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        (aiReply || "✅ Ad brief ready! (AI unavailable right now)");

      try {
        await AdRequest.create({
          product:            cd.product,
          target_audience:    cd.target_audience,
          platform:           cd.platform,
          ad_type:            cd.ad_type,
          duration:           cd.duration,
          deadline:           cd.deadline,
          budget:             cd.budget,
          client_name:        cu.client_name,
          brand_name:         cu.brand_name,
          business_type:      cu.business_type,
          email:              cu.email,
          phone:              cu.phone,
          whatsapp:           resolvedWA,
          city:               cu.city,
          website:            optionalVal(cu.website),
          instagram_handle:   optionalVal(cu.instagram_handle),
          target_launch_date: cu.target_launch_date,
          revision_rounds:    cu.revision_rounds,
          extra_notes:        optionalVal(cu.extra_notes),
          generated_brief:    aiReply || "",
        });
      } catch (dbErr) {
        console.error("Failed to save AdRequest:", dbErr);
      }

      return res.json(baseState({
        status: "complete",
        reply: finalCard,
        collectedData: cd,
        customerData: cu,
      }));
    }

    /* ─────────────────────────────
       PHASE 2 — CUSTOMER COLLECTION
    ───────────────────────────── */
    if (collectingCustomer) {
      let updatedCustomer = { ...customerData };

      if (lastAskedField && message.trim().length > 0) {
        const rawValue = isSkip ? "skip" : message.trim();

        // ✅ Validate the answer for this field
        const validator = validators[lastAskedField];
        if (validator) {
          const check = validator(rawValue);
          if (!check.valid) {
            return res.json(baseState({
              reply: check.error + `\n\n` + customerQuestions[lastAskedField],
              collectedData,
              customerData: updatedCustomer, // don't save invalid value
              lastAskedField,               // ask same field again
              collectingCustomer: true,
            }));
          }
        }

        updatedCustomer[lastAskedField] = rawValue;
      }

      const missingCustomerField = customerFields.find(
        (f) => updatedCustomer[f] === undefined
      );

      if (missingCustomerField) {
        return res.json(baseState({
          reply: customerQuestions[missingCustomerField],
          collectedData,
          customerData: updatedCustomer,
          lastAskedField: missingCustomerField,
          collectingCustomer: true,
        }));
      }

      const cu = updatedCustomer;
      const resolvedWA = resolveWhatsapp(cu.phone, cu.whatsapp);

      const summary =
        `Here are your details — please check everything:\n\n` +
        `👤 Name          : ${cu.client_name}\n` +
        `🏷️  Brand         : ${cu.brand_name}\n` +
        `🏢 Business Type : ${cu.business_type}\n` +
        `📧 Email         : ${cu.email}\n` +
        `📞 Phone         : ${cu.phone}\n` +
        `💬 WhatsApp      : ${resolvedWA}\n` +
        `🏙️  City          : ${cu.city}\n` +
        `🌐 Website       : ${optionalVal(cu.website)}\n` +
        `📸 Instagram     : ${optionalVal(cu.instagram_handle)}\n` +
        `🚀 Launch Date   : ${cu.target_launch_date}\n` +
        `🔄 Revisions     : ${cu.revision_rounds}\n` +
        `📝 Notes         : ${optionalVal(cu.extra_notes)}\n\n` +
        `All good? Reply yes to generate your ad brief or no to re-enter.`;

      return res.json(baseState({
        reply: summary,
        collectedData,
        customerData: updatedCustomer,
        collectingCustomer: true,
        awaitingCustomerConfirm: true,
      }));
    }

    /* ─────────────────────────────
       PHASE 1B — AD BRIEF CONFIRM
    ───────────────────────────── */
    if (awaitingConfirmation) {
      if (isNo) {
        return res.json(baseState({
          reply: "No problem! Let's start over. What are you promoting?",
          lastAskedField: "product",
        }));
      }

      if (isYes) {
        return res.json(baseState({
          reply: customerQuestions.client_name,
          collectedData,
          lastAskedField: "client_name",
          collectingCustomer: true,
        }));
      }

      return res.json(baseState({
        reply: "Please reply yes to continue or no to start over.",
        collectedData,
        awaitingConfirmation: true,
      }));
    }

    /* ─────────────────────────────
       PHASE 1A — AD FIELD COLLECTION
    ───────────────────────────── */
    let updatedData = { ...collectedData };
    let deadlineError = null;

    if (lastAskedField && message.trim().length > 0) {
      if (lastAskedField === "product") {
        const extracted = extractProduct(message.trim());
        const check = validators.product(extracted);
        if (!check.valid) {
          return res.json(baseState({
            reply: check.error + `\n\n` + questions.product,
            collectedData: updatedData,
            lastAskedField: "product",
          }));
        }
        updatedData.product = extracted;

      } else if (lastAskedField === "platform") {
        const normalized = normalizePlatform(message.trim());
        const check = validators.platform(normalized);
        if (!check.valid) {
          return res.json(baseState({
            reply: check.error + `\n\n` + questions.platform,
            collectedData: updatedData,
            lastAskedField: "platform",
          }));
        }
        updatedData.platform = normalized;

      } else if (lastAskedField === "deadline") {
        const result = validateDeadline(message.trim());
        if (!result.valid) {
          updatedData.deadline = "";
          deadlineError = result.reason;
        } else {
          updatedData.deadline = message.trim();
        }

      } else {
        // ✅ Validate all other ad fields
        const validator = validators[lastAskedField];
        if (validator) {
          const check = validator(message.trim());
          if (!check.valid) {
            return res.json(baseState({
              reply: check.error + `\n\n` + questions[lastAskedField],
              collectedData: updatedData,
              lastAskedField,
            }));
          }
        }
        updatedData[lastAskedField] = message.trim();
      }

    } else if (
      !updatedData.product &&
      message.trim().length > 3 &&
      !GREETINGS.includes(cleanMsg)
    ) {
      updatedData.product = extractProduct(message.trim());
    }

    const missingField = requiredFields.find(
      (f) => !updatedData[f] || isWeakValue(updatedData[f], f)
    );

    if (missingField) {
      let reply = questions[missingField];
      if (missingField === "deadline" && deadlineError === "past")
        reply = `❌ That date is already in the past!\nPlease enter a future deadline. (e.g., 25th July)`;
      else if (missingField === "deadline" && deadlineError === "invalid")
        reply = `❌ "${message.trim()}" doesn't look like a valid date.\nPlease enter a proper deadline. (e.g., 25th July)`;

      return res.json(baseState({
        reply,
        collectedData: updatedData,
        lastAskedField: missingField,
      }));
    }

    /* ─────────────────────────────
       ALL AD FIELDS DONE → SUMMARY
    ───────────────────────────── */
    const summary =
      `Here's your ad info:\n\n` +
      `📦 Product  : ${updatedData.product}\n` +
      `👥 Audience : ${updatedData.target_audience}\n` +
      `📱 Platform : ${updatedData.platform}\n` +
      `🎬 Type     : ${updatedData.ad_type}\n` +
      `⏱ Duration : ${updatedData.duration}\n` +
      `📅 Deadline : ${updatedData.deadline}\n` +
      `💰 Budget   : ${updatedData.budget}\n` +
      (isLowBudget(updatedData.budget)
        ? `\n⚠️ Note: Budget seems low for a professional campaign.\n`
        : "") +
      `\nLooks good? Reply yes to continue, or no to start over.`;

    return res.json(baseState({
      reply: summary,
      collectedData: updatedData,
      awaitingConfirmation: true,
    }));

  } catch (err) {
    console.error("Controller Error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { chatWithAI };