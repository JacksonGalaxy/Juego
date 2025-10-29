# 🎮 Breakout Game

Juego clásico de Breakout desarrollado con HTML5 Canvas y JavaScript 

## ✨ Características

### 🎯 Jugabilidad
- **Control dual**: Usa las flechas del teclado (← →) o el mouse para mover la paleta
- **Sistema de niveles**: Dificultad progresiva con más filas de bloques
- **Sistema de vidas**: 3 vidas 
- **Física realista**: Ángulo de rebote basado en el punto de impacto en la paleta

### 🎨 Visual
- **8 colores de bloques** con gradientes y sombras
- **Fondo con cuadrícula** personalizable
- **Efectos de iluminación** en paleta y pelota
- **Interfaz moderna** con overlays animados

### 🔊 Audio
- **Música de fondo** en loop durante el juego
- **3 sonidos aleatorios** al romper bloques 

### 💾 Persistencia
- **localStorage** para guardar mejor puntaje
- **Auto-guardado** del progreso actual 
- **Opción de continuar** partida guardada al recargar
- **Botón para borrar datos** en pantalla de inicio

### ⚙️ Funcionalidades
- **Sistema de pausa** (presiona ESPACIO)
- **Puntaje progresivo**: Bloques superiores dan más puntos
- **Velocidad limitada**: La pelota no acelera infinitamente

## 🎮 Controles

| Acción | Controles |
|--------|-----------|
| Mover paleta | ← → (flechas) o Mouse |
| Pausar/Reanudar | ESPACIO |
| Iniciar juego | Click en botón |

## 📁 Estructura de Archivos

```
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── juego.js
└── sound/
    ├── Balatro.mp3
    ├── break1.mp3
    ├── break2.mp3
    ├── break3.mp3
    ├── gameover.mp3
    └── victory.mp3
```

## 🚀 Instalación

1. Clona o descarga el repositorio
2. Agrega los archivos de audio en la carpeta `sound/`
3. Abre `index.html` en tu navegador

¡No requiere servidor ni dependencias externas!

## 🎵 Archivos de Audio Requeridos

- `Balatro.mp3` - Música de fondo
- `break1.mp3`, `break2.mp3`, `break3.mp3` - Sonidos de rotura
- `gameover.mp3` - Sonido de derrota
- `victory.mp3` - Sonido de victoria

## 🔧 Personalización

Puedes ajustar fácilmente:
- Colores de bloques en el array `coloresBloques`
- Velocidad de la paleta modificando `paleta.velocidad`
- Número de vidas cambiando el valor inicial de `vidas`
- Probabilidad de sonidos en `reproducirSonidoRotura()`
- Apariencia del fondo en la función `dibujarFondo()`

