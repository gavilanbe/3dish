# 🌊 Tideborne (3dish)
Un océano. Una luz tenue a lo lejos. Camina hacia ella. Una experiencia 3D atmosférica de exploración en primera persona, con agua, cielo y faro renderizados en tiempo real.

## ✨ Características
- Mundo 3D en tiempo real construido con React Three Fiber.
- Océano y cielo con shaders propios (GLSL), niebla y luz volumétrica.
- Faro como faro guía: recoge fragmentos mientras avanzas.
- Física integrada con Rapier para el movimiento del jugador.
- Postprocesado (bloom y efectos) para el ambiente cinematográfico.
- Control en primera persona con pointer lock.

## 🚀 Cómo jugar / ejecutar
```bash
npm install
npm run dev      # servidor de desarrollo de Vite
```
Para una build de producción:
```bash
npm run build    # genera dist/
npm run preview  # sirve la build
```

## 🎮 Controles
- WASD / flechas: moverse.
- Ratón: mirar (requiere click inicial para activar el pointer lock).
- Camina hacia la luz y recoge los fragmentos.

## 🛠️ Tecnología
- TypeScript + React 19 + Vite.
- Three.js con React Three Fiber y Drei.
- `@react-three/rapier` (física) y `@react-three/postprocessing` (postFX).
- Zustand para el estado del juego y shaders GLSL personalizados.

## 📦 Parte de mi colección de juegos
Uno más de mis proyectos de juegos hechos por hobby. 🎮
