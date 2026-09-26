import {
  type CSSProperties,
  type ReactNode,
  memo,
  useEffect,
  useRef,
} from 'react';

import { useDndContext } from '@dnd-kit/core';

type PhysicsOverlayProps = {
  children: ReactNode;

  maxRotation?: number;
  rotationFactor?: number;

  stiffness?: number;
  damping?: number;
  mass?: number;

  transformOrigin?: string;
  className?: string;
  style?: CSSProperties;
};

type State = {
  x: number;
  y: number;
  time: number;

  velocityX: number;
  velocityY: number;

  rotation: number;
  angularVelocity: number;
};

const EPSILON = 0.001;
const MAX_VELOCITY = 3000;

export const PhysicsOverlay = memo(function PhysicsOverlay({
  children,
  maxRotation = 25,
  rotationFactor = 0.016,
  stiffness = 500,
  damping = 35,
  mass = 0.75,
  transformOrigin = '50% 0%',
  className,
  style,
}: PhysicsOverlayProps) {
  const { active } = useDndContext();

  const elementRef = useRef<HTMLDivElement>(null);

  const stateRef = useRef<State>({
    x: 0,
    y: 0,
    time: 0,

    velocityX: 0,
    velocityY: 0,

    rotation: 0,
    angularVelocity: 0,
  });

  const frameRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef(0);

  const animate = (time: number) => {
    const element = elementRef.current;

    if (!element) {
      frameRef.current = null;
      return;
    }

    const state = stateRef.current;

    const dt = Math.min((time - lastFrameTimeRef.current) / 1000, 1 / 30);

    lastFrameTimeRef.current = time;

    /*
     * Target rotation is based on horizontal velocity.
     *
     * Positive X velocity -> rotate right
     * Negative X velocity -> rotate left
     */
    const targetRotation = clamp(
      state.velocityX * rotationFactor,
      -maxRotation,
      maxRotation,
    );

    /*
     * Spring.
     */
    const displacement = targetRotation - state.rotation;

    const springForce = displacement * stiffness;
    const dampingForce = state.angularVelocity * damping;

    const acceleration = (springForce - dampingForce) / mass;

    state.angularVelocity += acceleration * dt;
    state.rotation += state.angularVelocity * dt;

    /*
     * When pointer movement stops, velocity naturally decays.
     */
    state.velocityX *= Math.pow(0.001, dt);
    state.velocityY *= Math.pow(0.001, dt);

    /*
     * Only modify our own transform property.
     *
     * dnd-kit owns translate().
     * PhysicsOverlay owns rotate().
     */
    element.style.rotate = `${state.rotation}deg`;

    const settled =
      Math.abs(state.rotation) < EPSILON &&
      Math.abs(state.angularVelocity) < EPSILON &&
      Math.abs(state.velocityX) < 0.1;

    if (settled && !active) {
      state.rotation = 0;
      state.angularVelocity = 0;

      element.style.rotate = '0deg';

      frameRef.current = null;
      return;
    }

    frameRef.current = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (frameRef.current !== null) {
      return;
    }

    lastFrameTimeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(animate);
  };

  /*
   * Read dnd-kit's current translated rect.
   *
   * This is intentionally done inside PhysicsOverlay.
   */
  useEffect(() => {
    const translated = active?.rect.current.translated;

    if (!translated) {
      return;
    }

    const x = translated.left;
    const y = translated.top;
    const now = performance.now();

    const state = stateRef.current;

    if (state.time !== 0) {
      const dt = Math.max(now - state.time, 1);

      state.velocityX = clamp(
        ((x - state.x) / dt) * 1000,
        -MAX_VELOCITY,
        MAX_VELOCITY,
      );

      state.velocityY = clamp(
        ((y - state.y) / dt) * 1000,
        -MAX_VELOCITY,
        MAX_VELOCITY,
      );
    }

    state.x = x;
    state.y = y;
    state.time = now;

    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active?.rect.current.translated]);

  /*
   * Reset when drag ends.
   */
  useEffect(() => {
    if (active) {
      return;
    }

    const state = stateRef.current;

    state.x = 0;
    state.y = 0;
    state.time = 0;

    state.velocityX = 0;
    state.velocityY = 0;

    startAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={elementRef}
      className={className}
      style={{
        ...style,
        transformOrigin,
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
});

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
