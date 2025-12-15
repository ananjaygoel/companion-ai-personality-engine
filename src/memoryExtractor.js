/**
 * Memory Extraction Module
 * 
 * Analyzes chat messages to extract:
 * 1. User Preferences - likes, dislikes, habits, choices
 * 2. Emotional Patterns - recurring moods, triggers, coping mechanisms
 * 3. Facts Worth Remembering - personal details, life events, relationships
 */

// Structured output schema for memory extraction
export const MEMORY_EXTRACTION_SCHEMA = {
  type: "object",
  properties: {
    preferences: {
      type: "array",
      description: "User preferences including likes, dislikes, habits, and choices",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["food", "entertainment", "communication", "lifestyle", "work", "relationships", "other"]
          },
          preference: { type: "string" },
          sentiment: { type: "string", enum: ["positive", "negative", "neutral"] },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          sourceMessage: { type: "string" }
        },
        required: ["category", "preference", "sentiment", "confidence"]
      }
    },
    emotionalPatterns: {
      type: "array",
      description: "Recurring emotional patterns, triggers, and coping mechanisms",
      items: {
        type: "object",
        properties: {
          emotion: {
            type: "string",
            enum: ["joy", "sadness", "anger", "fear", "anxiety", "excitement", "frustration", "calm", "stress", "hope"]
          },
          trigger: { type: "string" },
          frequency: { type: "string", enum: ["rare", "occasional", "frequent", "constant"] },
          copingMechanism: { type: "string" },
          intensity: { type: "string", enum: ["low", "medium", "high"] },
          context: { type: "string" }
        },
        required: ["emotion", "intensity"]
      }
    },
    factsWorthRemembering: {
      type: "array",
      description: "Important personal facts, life events, and relationships",
      items: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: ["personal_info", "life_event", "relationship", "achievement", "goal", "health", "location", "occupation"]
          },
          fact: { type: "string" },
          importance: { type: "string", enum: ["low", "medium", "high", "critical"] },
          timestamp: { type: "string" },
          relatedPeople: { type: "array", items: { type: "string" } }
        },
        required: ["category", "fact", "importance"]
      }
    },
    overallProfile: {
      type: "object",
      description: "Summary profile of the user",
      properties: {
        dominantMood: { type: "string" },
        communicationStyle: { type: "string", enum: ["formal", "casual", "mixed"] },
        topConcerns: { type: "array", items: { type: "string" } },
        strengths: { type: "array", items: { type: "string" } },
        supportNeeds: { type: "array", items: { type: "string" } }
      }
    }
  },
  required: ["preferences", "emotionalPatterns", "factsWorthRemembering", "overallProfile"]
};

// System prompt for memory extraction
export const MEMORY_EXTRACTION_PROMPT = `You are an expert memory extraction system for a companion AI. Your task is to analyze a series of chat messages from a user and extract meaningful memories that will help personalize future interactions.

ANALYSIS GUIDELINES:

1. USER PREFERENCES:
   - Look for explicit statements of likes/dislikes ("I love...", "I hate...", "I prefer...")
   - Identify implicit preferences from behavior patterns
   - Note communication preferences (emoji usage, response length, formality)
   - Categorize each preference appropriately

2. EMOTIONAL PATTERNS:
   - Identify recurring emotional states across messages
   - Look for triggers that consistently affect mood
   - Note any coping mechanisms mentioned
   - Assess emotional intensity and frequency
   - Be sensitive to mental health indicators

3. FACTS WORTH REMEMBERING:
   - Personal details (name, age, location if shared)
   - Important relationships (family, friends, partners)
   - Life events (job changes, moves, celebrations, losses)
   - Goals and aspirations
   - Health-related information
   - Achievements and milestones

4. CONFIDENCE SCORING:
   - High (0.8-1.0): Explicitly stated, clear context
   - Medium (0.5-0.79): Implied or partially stated
   - Low (0.2-0.49): Inferred with some uncertainty

Be thorough but avoid over-interpretation. Only extract what is reasonably supported by the messages.`;

/**
 * MemoryExtractor Class
 * Handles the extraction of memories from chat messages
 */
export class MemoryExtractor {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.memories = {
      preferences: [],
      emotionalPatterns: [],
      factsWorthRemembering: [],
      overallProfile: null
    };
  }

  /**
   * Format messages for analysis
   */
  formatMessagesForAnalysis(messages) {
    return messages.map((msg, idx) => {
      return `[Message ${idx + 1}] ${msg.timestamp || ''}: ${msg.content}`;
    }).join('\n\n');
  }

  /**
   * Extract memories using OpenAI API with structured output
   */
  async extractMemories(messages) {
    const formattedMessages = this.formatMessagesForAnalysis(messages);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: MEMORY_EXTRACTION_PROMPT },
          { 
            role: 'user', 
            content: `Please analyze the following ${messages.length} chat messages and extract memories:\n\n${formattedMessages}`
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "memory_extraction",
            schema: MEMORY_EXTRACTION_SCHEMA,
            strict: true
          }
        },
        temperature: 0.3 // Lower temperature for more consistent extraction
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedMemories = JSON.parse(data.choices[0].message.content);
    
    this.memories = extractedMemories;
    return extractedMemories;
  }

  /**
   * Merge new memories with existing ones, avoiding duplicates
   */
  mergeMemories(newMemories) {
    // Merge preferences
    for (const pref of newMemories.preferences) {
      const exists = this.memories.preferences.some(
        p => p.preference.toLowerCase() === pref.preference.toLowerCase()
      );
      if (!exists) {
        this.memories.preferences.push(pref);
      }
    }

    // Merge emotional patterns
    for (const pattern of newMemories.emotionalPatterns) {
      const exists = this.memories.emotionalPatterns.some(
        p => p.emotion === pattern.emotion && p.trigger === pattern.trigger
      );
      if (!exists) {
        this.memories.emotionalPatterns.push(pattern);
      }
    }

    // Merge facts
    for (const fact of newMemories.factsWorthRemembering) {
      const exists = this.memories.factsWorthRemembering.some(
        f => f.fact.toLowerCase() === fact.fact.toLowerCase()
      );
      if (!exists) {
        this.memories.factsWorthRemembering.push(fact);
      }
    }

    // Update overall profile
    if (newMemories.overallProfile) {
      this.memories.overallProfile = newMemories.overallProfile;
    }

    return this.memories;
  }

  /**
   * Get memories formatted for context injection
   */
  getMemoryContext() {
    if (!this.memories.overallProfile) {
      return "No memories extracted yet.";
    }

    let context = "=== USER MEMORY PROFILE ===\n\n";
    
    // Add preferences
    if (this.memories.preferences.length > 0) {
      context += "PREFERENCES:\n";
      this.memories.preferences.forEach(p => {
        context += `- ${p.preference} (${p.category}, ${p.sentiment})\n`;
      });
      context += "\n";
    }

    // Add emotional patterns
    if (this.memories.emotionalPatterns.length > 0) {
      context += "EMOTIONAL PATTERNS:\n";
      this.memories.emotionalPatterns.forEach(e => {
        context += `- ${e.emotion} (${e.intensity} intensity`;
        if (e.trigger) context += `, triggered by: ${e.trigger}`;
        context += ")\n";
      });
      context += "\n";
    }

    // Add important facts
    if (this.memories.factsWorthRemembering.length > 0) {
      context += "IMPORTANT FACTS:\n";
      this.memories.factsWorthRemembering.forEach(f => {
        context += `- ${f.fact} (${f.importance} importance)\n`;
      });
      context += "\n";
    }

    // Add overall profile
    if (this.memories.overallProfile) {
      context += "OVERALL PROFILE:\n";
      context += `- Dominant Mood: ${this.memories.overallProfile.dominantMood}\n`;
      context += `- Communication Style: ${this.memories.overallProfile.communicationStyle}\n`;
      if (this.memories.overallProfile.topConcerns?.length) {
        context += `- Top Concerns: ${this.memories.overallProfile.topConcerns.join(', ')}\n`;
      }
      if (this.memories.overallProfile.supportNeeds?.length) {
        context += `- Support Needs: ${this.memories.overallProfile.supportNeeds.join(', ')}\n`;
      }
    }

    return context;
  }
}

export default MemoryExtractor;
