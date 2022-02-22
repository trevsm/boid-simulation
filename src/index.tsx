import { render } from "react-dom";
import Sketch from "react-p5";
import p5Types from "p5";
import Boid, { iBoid } from "./Boid";

function App() {
  const width = 500,
    height = 500;

  const boids: iBoid[] = [];

  const setup = (p5: p5Types, canvasParentRef: Element) => {
    p5.createCanvas(width, height).parent(canvasParentRef);

    for (let i = 0; i < 200; i++) {
      boids.push(Boid(p5, i, width, height));
    }
  };

  const draw = (p5: p5Types) => {
    p5.background(50);
    for (let boid of boids) {
      boid.update(boids);
    }
  };

  // @ts-ignore
  return <Sketch setup={setup} draw={draw} />;
}

render(<App />, document.querySelector("#root"));
