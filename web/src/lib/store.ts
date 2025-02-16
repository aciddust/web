import {
  writable,
  toStore,
  readonly,
  fromStore,
  derived,
} from 'svelte/store';

export const markdownTableInput = writable('');
export const markdownTableOutput = writable('');

