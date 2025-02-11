import { type GLTF } from 'three/examples/jsm/Addons.js';

export const audio: { [key: string]: string } = {
  bird: '/asmr/sounds/bird.mp3',
  fireplace: '/asmr/sounds/fireplace.mp3',
  footsteps: '/asmr/sounds/footsteps.mp3',
  rain: '/asmr/sounds/rain.mp3',
  keyboard: '/asmr/sounds/typing-keyboard.mp3',
  phone: '/asmr/sounds/typing-iphone.mp3',
  piano: '/asmr/sounds/piano-1.mp3',
  beach: '/asmr/sounds/ocean-waves.mp3',
};

export const audioPlaying: { [key: string]: boolean } = {};
export const audioVolume: { [key: string]: number } = {
  bird: 1.3,
  fireplace: 1.1,
  footsteps: 0.9,
  rain: 1.1,
  keyboard: 0.9,
  phone: 0.9,
  piano: 0.9,
  beach: 1.1,
};

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
};

export const modelLoaded: { [key: string]: boolean } = {
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
};

export const gltfCache: { [key: string]: GLTF } = {};