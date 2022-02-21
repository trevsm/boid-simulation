import { render } from "react-dom";
import Sketch from "react-p5";
import p5Types from "p5";

const width = 500,
  height = 500;

interface iBoid {
  id: number;
  pos: p5Types.Vector;
  velocity: p5Types.Vector;
  acceleration: p5Types.Vector;
  show: () => void;
  update: () => void;
  flock: ([]) => void;
  edges: () => void;
}

function Boid(p5: p5Types) {
  let id = Math.random();
  let pos = p5.createVector(p5.random(width), p5.random(height));
  let velocity = p5.createVector(Math.random() * 2 - 1, Math.random() * 2 - 1);
  let acceleration = p5.createVector();
  let total = 0;
  let maxForce = 0.1;
  let maxSpeed = 2;
  let perceptionRadius = 50;

  const show = () => {
    p5.strokeWeight(8);
    p5.stroke(255);
    p5.point(pos.x, pos.y);
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

  const cohesion = (boids: iBoid[]) => {
    let steering = p5.createVector();
    let total = 0;

    for (let other of boids) {
      let d = p5.dist(pos.x, pos.y, other.pos.x, other.pos.y);
      if (other.id !== id && d < perceptionRadius) {
        steering.add(other.pos);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.sub(pos);
      steering.setMag(maxSpeed);
      steering.sub(velocity);
      steering.limit(maxForce);
    }

    return steering;
  };

  const separation = (boids: iBoid[]) => {
    let steering = p5.createVector();
    let total = 0;

    for (let other of boids) {
      let d = p5.dist(pos.x, pos.y, other.pos.x, other.pos.y);
      if (other.id !== id && d < perceptionRadius) {
        let diff = p5.createVector(pos.x - other.pos.x, pos.y - other.pos.y);
        diff.div(d);
        steering.add(diff);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(maxSpeed);
      steering.sub(velocity);
      steering.limit(maxForce);
    }

    return steering;
  };

  const align = (boids: iBoid[]) => {
    let steering = p5.createVector();
    let total = 0;

    for (let other of boids) {
      let d = p5.dist(pos.x, pos.y, other.pos.x, other.pos.y);
      if (other.id !== id && d < perceptionRadius) {
        steering.add(other.velocity);
        total++;
      }
    }
    if (total > 0) {
      steering.div(total);
      steering.setMag(maxSpeed);
      steering.sub(velocity);
      steering.limit(maxForce);
    }

    return steering;
  };

  const edges = () => {
    if (pos.x > width) {
      pos.x = 0;
    } else if (pos.x < 0) {
      pos.x = width;
    }
    if (pos.y > height) {
      pos.y = 0;
    } else if (pos.y < 0) {
      pos.y = height;
    }
  };

  const update = () => {
    pos.add(velocity);
    velocity.add(acceleration);
    velocity.limit(maxSpeed);
  };

  return { id, pos, velocity, acceleration, show, update, flock, edges };
}

function App() {
  const boids: iBoid[] = [];

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);

    for (let i = 0; i < 100; i++) {
      boids.push(Boid(p5));
    }
  };

  const draw = (p5: p5Types) => {
    p5.background(51);
    for (let boid of boids) {
      boid.edges();
      boid.flock(boids);
      boid.update();
      boid.show();
    }
  };

  // @ts-ignore
  return <Sketch setup={setup} draw={draw} />;
}

render(<App />, document.querySelector("#root"));
