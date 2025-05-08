// modules/settingsMenu.js

import { updateSoundVolumes, changeBackgroundMusic, playBackgroundMusic, musicTracks } from './sounds.js';

function createSettingsMenu(gameState, saveSettings) {
  // Create container for both elements
  const container = document.createElement('div');
  container.className = 'sound-controls-container';
  
  // Create the sound toggle button
  const soundToggleBtn = document.createElement('button');
  soundToggleBtn.className = 'sound-toggle';
  soundToggleBtn.innerHTML = gameState.soundEnabled
    ? '<i class="fas fa-volume-up"></i>'
    : '<i class="fas fa-volume-mute"></i>';
  
  // Create the settings button (gear icon)
  const settingsBtn = document.createElement('button');
  settingsBtn.className = 'settings-toggle';
  settingsBtn.innerHTML = '<i class="fas fa-cog"></i>';
  
  // Create the settings panel (initially hidden)
  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'settings-panel hidden';
  
  // Sound toggle functionality
  soundToggleBtn.addEventListener('click', () => {
    gameState.soundEnabled = !gameState.soundEnabled;
    soundToggleBtn.innerHTML = gameState.soundEnabled
      ? '<i class="fas fa-volume-up"></i>'
      : '<i class="fas fa-volume-mute"></i>';

    if (gameState.soundEnabled) {
      playBackgroundMusic(gameState);
    } else if (window.sounds && window.sounds.bgMusic && window.sounds.bgMusic.current) {
      window.sounds.bgMusic.current.pause();
    }

    updateSoundVolumes(gameState, saveSettings);
    saveSettings();
  });
  
  // Settings button functionality
  settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsPanel.classList.toggle('hidden');
  });
  
  // Create volume sliders
  const createSlider = (labelText, initial, callback) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'volume-control';
    
    const label = document.createElement('label');
    label.textContent = labelText;
    
    const input = document.createElement('input');
    input.type = 'range';
    input.min = 0;
    input.max = 1;
    input.step = 0.01;
    input.value = initial;
    input.className = 'volume-slider';

    input.addEventListener('input', (e) => {
      callback(parseFloat(e.target.value));
    });

    wrapper.appendChild(label);
    wrapper.appendChild(input);
    return wrapper;
  };

  // Create the sliders
  const masterSlider = createSlider('Master Volume', gameState.soundSettings.masterVolume, (val) => {
    gameState.soundSettings.masterVolume = val;
    updateSoundVolumes(gameState, saveSettings);
  });

  const musicSlider = createSlider('Music Volume', gameState.soundSettings.musicVolume, (val) => {
    gameState.soundSettings.musicVolume = val;
    updateSoundVolumes(gameState, saveSettings);
  });

  const effectsSlider = createSlider('Effects Volume', gameState.soundSettings.effectsVolume, (val) => {
    gameState.soundSettings.effectsVolume = val;
    updateSoundVolumes(gameState, saveSettings);
  });

  // Create music track selector
  const selectorWrapper = document.createElement('div');
  selectorWrapper.className = 'track-selector';
  
  const selectorLabel = document.createElement('label');
  selectorLabel.textContent = 'Soundtrack:';
  
  const selector = document.createElement('select');
  selector.className = 'soundtrack-select';

  Object.entries(musicTracks).forEach(([key, track]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = track.title;
    if (key === gameState.soundSettings.currentTrack) opt.selected = true;
    selector.appendChild(opt);
  });

  selector.addEventListener('change', (e) => {
    changeBackgroundMusic(e.target.value, gameState, saveSettings);
  });

  selectorWrapper.appendChild(selectorLabel);
  selectorWrapper.appendChild(selector);

  // Create low-end mode toggle
  const lowEndModeWrapper = document.createElement('div');
  lowEndModeWrapper.className = 'settings-toggle-option';
  
  const lowEndModeLabel = document.createElement('label');
  lowEndModeLabel.textContent = 'Low-End Mode:';
  lowEndModeLabel.htmlFor = 'low-end-mode';
  
  const lowEndModeToggle = document.createElement('input');
  lowEndModeToggle.type = 'checkbox';
  lowEndModeToggle.id = 'low-end-mode';
  lowEndModeToggle.checked = gameState.lowEndMode || false;
  
  lowEndModeToggle.addEventListener('change', (e) => {
    gameState.lowEndMode = e.target.checked;
    document.body.classList.toggle('low-end-mode', gameState.lowEndMode);
    saveSettings();
  });
  
  lowEndModeWrapper.appendChild(lowEndModeLabel);
  lowEndModeWrapper.appendChild(lowEndModeToggle);

  // Create theme selector
  const themeWrapper = document.createElement('div');
  themeWrapper.className = 'settings-toggle-option';
  
  const themeLabel = document.createElement('label');
  themeLabel.textContent = 'Theme:';
  
  const themeSelect = document.createElement('select');
  themeSelect.className = 'theme-select';
  
  const themes = [
    { value: 'default', name: 'Quantum Blue' },
    { value: 'dark', name: 'Dark Matter' },
    { value: 'neon', name: 'Neon Pulse' },
    { value: 'retro', name: 'Retro Wave' }
  ];
  
  themes.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme.value;
    option.textContent = theme.name;
    if (theme.value === (gameState.theme || 'default')) option.selected = true;
    themeSelect.appendChild(option);
  });
  
  themeSelect.addEventListener('change', (e) => {
    const prevTheme = gameState.theme || 'default';
    gameState.theme = e.target.value;
    document.body.classList.remove(`theme-${prevTheme}`);
    document.body.classList.add(`theme-${gameState.theme}`);
    saveSettings();
  });
  
  themeWrapper.appendChild(themeLabel);
  themeWrapper.appendChild(themeSelect);

  // Create vibration toggle
  const vibrationWrapper = document.createElement('div');
  vibrationWrapper.className = 'settings-toggle-option';
  
  const vibrationLabel = document.createElement('label');
  vibrationLabel.textContent = 'Vibration:';
  vibrationLabel.htmlFor = 'vibration-toggle';
  
  const vibrationToggle = document.createElement('input');
  vibrationToggle.type = 'checkbox';
  vibrationToggle.id = 'vibration-toggle';
  vibrationToggle.checked = gameState.vibrationEnabled !== false; // Default to true
  
  vibrationToggle.addEventListener('change', (e) => {
    gameState.vibrationEnabled = e.target.checked;
    saveSettings();
  });
  
  vibrationWrapper.appendChild(vibrationLabel);
  vibrationWrapper.appendChild(vibrationToggle);

  // Create language selector
  const languageWrapper = document.createElement('div');
  languageWrapper.className = 'settings-toggle-option';
  
  const languageLabel = document.createElement('label');
  languageLabel.textContent = 'Language:';
  
  const languageSelect = document.createElement('select');
  languageSelect.className = 'language-select';
  
  const languages = [
    { value: 'en', name: 'English' },
    { value: 'it', name: 'Italiano' },
    { value: 'es', name: 'Español' },
    { value: 'fr', name: 'Français' }
  ];
  
  languages.forEach(lang => {
    const option = document.createElement('option');
    option.value = lang.value;
    option.textContent = lang.name;
    if (lang.value === (gameState.language || 'en')) option.selected = true;
    languageSelect.appendChild(option);
  });
  
  languageSelect.addEventListener('change', (e) => {
    gameState.language = e.target.value;
    saveSettings();
    // In a real app, you would update all text elements here
    alert('Language settings will be applied after restart');
  });
  
  languageWrapper.appendChild(languageLabel);
  languageWrapper.appendChild(languageSelect);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'close-settings';
  closeBtn.innerHTML = '<i class="fas fa-times"></i>';
  closeBtn.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
  });

  // Add everything to the settings panel
  settingsPanel.appendChild(closeBtn);
  
  // Create sections
  const audioSection = document.createElement('div');
  audioSection.className = 'settings-section';
  const audioTitle = document.createElement('h3');
  audioTitle.textContent = 'Audio';
  audioSection.appendChild(audioTitle);
  audioSection.appendChild(masterSlider);
  audioSection.appendChild(musicSlider);
  audioSection.appendChild(effectsSlider);
  audioSection.appendChild(selectorWrapper);
  
  const visualSection = document.createElement('div');
  visualSection.className = 'settings-section';
  const visualTitle = document.createElement('h3');
  visualTitle.textContent = 'Visual & Performance';
  visualSection.appendChild(visualTitle);
  visualSection.appendChild(lowEndModeWrapper);
  visualSection.appendChild(themeWrapper);
  
  const gameplaySection = document.createElement('div');
  gameplaySection.className = 'settings-section';
  const gameplayTitle = document.createElement('h3');
  gameplayTitle.textContent = 'Gameplay';
  gameplaySection.appendChild(gameplayTitle);
  gameplaySection.appendChild(vibrationWrapper);
  gameplaySection.appendChild(languageWrapper);
  
  settingsPanel.appendChild(audioSection);
  settingsPanel.appendChild(visualSection);
  settingsPanel.appendChild(gameplaySection);

  // Click outside to close
  document.addEventListener('click', (e) => {
    if (!settingsPanel.contains(e.target) && e.target !== settingsBtn) {
      settingsPanel.classList.add('hidden');
    }
  });

  // Add buttons to container
  const buttonsContainer = document.createElement('div');
  buttonsContainer.className = 'settings-buttons';
  buttonsContainer.appendChild(soundToggleBtn);
  buttonsContainer.appendChild(settingsBtn);
  
  container.appendChild(buttonsContainer);
  container.appendChild(settingsPanel);

  return container;
}

export { createSettingsMenu };