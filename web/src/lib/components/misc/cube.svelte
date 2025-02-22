<script lang="ts">
  import { onMount } from 'svelte';
  import Button from '../ui/button/button.svelte';
  let isSpinning: boolean = true
  let cubeElement: HTMLPreElement;
  let width = 80;
  let height = 40;
  let cubeSize = 10;
  let angleX = 0;
  let angleY = 0;
  let angleZ = 0;
  export let red = 237;
  export let green = 132;
  export let blue = 255;
  let color = [red, green, blue];
  const colorSpeed = [0.3, 0.6, 0.4];
  const speedX = Math.random() * 0.05 + 0.01;
  const speedY = Math.random() * 0.05 + 0.01;
  const speedZ = Math.random() * 0.05 + 0.01;
  let loaded = false;
  let isXMouseOver = false;
  let isYMouseOver = false;
  let isZMouseOver = false;

  function createCubePoints(size: number) {
    const d = size / 24;
    return [
      [-d, -d, -d], [-d, -d, d], [-d, d, -d], [-d, d, d],
      [d, -d, -d], [d, -d, d], [d, d, -d], [d, d, d]
    ];
  }

  function rotate(point: number[], angleX: number, angleY: number, angleZ: number) {
    let [x, y, z] = point;
    let cosX = Math.cos(angleX), sinX = Math.sin(angleX);
    [y, z] = [cosX * y - sinX * z, sinX * y + cosX * z];
    let cosY = Math.cos(angleY), sinY = Math.sin(angleY);
    [x, z] = [cosY * x + sinY * z, -sinY * x + cosY * z];
    let cosZ = Math.cos(angleZ), sinZ = Math.sin(angleZ);
    [x, y] = [cosZ * x - sinZ * y, sinZ * x + cosZ * y];
    return [x, y, z];
  }

  function project(point: number[], canvasWidth: number, canvasHeight: number) {
    const [x, y, z] = point;
    const scale = 12 / (12 + z);
    const px = Math.round((x * scale + 1) * canvasWidth / 2);
    const py = Math.round((y * scale + 1) * canvasHeight / 2);
    return [px, py];
  }

  function drawLine(canvas: string[][], start: number[], end: number[]) {
    let [x0, y0] = start;
    let [x1, y1] = end;
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx - dy;

    while (true) {
      if (x0 >= 0 && x0 < width && y0 >= 0 && y0 < height) {
        canvas[y0][x0] = '#';
      }
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 > -dy) { err -= dy; x0 += sx; }
      if (e2 < dx) { err += dx; y0 += sy; }
    }
  }

  function renderCube() {
    const canvas = Array.from({ length: height }, () => Array(width).fill(' '));
    const points = createCubePoints(cubeSize);
    const faces = [
      [0, 1, 3, 2], [4, 5, 7, 6], [0, 1, 5, 4],
      [2, 3, 7, 6], [0, 2, 6, 4], [1, 3, 7, 5]
    ];

    const rotatedPoints = points.map(p => rotate(p, angleX, angleY, angleZ));
    const projectedPoints = rotatedPoints.map(p => project(p, width, height));

    faces.forEach(face => {
      for (let i = 0; i < face.length; i++) {
        const start = projectedPoints[face[i]];
        const end = projectedPoints[face[(i + 1) % face.length]];
        drawLine(canvas, start, end);
      }
    });

    cubeElement.textContent = canvas.map(row => row.join('')).join('\n');
  }

  function updateColor() {
    for (let i = 0; i < 3; i++) {
      color[i] += colorSpeed[i];
      if (color[i] > 255 || color[i] < 0) {
        colorSpeed[i] *= -1;
        color[i] = Math.max(0, Math.min(255, color[i]));
      }
    }
    const [r, g, b] = color.map(Math.round);
    cubeElement.style.color = `rgb(${r}, ${g}, ${b})`;
  }

  function animate() {
    if (isSpinning) {
      angleX += speedX;
      angleY += speedY;
      angleZ += speedZ;
    }
    updateColor();
    renderCube();
    requestAnimationFrame(animate);
  }

  onMount(() => {
    if (!loaded) {
      loaded = true;
      animate();
    }
  });
</script>

<div class="flex flex-col justify-center p-4 space-y-4 space-x-4">
  <pre
    bind:this={cubeElement}
    style="font-size: 12px; line-height: 1em;"
  ></pre>
  {#if !isSpinning}
  <div class="flex justify-center p-4  space-x-4">
    <div
      role="button"
      tabindex="0"
      on:mouseover={
        async () => {
          isXMouseOver = true;
          while (isXMouseOver) {
            angleX += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      on:focus={
        async () => {
          isXMouseOver = true;
          while (isXMouseOver) {
            angleX += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      on:mouseout={
        () => {
          isXMouseOver = false;
        }
      }
      on:blur={
        () => {
          isXMouseOver = false;
        }
      }
    >
      <Button
        variant="outline"
      >X</Button>
    </div>
    <div
      role="button"
      tabindex="0"
      on:mouseover={
        async () => {
          isYMouseOver = true;
          while (isYMouseOver) {
            angleY += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      on:focus={
        async () => {
          isYMouseOver = true;
          while (isYMouseOver) {
            angleY += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      on:mouseout={
        () => {
          isYMouseOver = false;
        }
      }
      on:blur={
        () => {
          isYMouseOver = false;
        }
      }
    >
      <Button
        variant="outline"
      >Y</Button>
    </div>
    <div
      role="button"
      tabindex="0"
      on:mouseover={
        async () => {
          isZMouseOver = true;
          while (isZMouseOver) {
            angleZ += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      on:focus={
        async () => {
          isZMouseOver = true;
          while (isZMouseOver) {
            angleZ += 0.1;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      }
      on:mouseout={
        () => {
          isZMouseOver = false;
        }
      }
      on:blur={
        () => {
          isZMouseOver = false;
        }
      }
    >
      <Button
        variant="outline"
      >Z</Button>
    </div>
  </div>
  {/if}
</div>

<Button
	class="mt-4 outline-none"
	variant="outline"
	on:click={
	() => {
		isSpinning = !isSpinning;
	}
}>{isSpinning ? 'Stop' : 'Spin'} </Button>
