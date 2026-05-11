<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);

interface Star {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
}

let stars: Star[] = [];
let mouse = { x: 0, y: 0 };
const numStars = 500;

const createStars = () => {
  if (!canvasRef.value) return;
  const { width, height } = canvasRef.value;
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.5,
      vx: Math.floor(Math.random() * 50) - 25,
      vy: Math.floor(Math.random() * 50) - 25,
    });
  }
};

const handleMouseMove = (event: MouseEvent) => {
  if (canvasRef.value) {
    mouse.x = event.clientX - canvasRef.value.getBoundingClientRect().left;
    mouse.y = event.clientY - canvasRef.value.getBoundingClientRect().top;
  }
};

const draw = (ctx: CanvasRenderingContext2D) => {
  if (!canvasRef.value) return;
  const { width, height } = canvasRef.value;
  ctx.clearRect(0, 0, width, height);

  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
};

const update = () => {
  stars.forEach(star => {
    const distance = Math.sqrt(Math.pow(mouse.x - star.x, 2) + Math.pow(mouse.y - star.y, 2));
    if (distance < 100) {
      star.x += star.vx / 10;
      star.y += star.vy / 10;
    }

    if (star.x < 0 || star.x > canvasRef.value!.width) star.vx = -star.vx;
    if (star.y < 0 || star.y > canvasRef.value!.height) star.vy = -star.vy;
  });
};

const animate = () => {
  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext('2d');
  if (ctx) {
    update();
    draw(ctx);
  }
  requestAnimationFrame(animate);
};

onMounted(() => {
  if (canvasRef.value) {
    canvasRef.value.width = canvasRef.value.offsetWidth;
    canvasRef.value.height = canvasRef.value.offsetHeight;
    createStars();
    animate();
    window.addEventListener('mousemove', handleMouseMove);
  }
});

onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove);
});
</script>
