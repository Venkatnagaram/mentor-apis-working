const phoneNumberDetector = require('./phoneNumberDetection');
const aiModeration = require('./aiModeration');

const PROFANITY_WORDS = [
  'abuse', 'assault', 'attack', 'bitcoin', 'crypto', 'wallet',
  'password', 'credit card', 'ssn', 'social security',
  'bank account', 'routing number', 'cvv', 'pin code',
  'nude', 'explicit', 'sexual', 'porn', 'xxx',
  'kill', 'murder', 'suicide', 'harm yourself',
  'drug deal', 'illegal', 'weapon', 'gun sale',
  'scam', 'fraud', 'phishing', 'hack',
  'meet in person immediately', 'send money', 'wire transfer',
  'viagra', 'cialis', 'pharmacy',
];

const SUSPICIOUS_PATTERNS = [
  /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/gi,
  /\b\d{4}[-.\s]?\d{4}[-.\s]?\d{4}[-.\s]?\d{4}\b/gi,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:http|https):\/\/[^\s]+/gi,
  /\$\d+(?:,\d{3})*(?:\.\d{2})?/g,
];

class ContentModerationService {
  constructor() {
    this.profanityWords = PROFANITY_WORDS;
    this.suspiciousPatterns = SUSPICIOUS_PATTERNS;
    this.phoneDetector = phoneNumberDetector;
    this.aiModerator = aiModeration;
  }

  checkProfanity(text) {
    const lowerText = text.toLowerCase();
    const foundWords = [];

    for (const word of this.profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(lowerText)) {
        foundWords.push(word);
      }
    }

    return {
      hasProfanity: foundWords.length > 0,
      foundWords,
    };
  }

  checkSuspiciousPatterns(text) {
    const foundPatterns = [];

    for (const pattern of this.suspiciousPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        foundPatterns.push({
          pattern: pattern.toString(),
          matches: matches.slice(0, 3),
        });
      }
    }

    return {
      hasSuspiciousContent: foundPatterns.length > 0,
      foundPatterns,
    };
  }

  checkSpam(text) {
    const upperCaseRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    const exclamationCount = (text.match(/!/g) || []).length;
    const repeatedChars = /(.)\1{4,}/g.test(text);

    const isSpam = upperCaseRatio > 0.6 || exclamationCount > 5 || repeatedChars;

    return {
      isSpam,
      reasons: {
        upperCaseRatio: upperCaseRatio > 0.6,
        excessiveExclamation: exclamationCount > 5,
        repeatedCharacters: repeatedChars,
      },
    };
  }

  async moderateContent(text) {
    if (!text || typeof text !== 'string') {
      return {
        isAllowed: false,
        reasons: ['Invalid message content'],
      };
    }

    const profanityCheck = this.checkProfanity(text);
    const patternCheck = this.checkSuspiciousPatterns(text);
    const spamCheck = this.checkSpam(text);

    const phoneCheck = this.phoneDetector.analyzeText(text);

    let aiCheck = { detected: false, confidence: 0, isAIEnabled: false };
    try {
      aiCheck = await this.aiModerator.detectContactExchange(text);
    } catch (error) {
      console.warn('AI moderation unavailable:', error.message);
    }

    const reasons = [];

    if (profanityCheck.hasProfanity) {
      reasons.push(`Inappropriate language detected: ${profanityCheck.foundWords.join(', ')}`);
    }

    if (patternCheck.hasSuspiciousContent) {
      reasons.push('Suspicious content detected (personal info, URLs, or financial data)');
    }

    if (spamCheck.isSpam) {
      const spamReasons = Object.entries(spamCheck.reasons)
        .filter(([_, value]) => value)
        .map(([key]) => key);
      reasons.push(`Spam-like behavior: ${spamReasons.join(', ')}`);
    }

    if (phoneCheck.containsPhoneNumber || phoneCheck.suspicionLevel >= 70) {
      const phoneReasons = [];
      if (phoneCheck.reasons.directNumberFound) phoneReasons.push('direct phone number');
      if (phoneCheck.reasons.spelledOutNumbers) phoneReasons.push('numbers spelled as words');
      if (phoneCheck.reasons.obfuscatedFormat) phoneReasons.push('obfuscated number format');
      if (phoneCheck.reasons.contactContext) phoneReasons.push('contact sharing intent');
      if (phoneCheck.reasons.leetSpeak) phoneReasons.push('leet speak detected');
      if (phoneCheck.reasons.mixedFormat) phoneReasons.push('mixed number format');
      if (phoneCheck.reasons.emojiNumberFound) phoneReasons.push('emoji numbers detected');

      reasons.push(`Phone number sharing attempt detected: ${phoneReasons.join(', ')}`);
    }

    if (!phoneCheck.containsPhoneNumber && phoneCheck.suspicionLevel >= 50 && phoneCheck.reasons.contactContext) {
      reasons.push('Attempt to move conversation off-platform detected');
    }

    if (aiCheck.isAIEnabled && aiCheck.detected) {
      if (aiCheck.confidence >= 80) {
        reasons.push(`AI detected contact information sharing (${aiCheck.confidence}% confidence): ${aiCheck.reason}`);
      } else if (aiCheck.confidence >= 60 && phoneCheck.reasons.contactContext) {
        reasons.push(`Potential contact sharing attempt detected (AI: ${aiCheck.confidence}% confidence)`);
      }
    }

    return {
      isAllowed: reasons.length === 0,
      reasons,
      details: {
        profanity: profanityCheck,
        patterns: patternCheck,
        spam: spamCheck,
        phoneNumber: phoneCheck,
        aiModeration: aiCheck,
      },
    };
  }

  sanitizeMessage(text) {
    let sanitized = text.trim();

    for (const word of this.profanityWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '***');
    }

    for (const pattern of this.suspiciousPatterns) {
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }

    return sanitized;
  }
}

module.exports = new ContentModerationService();
