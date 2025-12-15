/**
 * Main Application Entry Point
 * 
 * Combines Memory Extraction and Personality Engine
 * into a unified companion AI system.
 */

import { MemoryExtractor } from './memoryExtractor.js';
import { PersonalityEngine, PERSONALITIES } from './personalityEngine.js';
import { sampleChatMessages, testScenarios } from './sampleMessages.js';

/**
 * CompanionAI Class
 * Main orchestrator for the companion AI system
 */
export class CompanionAI {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.memoryExtractor = new MemoryExtractor(apiKey);
    this.personalityEngine = new PersonalityEngine(apiKey);
    this.initialized = false;
  }

  /**
   * Initialize the system by extracting memories from chat history
   */
  async initialize(chatHistory) {
    console.log('🧠 Extracting memories from chat history...');
    const memories = await this.memoryExtractor.extractMemories(chatHistory);
    this.personalityEngine.setMemories(memories);
    this.initialized = true;
    console.log('✅ Memory extraction complete!');
    return memories;
  }

  /**
   * Get extracted memories
   */
  getMemories() {
    return this.memoryExtractor.memories;
  }

  /**
   * Get memory context string
   */
  getMemoryContext() {
    return this.memoryExtractor.getMemoryContext();
  }

  /**
   * Set active personality
   */
  setPersonality(personalityKey) {
    this.personalityEngine.setPersonality(personalityKey);
  }

  /**
   * Generate a response with the current personality
   */
  async chat(message, personalityKey = null) {
    return await this.personalityEngine.generateResponse(message, personalityKey);
  }

  /**
   * Generate comparison responses from multiple personalities
   */
  async comparePersonalities(message) {
    const baseline = await this.personalityEngine.generateBaselineResponse(message);
    const personalityResponses = await this.personalityEngine.generateMultipleResponses(message);
    
    return {
      baseline,
      personalities: personalityResponses
    };
  }

  /**
   * Get available personalities
   */
  getPersonalities() {
    return this.personalityEngine.getAvailablePersonalities();
  }
}

// Browser-compatible demo runner
export async function runDemo(apiKey) {
  const companion = new CompanionAI(apiKey);
  
  const results = {
    memories: null,
    comparisons: []
  };

  // Step 1: Extract memories
  console.log('='.repeat(60));
  console.log('STEP 1: MEMORY EXTRACTION');
  console.log('='.repeat(60));
  
  results.memories = await companion.initialize(sampleChatMessages);
  
  // Step 2: Generate personality comparisons
  console.log('\n' + '='.repeat(60));
  console.log('STEP 2: PERSONALITY COMPARISON');
  console.log('='.repeat(60));
  
  const testMessage = testScenarios.emotionalSupport;
  console.log(`\nTest Message: "${testMessage}"\n`);
  
  const comparison = await companion.comparePersonalities(testMessage);
  results.comparisons.push({
    scenario: 'emotionalSupport',
    message: testMessage,
    ...comparison
  });
  
  return results;
}

// Export for use in browser
export { sampleChatMessages, testScenarios, PERSONALITIES };
