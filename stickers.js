'use strict';

const GUEST_PROGRESS_KEY = 'chemistry-quest-v1';
const MAX_STICKER_LEVEL = 1 + Math.floor((ALL_QUESTIONS.length * 24 + 900) / 100);
const STICKER_PALETTES = [
 ['Sakura', '#ffe2ed', '#6e354f', '#c85085', '#fff4bd'],
 ['Mint', '#cff7e9', '#224e54', '#378a81', '#ffdd91'],
 ['Luna', '#e6dfff', '#443567', '#7667c5', '#fff4b6'],
 ['Ember', '#ffe6cf', '#73392d', '#cf6748', '#ffed9d'],
 ['Aqua', '#d5efff', '#234975', '#4e8bc0', '#ffddae'],
 ['Plum', '#f4dbfa', '#5f326d', '#a34cac', '#fdf1ad']
];
const STICKER_STYLES = [
 ['Lab Cat', 'M20 37 19 15 39 26M61 26 81 15 80 37'],
 ['Star Student', 'M19 31l3-6 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5z'],
 ['Ribbon Scholar', 'M63 29l16-8v18l-16-7-15 7V21z'],
 ['Moon Mage', 'M76 19a11 11 0 1 0 9 16 12 12 0 0 1-9-16z'],
 ['Bunny Alchemist', 'M31 30C16 2 36 1 42 28M60 28C68 1 86 2 71 31'],
 ['Crown Chemist', 'm28 29-4-15 15 6 11-12 11 12 15-6-4 15z'],
 ['Comet Captain', 'm66 28 18-10-8 14 10 2-21 6z']
];

function stickerForLevel(level) {
 if (level === 1) return {name:'Chemistry Quest', image:'icons/icon.svg'};
 const index = level - 2;
 const [color, background, hair, accent, accessoryColor] = STICKER_PALETTES[index % STICKER_PALETTES.length];
 const [style, accessory] = STICKER_STYLES[Math.floor(index / STICKER_PALETTES.length)];
 const fringe = index % 2 ? 'M23 53q5-28 32-25 23 3 24 25-17-3-24-17-12 18-32 17z' : 'M23 53q2-26 27-27 26 1 29 27-14-1-22-16l-7 14-8-9q-6 10-19 11z';
 const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
 <rect width="100" height="100" rx="24" fill="${background}"/>
 <path d="M15 65v10m-5-5h10M86 54v10m-5-5h10" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
 <path d="M20 84V53a30 30 0 0 1 60 0v31z" fill="${hair}" stroke="#303044" stroke-width="2"/>
 <path d="${accessory}" fill="${accessoryColor}" stroke="#303044" stroke-width="2" stroke-linejoin="round"/>
 <path d="M23 96q5-18 27-18t27 18" fill="${accent}" stroke="#303044" stroke-width="2"/>
 <path d="m43 82 7 10 7-10" fill="#fff" stroke="#303044" stroke-width="2"/>
 <rect x="25" y="35" width="50" height="48" rx="22" fill="#ffe5d5" stroke="#303044" stroke-width="2"/>
 <path d="${fringe}" fill="${hair}" stroke="#303044" stroke-width="2" stroke-linejoin="round"/>
 <ellipse cx="39" cy="60" rx="5" ry="7" fill="#303044"/><ellipse cx="61" cy="60" rx="5" ry="7" fill="#303044"/>
 <circle cx="40" cy="58" r="2" fill="#fff"/><circle cx="62" cy="58" r="2" fill="#fff"/>
 <path d="M47 70q3 4 6 0" fill="none" stroke="#303044" stroke-width="2" stroke-linecap="round"/>
 <ellipse cx="34" cy="68" rx="4" ry="2" fill="#ef9da8"/><ellipse cx="66" cy="68" rx="4" ry="2" fill="#ef9da8"/>
 </svg>`;
 return {name:`${color} ${style}`, image:'data:image/svg+xml,'+encodeURIComponent(svg)};
}

function cleanDisplayName(value) {
 return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f-\u009f]/g, '').trim().slice(0, 32).trim() : '';
}

function updateProfile() {
 const label = KEY === GUEST_PROGRESS_KEY ? 'Guest profile' : 'Edit account profile';
 const button = $('guest-profile-open');
 button.setAttribute('aria-label', label);
 button.title = label;
 $('guest-avatar').src = stickerForLevel(state.avatarLevel).image;
}

let ownerAvatarAccess = false;
const avatarLimit = () => ownerAvatarAccess ? MAX_STICKER_LEVEL : state.stickerLevel;

function openProfile() {
 const guest = KEY === GUEST_PROGRESS_KEY;
 $('guest-profile-title').textContent = guest ? 'Guest profile' : 'Account profile';
 $('profile-storage-note').textContent = guest
  ? 'Your guest profile is saved on this device.'
  : ownerAvatarAccess ? 'The full sticker collection is unlocked for your account.' : 'Your display name and picture sync with your study account.';
 $('profile-name').value = state.displayName;
 renderProfileStickers();
 $('guest-profile-status').textContent = `Current picture: ${stickerForLevel(state.avatarLevel).name}`;
 $('guest-profile').showModal();
}

function equipProfileSticker(level) {
 if (!Number.isInteger(level) || level < 1 || level > avatarLimit()) return;
 state.avatarLevel = level;
 save();
 updateProfile();
 $('guest-profile-status').textContent = `${stickerForLevel(level).name} is your profile picture.`;
}

function renderProfileStickers() {
 const list = $('guest-stickers');
 list.replaceChildren();
 for (let level = 1; level <= avatarLimit(); level++) {
  const sticker = stickerForLevel(level);
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'sticker-choice';
  button.setAttribute('aria-pressed', String(level === state.avatarLevel));
  const image = document.createElement('img');
  image.src = sticker.image;
  image.alt = '';
  const label = document.createElement('span');
  label.textContent = level === 1 ? 'Starter' : `Level ${level} · ${sticker.name}`;
  button.append(image, label);
  button.addEventListener('click', () => {
   equipProfileSticker(level);
   for (const choice of list.children) choice.setAttribute('aria-pressed', String(choice === button));
  });
  list.append(button);
 }
}
