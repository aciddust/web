import { type GLTF } from 'three/examples/jsm/Addons.js';
import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const emojis: { [key: string]: string } = {
  volume: '🎚️',
  bird: '🦜',
  fireplace: '🔥',
  footsteps: '👞',
  rain: '☔',
  keyboard: '💻',
  phone: '📱',
  piano: '🎹',
  beach: '🏖️',
  sound: '🎵',
  window: '🪟',
  temple: '🧘',
  sizzling: '🍳',
}

export const audio: { [key: string]: string } = {
  bird: '/asmr/sounds/bird.mp3',
  fireplace: '/asmr/sounds/fireplace.mp3',
  footsteps: '/asmr/sounds/footsteps.mp3',
  rain: '/asmr/sounds/rain.mp3',
  keyboard: '/asmr/sounds/typing-keyboard.mp3',
  phone: '/asmr/sounds/typing-iphone.mp3',
  piano: '/asmr/sounds/piano-1.mp3',
  beach: '/asmr/sounds/ocean-waves.mp3',
  window: '/asmr/sounds/wind.mp3',
  temple: '/asmr/sounds/temple-chime.mp3',
  sizzling: '/asmr/sounds/sizzling.mp3',
};

export const audioVolumeDefault: { [key: string]: number } = {
  bird: 2.4,
  fireplace: 1.1,
  footsteps: 0.9,
  rain: 1.1,
  keyboard: 0.9,
  phone: 0.9,
  beach: 1.1,
  piano: 30, // FIXME: scloud, not threejs
  window: 2.6,
  temple: 1.2,
  sizzling: 1.8,
};

export const audioPlaying = writable<{ [key: string]: boolean }>({
  bird: false,
  fireplace: false,
  footsteps: false,
  rain: false,
  keyboard: false,
  phone: false,
  piano: false,
  beach: false,
  window: false,
  temple: false,
  sizzling: false,
});
export const audioVolume = writable<{ [key: string]: number }>({
  bird: audioVolumeDefault.bird,
  fireplace: audioVolumeDefault.fireplace,
  footsteps: audioVolumeDefault.footsteps,
  rain: audioVolumeDefault.rain,
  keyboard: audioVolumeDefault.keyboard,
  phone: audioVolumeDefault.phone,
  piano: audioVolumeDefault.piano,
  beach: audioVolumeDefault.beach,
  window: audioVolumeDefault.window,
  temple: audioVolumeDefault.temple,
  sizzling: audioVolumeDefault.sizzling,
});

export const modelPath: { [key: string]: string } = {
  headphones: '/asmr/models/headphones.glb',
  bird: '/asmr/models/bird.glb',
  fireplace: '/asmr/models/lowpoly_bonfire.glb',
  footsteps: '/asmr/models/shoe.glb',
  rain: '/asmr/models/umbrella_cloud.glb',
  keyboard: '/asmr/models/cartoon_mini_keyboard.glb',
  phone: '/asmr/models/iphone_x.glb',
  pikminPurple: '/asmr/models/pikmin-purple.glb',
  pikminRed: '/asmr/models/pikmin-red.glb',
  piano: '/asmr/models/mini_piano.glb',
  beach: '/asmr/models/palm_tree.glb',
  window: '/asmr/models/window.glb',
  temple: '/asmr/models/chime.glb',
  sizzling: '/asmr/models/frypan.glb',
};

export const modelLoaded = writable<{ [key: string]: boolean }>({
  headphones: false,
  bird: false,
  fireplace: false,
  footsteps: false,
  rain: false,
  keyboard: false,
  phone: false,
  pikminPurple: false,
  pikminRed: false,
  piano: false,
  beach: false,
  window: false,
  temple: false,
  sizzling: false,
});

export const gltfCache: { [key: string]: GLTF } = {};
