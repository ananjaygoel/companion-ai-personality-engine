/**
 * Frontend Application
 * Handles UI interactions and API calls
 */

import { MemoryExtractor } from './src/memoryExtractor.js';
import { PersonalityEngine, PERSONALITIES } from './src/personalityEngine.js';
import { sampleChatMessages, testScenarios } from './src/sampleMessages.js';

// State
let memoryExtractor = null;
let personalityEngine = null;
let extractedMemories = null;
let currentPersonality = 'calm_mentor';
let chatHistory = [];

// DOM Elements
const apiKeyInput = document.getElementById('apiKey');
const initBtn = document.getElementById('initBtn');
const mainContent = document.getElementById('mainContent');
const loadingOverlay = document.getElementById('loadingOverlay');
const loadingText = document.getElementById('loadingText');

// Tab elements
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');

// Memory tab elements
const preferencesContent = document.getElementById('preferencesContent');
const emotionalContent = document.getElementById('emotionalContent');
const factsContent = document.getElementById('factsContent');
const profileContent = document.getElementById('profileContent');
const messagesContent = document.getElementById('messagesContent');

// Personality tab elements
const scenarioSelect = document.getElementById('scenarioSelect');
const customInput = document.getElementById('customInput');
const customMessage = document.getElementById('customMessage');
const testMessageDisplay = document.getElementById('testMessageDisplay');
const compareBtn = document.getElementById('compareBtn');
const comparisonResults = document.getElementById('comparisonResults');

// Chat tab elements
const personalityButtons = document.getElementById('personalityButtons');
const chatWindow = document.getElementById('chatWindow');
const chatInput = document.getElementById('chatInput');
const sendBtn = document.getElementById('sendBtn');

// Utility functions
function showLoading(text = 'Loading...') {
  loadingText.textContent = text;
  loadingOverlay.classList.add('active');
}

function hideLoading() {
  loadingOverlay.classList.remove('active');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize the system
async function initializeSystem() {
  const apiKey = apiKeyInput.value.trim();
  
  if (!apiKey || !apiKey.startsWith('sk-')) {
    alert('Please enter a valid OpenAI API key');
    return;
  }

  showLoading('🧠 Extracting memories from 30 chat messages...');

  try {
    // Initialize modules
    memoryExtractor = new MemoryExtractor(apiKey);
    personalityEngine = new PersonalityEngine(apiKey);

    // Extract memories
    extractedMemories = await memoryExtractor.extractMemories(sampleChatMessages);
    personalityEngine.setMemories(extractedMemories);

    // Display results
    displayMemories(extractedMemories);
    displaySampleMessages();
    setupPersonalityTab();
    setupChatTab();

    // Show main content
    mainContent.style.display = 'block';
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error('Error:', error);
    alert(`Error initializing system: ${error.message}`);
  }
}

// Display extracted memories
function displayMemories(memories) {
  // Display preferences
  if (memories.preferences && memories.preferences.length > 0) {
    preferencesContent.innerHTML = memories.preferences.map(p => `
      <div class="memory-item">
        <span class="category">${escapeHtml(p.category)}</span>
        <span class="sentiment-${p.sentiment}">${escapeHtml(p.preference)}</span>
        <div class="intensity">Confidence: ${(p.confidence * 100).toFixed(0)}%</div>
      </div>
    `).join('');
  } else {
    preferencesContent.innerHTML = '<p class="loading">No preferences extracted</p>';
  }

  // Display emotional patterns
  if (memories.emotionalPatterns && memories.emotionalPatterns.length > 0) {
    emotionalContent.innerHTML = memories.emotionalPatterns.map(e => `
      <div class="memory-item">
        <strong>${escapeHtml(e.emotion)}</strong>
        ${e.trigger ? `<br>Trigger: ${escapeHtml(e.trigger)}` : ''}
        ${e.copingMechanism ? `<br>Coping: ${escapeHtml(e.copingMechanism)}` : ''}
        <div class="intensity">Intensity: ${e.intensity} | Frequency: ${e.frequency || 'N/A'}</div>
      </div>
    `).join('');
  } else {
    emotionalContent.innerHTML = '<p class="loading">No emotional patterns extracted</p>';
  }

  // Display facts
  if (memories.factsWorthRemembering && memories.factsWorthRemembering.length > 0) {
    factsContent.innerHTML = memories.factsWorthRemembering.map(f => `
      <div class="memory-item">
        <span class="category">${escapeHtml(f.category)}</span>
        ${escapeHtml(f.fact)}
        <span class="importance importance-${f.importance}">${f.importance}</span>
        ${f.relatedPeople && f.relatedPeople.length > 0 ? `<div class="intensity">Related: ${f.relatedPeople.join(', ')}</div>` : ''}
      </div>
    `).join('');
  } else {
    factsContent.innerHTML = '<p class="loading">No facts extracted</p>';
  }

  // Display overall profile
  if (memories.overallProfile) {
    const profile = memories.overallProfile;
    profileContent.innerHTML = `
      <div class="profile-grid">
        <div class="profile-item">
          <label>Dominant Mood</label>
          <div class="value">${escapeHtml(profile.dominantMood || 'N/A')}</div>
        </div>
        <div class="profile-item">
          <label>Communication Style</label>
          <div class="value">${escapeHtml(profile.communicationStyle || 'N/A')}</div>
        </div>
        <div class="profile-item">
          <label>Top Concerns</label>
          <div class="tag-list">
            ${(profile.topConcerns || []).map(c => `<span class="tag">${escapeHtml(c)}</span>`).join('')}
          </div>
        </div>
        <div class="profile-item">
          <label>Strengths</label>
          <div class="tag-list">
            ${(profile.strengths || []).map(s => `<span class="tag">${escapeHtml(s)}</span>`).join('')}
          </div>
        </div>
        <div class="profile-item">
          <label>Support Needs</label>
          <div class="tag-list">
            ${(profile.supportNeeds || []).map(n => `<span class="tag">${escapeHtml(n)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  } else {
    profileContent.innerHTML = '<p class="loading">No profile generated</p>';
  }
}

// Display sample messages
function displaySampleMessages() {
  messagesContent.innerHTML = sampleChatMessages.map((msg, idx) => `
    <div class="message-item">
      <div class="timestamp">${msg.timestamp} - Message ${idx + 1}</div>
      <div>${escapeHtml(msg.content)}</div>
    </div>
  `).join('');
}

// Setup personality tab
function setupPersonalityTab() {
  // Update test message display
  updateTestMessage();

  scenarioSelect.addEventListener('change', () => {
    if (scenarioSelect.value === 'custom') {
      customInput.style.display = 'block';
      testMessageDisplay.textContent = customMessage.value || 'Enter a custom message above';
    } else {
      customInput.style.display = 'none';
      updateTestMessage();
    }
  });

  customMessage.addEventListener('input', () => {
    testMessageDisplay.textContent = customMessage.value;
  });

  compareBtn.addEventListener('click', generateComparison);
}

function updateTestMessage() {
  const scenario = scenarioSelect.value;
  if (scenario === 'custom') {
    testMessageDisplay.textContent = customMessage.value || 'Enter a custom message above';
  } else {
    testMessageDisplay.textContent = testScenarios[scenario];
  }
}

async function generateComparison() {
  const scenario = scenarioSelect.value;
  let message = scenario === 'custom' ? customMessage.value : testScenarios[scenario];

  if (!message.trim()) {
    alert('Please enter a message');
    return;
  }

  showLoading('🎭 Generating personality responses...');
  compareBtn.disabled = true;

  try {
    // Generate baseline
    const baseline = await personalityEngine.generateBaselineResponse(message);

    // Generate all personality responses
    const responses = [];
    for (const [key, personality] of Object.entries(PERSONALITIES)) {
      const response = await personalityEngine.generateResponse(message, key);
      responses.push({ key, ...response });
    }

    // Display results
    comparisonResults.innerHTML = `
      <div class="comparison-card baseline">
        <div class="comparison-card-header">
          <h4>⚪ ${baseline.personality}</h4>
          <div class="description">Standard AI response without personality</div>
        </div>
        <div class="comparison-card-body">${escapeHtml(baseline.response)}</div>
      </div>
      ${responses.map(r => `
        <div class="comparison-card">
          <div class="comparison-card-header">
            <h4>${getPersonalityEmoji(r.key)} ${r.personality}</h4>
            <div class="description">${PERSONALITIES[r.key].description}</div>
          </div>
          <div class="comparison-card-body">${escapeHtml(r.response)}</div>
        </div>
      `).join('')}
    `;

    hideLoading();
    compareBtn.disabled = false;
  } catch (error) {
    hideLoading();
    compareBtn.disabled = false;
    console.error('Error:', error);
    alert(`Error generating responses: ${error.message}`);
  }
}

function getPersonalityEmoji(key) {
  const emojis = {
    calm_mentor: '🧘',
    witty_friend: '😄',
    therapist_style: '💚',
    cheerful_coach: '🎯',
    wise_elder: '🦉'
  };
  return emojis[key] || '🎭';
}

// Setup chat tab
function setupChatTab() {
  // Create personality buttons
  personalityButtons.innerHTML = Object.entries(PERSONALITIES).map(([key, p]) => `
    <button class="personality-btn ${key === currentPersonality ? 'active' : ''}" data-personality="${key}">
      ${getPersonalityEmoji(key)} ${p.name}
    </button>
  `).join('');

  // Add click handlers
  personalityButtons.querySelectorAll('.personality-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPersonality = btn.dataset.personality;
      personalityButtons.querySelectorAll('.personality-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
}

async function sendMessage() {
  const message = chatInput.value.trim();
  if (!message) return;

  // Clear welcome message if present
  const welcome = chatWindow.querySelector('.chat-welcome');
  if (welcome) welcome.remove();

  // Add user message
  addChatMessage(message, 'user');
  chatInput.value = '';
  sendBtn.disabled = true;

  try {
    const response = await personalityEngine.generateResponse(message, currentPersonality);
    addChatMessage(response.response, 'assistant', response.personality);
  } catch (error) {
    console.error('Error:', error);
    addChatMessage('Sorry, there was an error generating a response.', 'assistant', 'Error');
  }

  sendBtn.disabled = false;
}

function addChatMessage(content, role, personality = null) {
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${role}`;
  messageEl.innerHTML = `
    <div class="bubble">${escapeHtml(content)}</div>
    ${personality ? `<div class="meta">${personality}</div>` : ''}
  `;
  chatWindow.appendChild(messageEl);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Tab switching
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.dataset.tab;
    
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tabId}-tab`) {
        content.classList.add('active');
      }
    });
  });
});

// Event listeners
initBtn.addEventListener('click', initializeSystem);
