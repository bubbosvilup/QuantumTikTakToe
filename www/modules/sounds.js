// modules/sounds.js

const sounds = {
  move: {
    X: new Audio(),
    O: new Audio(),
  },
  win: new Audio(),
  draw: new Audio(),
  click: new Audio(),
  hover: new Audio(),
  bgMusic: {
    scifi: new Audio(),
    ambient: new Audio(),
    cyber: new Audio(),
    current: null,
  },
};

const musicTracks = {
  scifi: {
    title: 'Sci-Fi Atmosphere',
    src: 'sounds/scifi.mp3',
  },
  ambient: {
    title: 'Digital Ambience',
    src: 'sounds/digital.mp3',
  },
  cyber: {
    title: 'Cyber Pulse',
    src: 'sounds/pulse.mp3',
  },
};

function initSounds(gameState, saveSettings) {
  const soundSources = {
    'move.X': 'sounds/move.wav',
    'move.O': 'sounds/move.wav',
    win: 'sounds/win.wav',
    draw: 'sounds/draw.wav',
    click: 'sounds/click.wav',
    hover: 'sounds/hover.wav',
  };

  sounds.move.X.src = soundSources['move.X'];
  sounds.move.X.preload = 'auto';
  sounds.move.X.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.move.O.src = soundSources['move.O'];
  sounds.move.O.preload = 'auto';
  sounds.move.O.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.win.src = soundSources.win;
  sounds.win.preload = 'auto';
  sounds.win.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.draw.src = soundSources.draw;
  sounds.draw.preload = 'auto';
  sounds.draw.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.click.src = soundSources.click;
  sounds.click.preload = 'auto';
  sounds.click.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  sounds.hover.src = soundSources.hover;
  sounds.hover.preload = 'auto';
  sounds.hover.volume =
    0.2 * gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  Object.entries(musicTracks).forEach(([key, track]) => {
    sounds.bgMusic[key].src = track.src;
    sounds.bgMusic[key].preload = 'auto';
    sounds.bgMusic[key].loop = true;
    sounds.bgMusic[key].volume =
      gameState.soundSettings.musicVolume * gameState.soundSettings.masterVolume;
  });

  sounds.bgMusic.current = sounds.bgMusic[gameState.soundSettings.currentTrack];

  const allSounds = [
    sounds.move.X,
    sounds.move.O,
    sounds.win,
    sounds.draw,
    sounds.click,
    sounds.hover,
    ...Object.values(sounds.bgMusic),
  ];

  allSounds.forEach((sound) => {
    if (sound instanceof Audio) {
      sound.addEventListener('error', () => {
        console.log('Error loading sound');
        gameState.soundEnabled = false;
      });
    }
  });
}

function updateSoundVolumes(gameState, saveSettings) {
  sounds.move.X.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.move.O.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.win.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.draw.volume = gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.click.volume =
    gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;
  sounds.hover.volume =
    0.2 * gameState.soundSettings.effectsVolume * gameState.soundSettings.masterVolume;

  Object.values(sounds.bgMusic).forEach((track) => {
    if (track instanceof Audio) {
      track.volume = gameState.soundSettings.musicVolume * gameState.soundSettings.masterVolume;
    }
  });

  saveSettings();
}

function playSound(key, player, gameState) {
  if (!gameState || !gameState.soundEnabled) return;
  let soundToPlay = key === 'move' && player ? sounds.move[player] : sounds[key];
  if (!soundToPlay) return;
  soundToPlay.pause();
  soundToPlay.currentTime = 0;
  const playPromise = soundToPlay.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => console.log('Playback prevented by browser'));
  }
}

function playBackgroundMusic(gameState) {
  if (!gameState.soundEnabled || !sounds.bgMusic.current) return;
  const playPromise = sounds.bgMusic.current.play();
  if (playPromise !== undefined) {
    playPromise.catch(() => {
      const startAudio = () => {
        sounds.bgMusic.current.play();
        document.removeEventListener('click', startAudio);
      };
      document.addEventListener('click', startAudio);
    });
  }
}

function changeBackgroundMusic(trackKey, gameState, saveSettings) {
  if (!musicTracks[trackKey]) return;
  if (sounds.bgMusic.current && !sounds.bgMusic.current.paused) {
    const fadeOutInterval = setInterval(() => {
      if (sounds.bgMusic.current.volume > 0.05) {
        sounds.bgMusic.current.volume -= 0.05;
      } else {
        clearInterval(fadeOutInterval);
        sounds.bgMusic.current.pause();
        sounds.bgMusic.current.currentTime = 0;
        gameState.soundSettings.currentTrack = trackKey;
        sounds.bgMusic.current = sounds.bgMusic[trackKey];
        playBackgroundMusic(gameState);
      }
    }, 50);
  } else {
    gameState.soundSettings.currentTrack = trackKey;
    sounds.bgMusic.current = sounds.bgMusic[trackKey];
    playBackgroundMusic(gameState);
  }
  saveSettings();
}

// Remove the createSoundControls function since we've replaced it with the settingsMenu module

export {
  sounds,
  musicTracks,
  initSounds,
  updateSoundVolumes,
  playSound,
  playBackgroundMusic,
  changeBackgroundMusic,
};
