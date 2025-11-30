const OpenAI = require('openai');

class AIModeration {
  constructor() {
    this.openai = null;
    this.enabled = false;

    if (process.env.OPENAI_API_KEY) {
      try {
        this.openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        this.enabled = true;
      } catch (error) {
        console.warn('OpenAI initialization failed:', error.message);
      }
    }
  }

  async analyzeWithAI(text) {
    if (!this.enabled || !this.openai) {
      return {
        isEnabled: false,
        containsContactInfo: false,
        confidence: 0,
      };
    }

    try {
      const moderationResponse = await this.openai.moderations.create({
        model: 'omni-moderation-latest',
        input: text,
      });

      const result = moderationResponse.results[0];

      const analysisPrompt = `You are an advanced phone number detection system. Analyze this message for ANY attempt to share contact information.

DETECTION RULES (Be EXTREMELY strict):
1. Direct phone numbers in ANY format (with/without spaces, dashes, dots, brackets)
2. Numbers spelled as words: "nine one seven two..." or "nine-one-seven..."
3. Mixed format: "nine 1 seven 2" or "9 one 7 two"
4. Obfuscated: "9 1 7 - 5 5 5 - 1 2 3 4" or "917 (space) 555 (space) 1234"
5. Number emojis: "9️⃣1️⃣7️⃣..."
6. Misspelled numbers: "won tu tree for" (one two three four)
7. Leet speak: "c4ll me" or "numb3r"
8. Numbers in brackets/parentheses: "(9)(1)(7)"
9. Numbers with slashes: "917/555/1234"
10. Intent to move off-platform: "let's chat on WhatsApp", "text me", "call me", "add me on telegram"
11. Sequences of 10+ digits anywhere in text (even separated by other characters)
12. Creative obfuscation: "nine hundred seventeen, fifty-five thousand, twelve thirty-four"

TREAT AS PHONE NUMBER if:
- 10+ digits found (in any format)
- Contact app mentions (WhatsApp, Telegram, Signal, Viber, Line)
- Phrases like "my number", "call me", "text me", "reach me", "contact me"
- Any creative attempt to bypass detection

Text to analyze: "${text}"

Respond with JSON only:
{
  "containsPhoneNumber": boolean,
  "confidence": number (0-100),
  "reason": "specific explanation of what was detected",
  "extractedPatterns": ["exact patterns found"],
  "suspiciousIntent": boolean
}`;

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an elite content moderation AI with expertise in detecting ALL forms of phone number and contact information sharing. Your primary goal is to prevent users from exchanging contact details in ANY format. Be EXTREMELY strict - when in doubt, flag it. Err on the side of caution to protect the platform.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      const analysis = JSON.parse(completion.choices[0].message.content);

      return {
        isEnabled: true,
        flagged: result.flagged,
        categories: result.categories,
        categoryScores: result.category_scores,
        containsContactInfo: analysis.containsPhoneNumber,
        confidence: analysis.confidence,
        reason: analysis.reason,
        extractedPatterns: analysis.extractedPatterns || [],
        suspiciousIntent: analysis.suspiciousIntent || false,
      };
    } catch (error) {
      console.error('AI moderation error:', error.message);
      return {
        isEnabled: true,
        error: error.message,
        containsContactInfo: false,
        confidence: 0,
      };
    }
  }

  async detectContactExchange(text) {
    if (!this.enabled || !this.openai) {
      return {
        detected: false,
        confidence: 0,
        isAIEnabled: false,
      };
    }

    try {
      const result = await this.analyzeWithAI(text);

      return {
        detected: result.containsContactInfo || result.flagged,
        confidence: result.confidence || 0,
        reason: result.reason || 'Flagged by AI moderation',
        patterns: result.extractedPatterns || [],
        isAIEnabled: true,
      };
    } catch (error) {
      console.error('Contact detection error:', error.message);
      return {
        detected: false,
        confidence: 0,
        error: error.message,
        isAIEnabled: true,
      };
    }
  }
}

module.exports = new AIModeration();
