const NUMBER_WORDS = {
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  'ten': '10', 'eleven': '11', 'twelve': '12', 'thirteen': '13',
  'fourteen': '14', 'fifteen': '15', 'sixteen': '16', 'seventeen': '17',
  'eighteen': '18', 'nineteen': '19', 'twenty': '20', 'thirty': '30',
  'forty': '40', 'fifty': '50', 'sixty': '60', 'seventy': '70',
  'eighty': '80', 'ninety': '90', 'hundred': '100', 'thousand': '1000',
  'o': '0', 'oh': '0', 'nil': '0', 'nought': '0',
};

const NUMBER_WORDS_VARIATIONS = {
  'won': '1', 'tu': '2', 'too': '2', 'tree': '3', 'free': '3',
  'for': '4', 'fore': '4', 'fiv': '5', 'sicks': '6', 'sex': '6',
  'ate': '8', 'nein': '9', 'nin': '9', 'tin': '10'
};

const EMOJI_NUMBERS = {
  '0️⃣': '0', '1️⃣': '1', '2️⃣': '2', '3️⃣': '3', '4️⃣': '4',
  '5️⃣': '5', '6️⃣': '6', '7️⃣': '7', '8️⃣': '8', '9️⃣': '9',
  '🔟': '10'
};

const PHONE_NUMBER_PATTERNS = [
  /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/gi,
  /\b\d{10,15}\b/gi,
  /\b\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/gi,
  /\b\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}\b/gi,
  /\b\d{5}[-.\s]?\d{5}\b/gi,
  /\b\d{4}[-.\s]?\d{3}[-.\s]?\d{3}\b/gi,
  /\b\d{2}[-.\s]?\d{4}[-.\s]?\d{4}\b/gi,
  /\b\d{3}\s?\d{7}\b/gi,
  /\b91[-.\s]?\d{10}\b/gi,
  /\b\+91[-.\s]?\d{10}\b/gi,
  /\b\d[\s._-]\d[\s._-]\d[\s._-]\d[\s._-]\d[\s._-]\d[\s._-]\d[\s._-]\d[\s._-]\d[\s._-]\d\b/gi,
  /\b\d{1,4}[\s,]+\d{1,4}[\s,]+\d{1,4}[\s,]+\d{1,4}\b/gi,
];

const CONTACT_PHRASES = [
  'call me', 'text me', 'whatsapp', 'whatsapp me', 'message me',
  'reach me', 'contact me', 'my number', 'phone number', 'mobile number',
  'cell phone', 'my phone', 'my mobile', 'call on', 'reach on',
  'contact on', 'dm me', 'ping me', 'hit me up', 'give me a call',
  'send me a text', 'ring me', 'dial', 'reach out', 'get in touch',
  'phone me', 'contact number', 'mobile no', 'cell no', 'phone no',
  'my cell', 'my contact', 'here is my', 'this is my', 'my digits',
  'share my number', 'here\'s my', 'telegram', 'signal app',
  'viber', 'wechat', 'line app', 'inbox me', 'drop me',
  'buzz me', 'hmu', 'reach me at', 'contact me at', 'call me at',
  'text me at', 'message me at', 'find me on', 'add me on',
  'im me', 'direct message', 'private message', 'off platform',
  'outside this app', 'move to', 'continue on', 'lets talk on',
  'let\'s chat on', 'switch to', 'talk offline', 'connect outside',
];

class PhoneNumberDetector {
  constructor() {
    this.numberWords = { ...NUMBER_WORDS, ...NUMBER_WORDS_VARIATIONS };
    this.emojiNumbers = EMOJI_NUMBERS;
    this.phonePatterns = PHONE_NUMBER_PATTERNS;
    this.contactPhrases = CONTACT_PHRASES;
  }

  convertEmojisToNumbers(text) {
    let converted = text;
    for (const [emoji, num] of Object.entries(this.emojiNumbers)) {
      converted = converted.replaceAll(emoji, num);
    }
    return converted;
  }

  convertWordsToNumbers(text) {
    let converted = text.toLowerCase();
    converted = this.convertEmojisToNumbers(converted);

    const words = converted.split(/[\s\-,;:]+/);
    let result = '';
    let currentNumber = '';

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-z0-9]/g, '');

      if (this.numberWords[word] !== undefined) {
        currentNumber += this.numberWords[word];
      } else if (currentNumber.length > 0) {
        result += ' ' + currentNumber + ' ';
        currentNumber = '';
        result += word + ' ';
      } else {
        result += word + ' ';
      }
    }

    if (currentNumber.length > 0) {
      result += ' ' + currentNumber;
    }

    return result.trim();
  }

  detectObfuscatedNumbers(text) {
    const obfuscationPatterns = [
      /\d[\s@#*_\-.,|/\\]{1,3}\d[\s@#*_\-.,|/\\]{1,3}\d/gi,
      /\b\d+\s*(?:at|@|\[at\])\s*\d+\s*\d+/gi,
      /\d+\s*[*×xX]+\s*\d+/gi,
      /\d+\s+(?:dot|period|point|\.\.)\s+\d+/gi,
      /\d{1,3}[\s]+\d{1,3}[\s]+\d{1,3}[\s]+\d{1,3}/gi,
      /\(\s*\d+\s*\)[\s]*\d+/gi,
      /\d+[\s]*\{\s*\d+\s*\}/gi,
      /\d+[\s]*\[\s*\d+\s*\]/gi,
      /\b\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d[\s._-]{1,2}\d\b/gi,
      /\d+\s*slash\s*\d+/gi,
      /\d+\s*dash\s*\d+/gi,
      /\d+\s*space\s*\d+/gi,
    ];

    for (const pattern of obfuscationPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  detectSpelledOutNumbers(text) {
    const lowerText = text.toLowerCase();
    const allNumberWords = Object.keys(this.numberWords).join('|');
    const numberWordRegex = new RegExp(`\\b(${allNumberWords})\\b`, 'gi');
    const matches = lowerText.match(numberWordRegex);

    if (!matches || matches.length < 7) {
      return false;
    }

    const words = lowerText.split(/[\s,;:.!?-]+/);
    let consecutiveNumbers = 0;
    let maxConsecutive = 0;
    let totalNumberWords = 0;

    for (const word of words) {
      const cleanWord = word.replace(/[^a-z]/g, '');
      if (this.numberWords[cleanWord] !== undefined) {
        consecutiveNumbers++;
        totalNumberWords++;
        maxConsecutive = Math.max(maxConsecutive, consecutiveNumbers);
      } else {
        consecutiveNumbers = 0;
      }
    }

    return maxConsecutive >= 7 || totalNumberWords >= 10;
  }

  detectContactContext(text) {
    const lowerText = text.toLowerCase();

    for (const phrase of this.contactPhrases) {
      if (lowerText.includes(phrase)) {
        return true;
      }
    }

    return false;
  }

  detectPhonePatterns(text) {
    for (const pattern of this.phonePatterns) {
      const matches = text.match(pattern);
      if (matches) {
        for (const match of matches) {
          const digits = match.replace(/\D/g, '');
          if (digits.length >= 10 && digits.length <= 15) {
            return {
              found: true,
              matches: matches,
              type: 'direct_number',
            };
          }
        }
      }
    }

    return { found: false };
  }

  detectSequentialDigits(text) {
    const digitSequences = text.match(/\d+/g);

    if (!digitSequences) return false;

    for (const sequence of digitSequences) {
      if (sequence.length >= 10) {
        return true;
      }
    }

    const allDigits = digitSequences.join('');
    if (allDigits.length >= 10) {
      return true;
    }

    const sparsedDigits = text.replace(/[^0-9]/g, '');
    if (sparsedDigits.length >= 10) {
      return true;
    }

    return false;
  }

  detectMixedFormat(text) {
    const patterns = [
      /\b(?:nine|9)\s*(?:one|1)\s*(?:seven|8)/gi,
      /\b\d+\s+(?:zero|one|two|three|four|five|six|seven|eight|nine)/gi,
      /\b(?:zero|one|two|three|four|five|six|seven|eight|nine)\s+\d+/gi,
      /[0-9]{2,}\s*[a-z]+\s*[0-9]{2,}/gi,
    ];

    for (const pattern of patterns) {
      if (pattern.test(text)) {
        return true;
      }
    }

    return false;
  }

  detectLeetSpeak(text) {
    const leetMap = {
      '0': 'o', '1': 'i', '3': 'e', '4': 'a', '5': 's',
      '7': 't', '8': 'b', '9': 'g'
    };

    let suspicionScore = 0;
    const lowerText = text.toLowerCase();

    if (/ph0ne|c4ll|t3xt|numb3r|c0nt4ct/i.test(lowerText)) {
      suspicionScore += 50;
    }

    const digitCount = (text.match(/\d/g) || []).length;
    const alphaCount = (text.match(/[a-zA-Z]/g) || []).length;

    if (digitCount > 0 && alphaCount > 0) {
      const ratio = digitCount / (digitCount + alphaCount);
      if (ratio > 0.15 && ratio < 0.85) {
        suspicionScore += 30;
      }
    }

    return suspicionScore >= 50;
  }

  detectRepeatingNumbers(text) {
    const repeatingPatterns = [
      /(\d)\s*\1\s*\1\s*\1/g,
      /([0-9]{2,3})\s*\1/g,
      /(\d{3})[\s-](\d{3})[\s-]\1/g,
    ];

    for (const pattern of repeatingPatterns) {
      const matches = text.match(pattern);
      if (matches && matches.length > 0) {
        const digits = matches[0].replace(/\D/g, '');
        if (digits.length >= 8) {
          return true;
        }
      }
    }

    return false;
  }

  analyzeText(text) {
    const convertedText = this.convertWordsToNumbers(text);
    const emojiConverted = this.convertEmojisToNumbers(text);

    const directPattern = this.detectPhonePatterns(text);
    const convertedPattern = this.detectPhonePatterns(convertedText);
    const emojiPattern = this.detectPhonePatterns(emojiConverted);
    const hasObfuscation = this.detectObfuscatedNumbers(text);
    const hasSpelledNumbers = this.detectSpelledOutNumbers(text);
    const hasContactContext = this.detectContactContext(text);
    const hasSequentialDigits = this.detectSequentialDigits(text + ' ' + convertedText);
    const hasMixedFormat = this.detectMixedFormat(text);
    const hasLeetSpeak = this.detectLeetSpeak(text);
    const hasRepeatingNumbers = this.detectRepeatingNumbers(text);

    const suspicionLevel =
      (directPattern.found ? 100 : 0) +
      (convertedPattern.found ? 100 : 0) +
      (emojiPattern.found ? 100 : 0) +
      (hasObfuscation ? 80 : 0) +
      (hasSpelledNumbers ? 90 : 0) +
      (hasContactContext ? 50 : 0) +
      (hasSequentialDigits ? 60 : 0) +
      (hasMixedFormat ? 85 : 0) +
      (hasLeetSpeak ? 70 : 0) +
      (hasRepeatingNumbers ? 75 : 0);

    return {
      containsPhoneNumber: suspicionLevel >= 100,
      suspicionLevel,
      reasons: {
        directNumberFound: directPattern.found,
        convertedNumberFound: convertedPattern.found,
        emojiNumberFound: emojiPattern.found,
        obfuscatedFormat: hasObfuscation,
        spelledOutNumbers: hasSpelledNumbers,
        contactContext: hasContactContext,
        sequentialDigits: hasSequentialDigits,
        mixedFormat: hasMixedFormat,
        leetSpeak: hasLeetSpeak,
        repeatingNumbers: hasRepeatingNumbers,
      },
      detectedNumbers: [
        ...(directPattern.matches || []),
        ...(convertedPattern.matches || []),
        ...(emojiPattern.matches || []),
      ],
    };
  }
}

module.exports = new PhoneNumberDetector();
