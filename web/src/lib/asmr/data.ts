import { browser } from '$app/environment';

export const audio: { [key: string]: string } = {
  bird: '/asmr/sounds/bird.mp3',
  fireplace: '/asmr/sounds/fireplace.mp3',
  footsteps: '/asmr/sounds/footsteps.mp3',
  rain: '/asmr/sounds/rain.mp3',
  keyboard: '/asmr/sounds/typing-keyboard.mp3',
  phone: '/asmr/sounds/typing-iphone.mp3',
};
export const audioPlaying: { [key: string]: boolean } = {};
export const audioVolume: { [key: string]: number } = {
  bird: 0.7,
  fireplace: 0.5,
  footsteps: 0.3,
  rain: 0.5,
  keyboard: 0.3,
  phone: 0.3,
};
export const modelPath: { [key: string]: string } = {
  bird: '/asmr/models/bird.glb',
  fireplace: '/asmr/models/lowpoly_bonfire.glb',
  footsteps: '/asmr/models/shoe.glb',
  rain: '/asmr/models/umbrella_cloud.glb',
  keyboard: '/asmr/models/cartoon_mini_keyboard.glb',
  phone: '/asmr/models/iphone_x.glb',
  pikminPurple: '/asmr/models/pikmin-purple.glb',
  pikminRed: '/asmr/models/pikmin-red.glb',
};
export const modelLoaded: { [key: string]: boolean } = {
  bird: false,
  fireplace: false,
  footsteps: false,
  rain: false,
  keyboard: false,
  phone: false,
  pikminPurple: false,
  pikminRed: false,
};
