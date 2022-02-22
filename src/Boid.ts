import p5Types from "p5";

export interface iBoid {
  index: number;
  pos: p5Types.Vector;
  velocity: p5Types.Vector;
  acceleration: p5Types.Vector;
  update: ([]) => void;
}

export default function Boid(
  p5: p5Types,
  index: number,
  width: number,
  height: number
) {
  let pos = p5.createVector(p5.random(width), p5.random(height));
  let velocity = p5.createVector(Math.random() * 2 - 1, Math.random() * 2 - 1);
  let acceleration = p5.createVector();
  let maxForce = 0.05;
  let maxSpeed = 2;
  let perceptionRadius = 50;
  const size = 10;

  const show = () => {
    let theta = velocity.heading() + p5.radians(90);
    p5.fill(200, 100);
    p5.stroke(255);
    p5.push();
    p5.translate(pos.x, pos.y);
    p5.rotate(theta);
    p5.line(0, 0, 0, size);
    p5.pop();
  };

  const flock = (boids: iBoid[]) => {
    acceleration.set(0, 0);

    let alignment = align(boids);
    let coh = cohesion(boids);
    let sep = separation(boids);

    acceleration.add(alignment);
    acceleration.add(coh);
    acceleration.add(sep);
  };

  interface io {
    boids: iBoid[];
    every: (other: iBoid, steering: p5Types.Vector) => void;
    after?: (steering: p5Types.Vector) => void;
  }

  const mapAllBoids = ({ boids, every, after }: io) => {
    let steering = p5.createVector();
    let total = 0;

    for (let other of boids) {
      let d = p5.dist(pos.x, pos.y, other.pos.x, other.pos.y);
      if (other.index !== index && d < perceptionRadius) {
        every(other, steering);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      if (after) after(steering);
      steering.setMag(maxSpeed);
      steering.sub(velocity);
      steering.limit(maxForce);
    }

    return steering;
  };

  const cohesion = (boids: iBoid[]) =>
    mapAllBoids({
      boids,
      every: (other, steering) => {
        steering.add(other.pos);
      },
      after: (steering) => {
        steering.sub(pos);
      },
    });

  const separation = (boids: iBoid[]) =>
    mapAllBoids({
      boids,
      every: (other, steering) => {
        let dist = p5.dist(pos.x, pos.y, other.pos.x, other.pos.y);
        let diff = p5.createVector(pos.x - other.pos.x, pos.y - other.pos.y);
        diff.div(dist);
        steering.add(diff);
      },
    });

  const align = (boids: iBoid[]) =>
    mapAllBoids({
      boids,
      every: (other, steering) => {
        steering.add(other.velocity);
      },
    });

  const edges = () => {
    if (pos.x > width) pos.x = 0;
    if (pos.x < 0) pos.x = width;
    if (pos.y > height) pos.y = 0;
    if (pos.y < 0) pos.y = height;
  };

  const update = (boids: iBoid[]) => {
    edges();
    flock(boids);
    pos.add(velocity);
    velocity.add(acceleration);
    velocity.limit(maxSpeed);
    show();
  };

  return { index, pos, velocity, acceleration, update };
}
