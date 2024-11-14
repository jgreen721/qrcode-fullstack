const canvas = document.querySelector("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;
const ctx = canvas.getContext("2d");
ctx.fillStyle = "hsl(212, 45%, 89%)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
let particles = [];

class Particle {
  constructor(x, y, size, color, vel, travelDistance) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.color = color;
    this.size = size;
    this.r = 0;
    this.vel = vel;
    this.hasInflated = false;
    this.travelDistance = travelDistance;
    this.toShrink = false;
    this.toDelete = false;
  }

  draw() {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
  }

  update() {
    if (this.size > this.r && !this.hasInflated) {
      this.r += 0.1;
    } else {
      this.hasInflated = true;
    }
    this.y += this.vel.y;
    if (Math.abs(this.y - this.baseY) > this.travelDistance) {
      this.toShrink = true;
    }
  }

  shrink() {
    if (this.toShrink) {
      if (this.r > 1.1) {
        this.r -= 0.1;
      } else {
        this.toDelete = true;
      }
    }
  }
}

function generateParticles(count) {
  for (let i = 0; i < count; i++) {
    let posX = (Math.random() * innerWidth) | 0;
    let posY = (Math.random() * innerHeight) | 0;
    let opacity = Math.random();
    opacity = opacity > 0.3 ? opacity : 0.3;
    let size = Math.random() * 4 + 1;
    let velY = Math.random() * -2 + -0.5;
    let color = `rgb(15,20,20,${opacity})`;
    let travelDistance = ((Math.random() * 250) | 0) + 50;
    particles.push(
      new Particle(posX, posY, size, color, { x: 0, y: velY }, travelDistance)
    );
  }
}

generateParticles(120);

function animation() {
  //   ctx.fillStyle = "hsl(212, 45%, 89%)";
  ctx.fillStyle = "rgba(214,226,240,.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((particle, idx) => {
    particle.draw();
    particle.update();
    particle.shrink();
    if (particle.toDelete) {
      particles.splice(idx, 1);
      generateParticles(1);
    }
  });

  requestAnimationFrame(animation);
}

animation();

let resizeInt;
onresize = () => {
  if (resizeInt) clearTimeout(resizeInt);
  resizeInt = setTimeout(() => {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
  }, 250);
};
