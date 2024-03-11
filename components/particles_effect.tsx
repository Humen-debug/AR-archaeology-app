import { useEffect, useMemo, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import { type Container, type ISourceOptions, MoveDirection, OutMode } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

export default function ParticlesEffect({ playing = 0 }: { playing: number }) {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  const particlesLoaded = async (container?: Container): Promise<void> => {
    console.log(container);
  };

  const confetti: ISourceOptions = useMemo(
    () => ({
      fpsLimit: 60,
      particles: {
        color: {
          value: ["#ffffff", "#000000", "#DBF43E"],
        },
        shape: {
          type: ["circle", "square"],
        },
        opacity: {
          value: { min: 0, max: 1 },
          animation: {
            enable: true,
            speed: 2,
            startValue: "max",
            destroy: "min",
          },
        },
        size: {
          value: { min: 3, max: 7 },
        },
        life: {
          duration: {
            sync: true,
            value: 5,
          },
          count: 1,
        },
        move: {
          enable: true,
          gravity: {
            enable: true,
            acceleration: 20,
          },
          speed: 80,
          decay: 0.1,
          direction: "none",
          random: false,
          straight: false,
          outModes: {
            default: "destroy",
            top: "none",
          },
        },
        rotate: {
          value: {
            min: 0,
            max: 360,
          },
          direction: "random",
          move: true,
          animation: {
            enable: true,
            speed: 60,
          },
        },
        tilt: {
          direction: "random",
          enable: true,
          move: true,
          value: {
            min: 0,
            max: 360,
          },
          animation: {
            enable: true,
            speed: 60,
          },
        },
        roll: {
          darken: {
            enable: true,
            value: 25,
          },
          enable: true,
          speed: {
            min: 15,
            max: 25,
          },
        },
        wobble: {
          distance: 30,
          enable: true,
          move: true,
          speed: {
            min: -15,
            max: 15,
          },
        },
      },
      emitters: [
        {
          direction: "top",
          rate: {
            delay: 0.1,
            quantity: 3,
          },
          position: {
            x: 50,
            y: 100,
          },
          size: {
            width: 0,
            height: 0,
          },
          particles: {
            move: {
              angle: {
                offset: -15,
                value: 60,
              },
            },
          },
        },
      ],
    }),
    []
  );

  const fire: ISourceOptions = useMemo(
    () => ({
      particles: {
        shape: {
          type: "square",
        },
      },
      preset: "fire",
    }),
    []
  );

  if (init && playing !== 0) {
    return <Particles id="tsparticles" particlesLoaded={particlesLoaded} options={playing == 1 ? fire : confetti} />;
  }

  return <></>;
}
