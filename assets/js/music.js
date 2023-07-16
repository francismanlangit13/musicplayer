const musicContainer = document.getElementById('audio-container');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

const audio = document.getElementById('audio');
const progress = document.getElementById('progress');
const progressContainer = document.getElementById('progress-container');
const title = document.getElementById('title');
const cover = document.getElementById('cover');
const lyricText = document.getElementById('lyricText');

// Song titles
const songs = [
  'Alan Walker - Fake A Smile',
  'Dustin Lynch - Stars Like Confetti',
  'Brett Young - Here Tonight',
  'Henry Moodie - Drunk Text',
  'Alex Sampson - Cold Shoulder',
  'The Wanted - Walks Like Rihanna'
];

// Keep track of song and lyrics
let songIndex = 1;
let lyrics = [];

// Initially load song details into DOM
loadSong(songs[songIndex]);

// Update song details
function loadSong(song) {
  title.innerText = song;
  audio.src = `assets/audio/${song}.mp3`;
  cover.src = `assets/images/${song}.jpg`;

  // Update media metadata
  navigator.mediaSession.metadata = new MediaMetadata({
    title: song,
    artwork: [{ src: `assets/images/${song}.jpg`, sizes: '500x500', type: 'image/jpeg' }]
  });

  // Clear previous lyrics
  lyrics = [];
  displayLyrics(lyrics);

  // Load new lyrics
  fetch(`assets/lyrics/${song}.lrc`)
    .then(response => response.text())
    .then(lrc => {
      lyrics = parseLyric(lrc);
      displayLyrics(lyrics);
    })
    .catch(error => {
      console.error('Failed to load lyrics:', error);
      lyrics = []; // Clear lyrics if failed to load
      displayLyrics(lyrics);
    });
}

// Play song
function playSong() {
  musicContainer.classList.add('play');
  playBtn.querySelector('i.fas').classList.remove('fa-play');
  playBtn.querySelector('i.fas').classList.add('fa-pause');
  
  // Update the title of the web browser
  document.title = `Music Player | ${title.innerText}`;

  audio.play();
}

// Pause song
function pauseSong() {
  musicContainer.classList.remove('play');
  playBtn.querySelector('i.fas').classList.add('fa-play');
  playBtn.querySelector('i.fas').classList.remove('fa-pause');
  
  // Update the title of the web browser
  document.title = `Music Player`;

  audio.pause();
}

// Previous song
function prevSong() {
  songIndex--;

  if (songIndex < 0) {
    songIndex = songs.length - 1;
  }

  loadSong(songs[songIndex]);

  playSong();
}

// Next song
function nextSong() {
  songIndex++;

  if (songIndex > songs.length - 1) {
    songIndex = 0;
  }

  loadSong(songs[songIndex]);

  playSong();
}

// Update progress bar
function updateProgress(e) {
  const { duration, currentTime } = e.srcElement;
  const progressPercent = (currentTime / duration) * 100;
  progress.style.width = `${progressPercent}%`;

  const index = syncLyric(lyrics, currentTime);
  if (index !== -1) {
    displayLyric(lyrics[index].text);
  }
}

// Set progress bar
function setProgress(e) {
  const width = this.clientWidth;
  const clickX = e.offsetX;
  const duration = audio.duration;

  audio.currentTime = (clickX / width) * duration;
}

// Event listeners
playBtn.addEventListener('click', () => {
  const isPlaying = musicContainer.classList.contains('play');

  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
});

// Change song
prevBtn.addEventListener('click', prevSong);
nextBtn.addEventListener('click', nextSong);

// Time/song update
audio.addEventListener('timeupdate', updateProgress);

// Click on progress bar
progressContainer.addEventListener('click', setProgress);

// Song ends
audio.addEventListener('ended', nextSong);

// Parse lyric
function parseLyric(lrc) {
  const lines = lrc.split('\n');
  const lyricItems = [];

  for (let line of lines) {
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})]/g;
    const timeMatches = line.match(timeRegex);

    if (timeMatches) {
      const text = line.replace(timeRegex, '').trim();

      for (let match of timeMatches) {
        const timeParts = /\[(\d{2}):(\d{2})\.(\d{2})]/.exec(match);
        const minutes = parseInt(timeParts[1]);
        const seconds = parseInt(timeParts[2]);
        const milliseconds = parseInt(timeParts[3]);
        const time = minutes * 60 + seconds + milliseconds / 1000;

        lyricItems.push({ time, text });
      }
    }
  }

  return lyricItems;
}

// Sync lyric
function syncLyric(lyrics, time) {
  for (let i = 0; i < lyrics.length - 1; i++) {
    if (time >= lyrics[i].time && time < lyrics[i + 1].time) {
      return i;
    }
  }
  // If no matching lyric is found, return -1
  return -1;
}

// Display lyrics
function displayLyrics(lyrics) {
  const lyricContainer = document.getElementById('lyrics');
  const lyricText = document.getElementById('lyricText');

  if (lyricContainer && lyricText) {
    if (lyrics.length > 0) {
      lyricText.innerText = lyrics.map(lyric => lyric.text).join('\n');
    } else {
      lyricText.innerText = 'Lyrics not available';
    }
  } else {
    console.log('%c' + 'Lyric loaded successfully.', 'color: green; font-weight: bold;');
  }
}

// Display current lyric
function displayLyric(text) {
  const lyricText = document.getElementById('lyricText');

  if (lyricText) {
    lyricText.innerText = text;
  } else {
    console.error('Lyric text element not found.');
  }
}

// Register media session
if ('mediaSession' in navigator) {
  // Get the current song
  const currentSong = songs[songIndex];
  
  // Set the path to the album art image
  const albumArtPath = `assets/images/${currentSong}.jpg`;
  
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentSong,
    artwork: [{ src: albumArtPath, sizes: '500x500', type: 'image/jpeg' }]
  });

  navigator.mediaSession.setActionHandler('play', playSong);
  navigator.mediaSession.setActionHandler('pause', pauseSong);
  navigator.mediaSession.setActionHandler('previoustrack', prevSong);
  navigator.mediaSession.setActionHandler('nexttrack', nextSong);
}