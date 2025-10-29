const lienzo = document.getElementById('lienzo');
const ctx = lienzo.getContext('2d');


const ANCHO_CANVAS = lienzo.width;
const ALTO_CANVAS = lienzo.height;

// Musica Balatrosa
const musicaFondo = document.getElementById('musicaFondo');
if (musicaFondo) {
    musicaFondo.volume = 0.5; //(0.0 = silencio, 1.0 = máximo)
}

// Sonidos de rotura de ladrillos
const sonidosRotura = [
    document.getElementById('sonidoRotura1'),
    document.getElementById('sonidoRotura2'),
    document.getElementById('sonidoRotura3')
];

// Ajustar volumen de los sonidos de rotura
sonidosRotura.forEach(sonido => {
    if (sonido) {
        sonido.volume = 0.05; // Volumen más bajo para efectos de sonido
    }
});

// Función para reproducir un sonido aleatorio de rotura
function reproducirSonidoRotura() {
    const sonidoAleatorio = sonidosRotura[Math.floor(Math.random() * sonidosRotura.length)];
    if (sonidoAleatorio) {
        // Reiniciar el sonido si ya está reproduciéndose
        sonidoAleatorio.currentTime = 0;
        sonidoAleatorio.play().catch(error => {
            console.log('Error al reproducir sonido:', error);
        });
    }
}

// PALETA
const paleta = {
    ancho: 100,
    alto: 15,
    x: ANCHO_CANVAS / 2 - 50,
    y: ALTO_CANVAS - 30,
    velocidad: 8,
    color: '#00d9ff'
};

// PELOTA
const pelota = {
    x: ANCHO_CANVAS / 5,
    y: ALTO_CANVAS / 5,
    radio: 8,
    velocidadX: 5,
    velocidadY: -5,
    velocidadMaxima: 15,
    color: '#ffffff'
};

// BLOQUES
const configuracionBloques = {
    filas: 10,
    columnas: 12,
    ancho: 60,
    alto: 20,
    padding: 5,
    offsetX: 12.5,
    offsetY: 60
};

// Colores para  filas de bloques
const coloresBloques = [
    '#ff006e', 
    '#ff4d6d',
    '#ffaf00', 
    '#ffcd00', 
    '#06ffa5', 
    '#00d9ff', 
    '#4361ee', 
    '#7209b7'  
];

//  ESTADO DEL JUEGO 
let bloques = [];
let puntaje = 0;
let mejorPuntaje = 0;
let vidas = 3;
let nivel = 1;
let juegoActivo = false;
let juegoPausado = false;
let animacionId = null;

// CONTROLES
let teclas = {
    izquierda: false,
    derecha: false
};

let mouseX = 0;
let usarMouse = false;

// INTERFAZ
function crearInterfaz() {
    const area = document.querySelector('.area');
    
    // Crear panel de información
    const panelInfo = document.createElement('div');
    panelInfo.id = 'panelInfo';
    panelInfo.innerHTML = `
        <div class="info-item">
            <span class="etiqueta">Puntaje:</span>
            <span id="puntaje" class="valor">0</span>
        </div>
        <div class="info-item">
            <span class="etiqueta">Mejor Puntaje:</span>
            <span id="mejorPuntaje" class="valor">0</span>
        </div>
        <div class="info-item">
            <span class="etiqueta">Vidas:</span>
            <span id="vidas" class="valor">3</span>
        </div>
        <div class="info-item">
            <span class="etiqueta">Nivel:</span>
            <span id="nivel" class="valor">1</span>
        </div>
    `;
    area.insertBefore(panelInfo, lienzo);
    
    // Crear pantalla de inicio
    crearPantallaInicio();
}

// PANTALLA DE INICIO
function crearPantallaInicio() {
    const area = document.querySelector('.area');
    const pantallaInicio = document.createElement('div');
    pantallaInicio.id = 'pantallaInicio';
    pantallaInicio.className = 'pantalla-overlay';
    pantallaInicio.innerHTML = `
        <h1>BREAKOUT</h1>
        <p>Usa las flechas ← → o el mouse para mover la paleta</p>
        <button id="botonIniciar" class="boton">Iniciar Juego</button>
    `;
    area.appendChild(pantallaInicio);
    
    document.getElementById('botonIniciar').addEventListener('click', () => {
        iniciarJuego();
    });
}

// GAME OVER
function crearPantallaGameOver() {
    const area = document.querySelector('.area');
    const pantallaGameOver = document.createElement('div');
    pantallaGameOver.id = 'pantallaGameOver';
    pantallaGameOver.className = 'pantalla-overlay oculto';
    pantallaGameOver.innerHTML = `
        <h1>GAME OVER</h1>
        <p>Tu puntaje: <span id="puntajeFinal">0</span></p>
        <button id="botonReintentar" class="boton">Reintentar</button>
    `;
    area.appendChild(pantallaGameOver);
    
    document.getElementById('botonReintentar').addEventListener('click', () => {
        iniciarJuego();
    });
}

// VICTORIA
function crearPantallaVictoria() {
    const area = document.querySelector('.area');
    const pantallaVictoria = document.createElement('div');
    pantallaVictoria.id = 'pantallaVictoria';
    pantallaVictoria.className = 'pantalla-overlay oculto';
    pantallaVictoria.innerHTML = `
        <h1>¡VICTORIA!</h1>
        <p>Nivel completado</p>
        <p>Puntaje: <span id="puntajeVictoria">0</span></p>
        <button id="botonSiguienteNivel" class="boton">Siguiente Nivel</button>
    `;
    area.appendChild(pantallaVictoria);
    
    document.getElementById('botonSiguienteNivel').addEventListener('click', () => {
        siguienteNivel();
    });
}

//PAUSA
function crearPantallaPausa() {
    const area = document.querySelector('.area');
    const pantallaPausa = document.createElement('div');
    pantallaPausa.id = 'pantallaPausa';
    pantallaPausa.className = 'pantalla-overlay oculto';
    pantallaPausa.innerHTML = `
        <h1>PAUSA</h1>
        <p>Presiona ESPACIO para continuar</p>
    `;
    area.appendChild(pantallaPausa);
}


// FUNCIONES DE ALMACENAMIENTO CON LOCALSTORAGE


// Carga el mejor puntaje guardado desde localStorage
function cargarMejorPuntaje() {
    try {
        const puntajeGuardado = localStorage.getItem('mejorPuntaje');
        if (puntajeGuardado !== null) {
            mejorPuntaje = parseInt(puntajeGuardado);
            actualizarInterfaz();
        }
    } catch (error) {
        console.log('No hay mejor puntaje guardado todavía');
        mejorPuntaje = 0;
    }
}

// Guarda el mejor puntaje en localStorage
function guardarMejorPuntaje() {
    try {
        if (puntaje > mejorPuntaje) {
            mejorPuntaje = puntaje;
            localStorage.setItem('mejorPuntaje', mejorPuntaje.toString());
            actualizarInterfaz();
        }
    } catch (error) {
        console.error('Error al guardar el mejor puntaje:', error);
    }
}

// Guarda el progreso actual del juego
function guardarProgreso() {
    try {
        const progreso = {
            puntaje: puntaje,
            nivel: nivel,
            vidas: vidas,
            fecha: new Date().toISOString()
        };
        localStorage.setItem('progresoActual', JSON.stringify(progreso));
    } catch (error) {
        console.error('Error al guardar progreso:', error);
    }
}

// Carga el progreso guardado
function cargarProgreso() {
    try {
        const progresoGuardado = localStorage.getItem('progresoActual');
        if (progresoGuardado !== null) {
            const progreso = JSON.parse(progresoGuardado);
            puntaje = progreso.puntaje;
            nivel = progreso.nivel;
            vidas = progreso.vidas;
            actualizarInterfaz();
            return true;
        }
    } catch (error) {
        console.log('No hay progreso guardado');
    }
    return false;
}


// JUEGO


// MATRIZ DE BLOQUES SEGUN NIVEL
function crearBloques() {
    bloques = [];
    const filasActuales = Math.min(configuracionBloques.filas + Math.floor((nivel - 1) / 2), 10);
    
    for (let fila = 0; fila < filasActuales; fila++) {
        for (let col = 0; col < configuracionBloques.columnas; col++) {
            const bloque = {
                x: col * (configuracionBloques.ancho + configuracionBloques.padding) + configuracionBloques.offsetX,
                y: fila * (configuracionBloques.alto + configuracionBloques.padding) + configuracionBloques.offsetY,
                ancho: configuracionBloques.ancho,
                alto: configuracionBloques.alto,
                color: coloresBloques[fila % coloresBloques.length],
                visible: true,
                puntos: (filasActuales - fila) * 10
            };
            bloques.push(bloque);
        }
    }
}

// REINICIAR PELOTA AL CENTRO
function reiniciarPelota() {
    pelota.x = ANCHO_CANVAS / 2;
    pelota.y = ALTO_CANVAS / 2;
    
    const angulo = Math.random() * Math.PI / 2 - Math.PI / 4;
    const velocidadBase = 5 + (nivel - 1) * 0.5;
    pelota.velocidadX = Math.cos(angulo) * velocidadBase;
    pelota.velocidadY = -Math.abs(Math.sin(angulo) * velocidadBase);
}

// REINICIAR PALETA AL CENTRO
function reiniciarPaleta() {
    paleta.x = ANCHO_CANVAS / 2 - paleta.ancho / 2;
}

//NUEVO JUEGO
function iniciarJuego() {
    puntaje = 0;
    vidas = 3;
    nivel = 1;
    juegoActivo = true;
    juegoPausado = false;
    
    crearBloques();
    reiniciarPelota();
    reiniciarPaleta();
    actualizarInterfaz();
    ocultarPantallas();
    
    if (animacionId) {
        cancelAnimationFrame(animacionId);
    }
    buclePrincipal();

    // REPRODUCIR MUSICA BALATROSA
    if (musicaFondo) {
        musicaFondo.play().catch(error => {
            console.log('No se pudo reproducir la música:', error);
        });
    }

}


//NIVEL
function siguienteNivel() {
    nivel++;
    crearBloques();
    reiniciarPelota();
    reiniciarPaleta();
    juegoActivo = true;
    juegoPausado = false;
    ocultarPantallas();
    
    guardarProgreso();
    buclePrincipal();
}


// DIBUJO EN CANVAS


// PALETA
function dibujarPaleta() {
    ctx.save();
    
    ctx.shadowColor = 'rgba(0, 217, 255, 0.5)';
    ctx.shadowBlur = 15;
    
    const gradiente = ctx.createLinearGradient(paleta.x, paleta.y, paleta.x, paleta.y + paleta.alto);
    gradiente.addColorStop(0, '#00d9ff');
    gradiente.addColorStop(1, '#0099cc');
    
    ctx.fillStyle = gradiente;
    ctx.fillRect(paleta.x, paleta.y, paleta.ancho, paleta.alto);
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.strokeRect(paleta.x, paleta.y, paleta.ancho, paleta.alto);
    
    ctx.restore();
}

// PELOTA
function dibujarPelota() {
    ctx.save();
    
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 20;
    
    const gradiente = ctx.createRadialGradient(
        pelota.x - 2, pelota.y - 2, 0,
        pelota.x, pelota.y, pelota.radio
    );
    gradiente.addColorStop(0, '#ffffff');
    gradiente.addColorStop(1, '#aaaaaa');
    
    ctx.beginPath();
    ctx.arc(pelota.x, pelota.y, pelota.radio, 0, Math.PI * 2);
    ctx.fillStyle = gradiente;
    ctx.fill();
    ctx.closePath();
    
    ctx.restore();
}

// BLOQUES VISIBLES
function dibujarBloques() {
    bloques.forEach(bloque => {
        if (bloque.visible) {
            ctx.save();
            
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 5;
            
            const gradiente = ctx.createLinearGradient(
                bloque.x, bloque.y,
                bloque.x, bloque.y + bloque.alto
            );
            gradiente.addColorStop(0, bloque.color);
            gradiente.addColorStop(1, ajustarBrillo(bloque.color, -30));
            
            ctx.fillStyle = gradiente;
            ctx.fillRect(bloque.x, bloque.y, bloque.ancho, bloque.alto);
            
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.strokeRect(bloque.x, bloque.y, bloque.ancho, bloque.alto);
            
            ctx.restore();
        }
    });
}

// FONDO
function dibujarFondo() {
    ctx.fillStyle = '#0f1729';
    ctx.fillRect(0, 0, ANCHO_CANVAS, ALTO_CANVAS);
    
    ctx.strokeStyle = 'rgba(0, 217, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < ANCHO_CANVAS; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, ALTO_CANVAS);
        ctx.stroke();
    }
    
    for (let y = 0; y < ALTO_CANVAS; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(ANCHO_CANVAS, y);
        ctx.stroke();
    } 
}


// FISICAS Y COLISIONES


// ACTUALIZAR PELOTA Y VERIFICAR COLISIONES
function actualizarPelota() {
    pelota.x += pelota.velocidadX;
    pelota.y += pelota.velocidadY;
    
    if (pelota.x - pelota.radio < 0 || pelota.x + pelota.radio > ANCHO_CANVAS) {
        pelota.velocidadX *= -1;
        pelota.x = Math.max(pelota.radio, Math.min(ANCHO_CANVAS - pelota.radio, pelota.x));
    }
    
    if (pelota.y - pelota.radio < 0) {
        pelota.velocidadY *= -1;
        pelota.y = pelota.radio;
    }
    
    if (pelota.y + pelota.radio > ALTO_CANVAS) {
        vidas--;
        actualizarInterfaz();
        
        if (vidas > 0) {
            reiniciarPelota();
            reiniciarPaleta();
        } else {
            gameOver();
        }
    }
    
    if (pelota.y + pelota.radio >= paleta.y &&
        pelota.y - pelota.radio <= paleta.y + paleta.alto &&
        pelota.x >= paleta.x &&
        pelota.x <= paleta.x + paleta.ancho) {
        
        const puntoImpacto = (pelota.x - paleta.x) / paleta.ancho;
        const anguloRebote = (puntoImpacto - 0.5) * Math.PI / 3;
        
        const velocidadActual = Math.sqrt(pelota.velocidadX ** 2 + pelota.velocidadY ** 2);
        pelota.velocidadX = Math.sin(anguloRebote) * velocidadActual;
        pelota.velocidadY = -Math.abs(Math.cos(anguloRebote) * velocidadActual);
        
        pelota.y = paleta.y - pelota.radio;
    }
    
    const velocidadTotal = Math.sqrt(pelota.velocidadX ** 2 + pelota.velocidadY ** 2);
    if (velocidadTotal > pelota.velocidadMaxima) {
        const factor = pelota.velocidadMaxima / velocidadTotal;
        pelota.velocidadX *= factor;
        pelota.velocidadY *= factor;
    }
}

// COLISIONES PELOTA-BLOQUES
function detectarColisionBloques() {
    bloques.forEach(bloque => {
        if (!bloque.visible) return;
        
        if (pelota.x + pelota.radio > bloque.x &&
            pelota.x - pelota.radio < bloque.x + bloque.ancho &&
            pelota.y + pelota.radio > bloque.y &&
            pelota.y - pelota.radio < bloque.y + bloque.alto) {
            
            const dentroX = Math.min(
                Math.abs((pelota.x + pelota.radio) - bloque.x),
                Math.abs((pelota.x - pelota.radio) - (bloque.x + bloque.ancho))
            );
            const dentroY = Math.min(
                Math.abs((pelota.y + pelota.radio) - bloque.y),
                Math.abs((pelota.y - pelota.radio) - (bloque.y + bloque.alto))
            );
            
            if (dentroX < dentroY) {
                pelota.velocidadX *= -1;
            } else {
                pelota.velocidadY *= -1;
            }
            
            bloque.visible = false;
            puntaje += bloque.puntos;
            actualizarInterfaz();
            guardarMejorPuntaje();
            
            // Reproducir sonido aleatorio al romper el bloque
            reproducirSonidoRotura();
            
            verificarVictoria();
        }
    });
}

// VICTORIA (BLOQUES DESTRUIDOS)
function verificarVictoria() {
    const bloquesRestantes = bloques.filter(b => b.visible).length;
    if (bloquesRestantes === 0) {
        victoria();
    }
}

//MOVIMIENTO DE PALETA
function actualizarPaleta() {
    if (usarMouse) {
        paleta.x = mouseX - paleta.ancho / 2;
    } else {
        if (teclas.izquierda) {
            paleta.x -= paleta.velocidad;
        }
        if (teclas.derecha) {
            paleta.x += paleta.velocidad;
        }
    }
    
    paleta.x = Math.max(0, Math.min(ANCHO_CANVAS - paleta.ancho, paleta.x));
}


// BUCLE PRINCIPAL DEL JUEGO


//ACTUALIZA Y DIBUJA EL JUEGO
function buclePrincipal() {
    if (!juegoActivo || juegoPausado) return;
    
    dibujarFondo();
    
    actualizarPaleta();
    actualizarPelota();
    detectarColisionBloques();
    
    dibujarBloques();
    dibujarPaleta();
    dibujarPelota();
    
    animacionId = requestAnimationFrame(buclePrincipal);
}


//  ESTADOS DEL JUEGO


// GAME-OVER
function gameOver() {
    juegoActivo = false;
    cancelAnimationFrame(animacionId);
    
    document.getElementById('puntajeFinal').textContent = puntaje;
    document.getElementById('pantallaGameOver').classList.remove('oculto');
    
    guardarMejorPuntaje();
}

// VICTORIA
function victoria() {
    juegoActivo = false;
    cancelAnimationFrame(animacionId);
    
    document.getElementById('puntajeVictoria').textContent = puntaje;
    document.getElementById('pantallaVictoria').classList.remove('oculto');
    
    guardarMejorPuntaje();
    guardarProgreso();
}

// PAUSA
function alternarPausa() {
    if (!juegoActivo) return;
    
    juegoPausado = !juegoPausado;
    
    if (juegoPausado) {
        cancelAnimationFrame(animacionId);
        document.getElementById('pantallaPausa').classList.remove('oculto');
    } else {
        document.getElementById('pantallaPausa').classList.add('oculto');
        buclePrincipal();
    }
}

// VALORES MOSTRADOS (PUNTOS, etc)
function actualizarInterfaz() {
    document.getElementById('puntaje').textContent = puntaje;
    document.getElementById('mejorPuntaje').textContent = mejorPuntaje;
    document.getElementById('vidas').textContent = vidas;
    document.getElementById('nivel').textContent = nivel;
}

// OCULATAR VENTANAS
function ocultarPantallas() {
    document.getElementById('pantallaInicio').classList.add('oculto');
    document.getElementById('pantallaGameOver').classList.add('oculto');
    document.getElementById('pantallaVictoria').classList.add('oculto');
    document.getElementById('pantallaPausa').classList.add('oculto');
}

// OTRAS FUNCIONES (colores)

/**
 * Ajusta el brillo de un color hexadecimal
 * @param {string} color - Color en formato hexadecimal (#RRGGBB)
 * @param {number} cantidad - Cantidad a ajustar (-255 a 255)
 * @returns {string} Color ajustado en formato hexadecimal
 */
function ajustarBrillo(color, cantidad) {
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    r = Math.max(0, Math.min(255, r + cantidad));
    g = Math.max(0, Math.min(255, g + cantidad));
    b = Math.max(0, Math.min(255, b + cantidad));
    
    return '#' + 
        r.toString(16).padStart(2, '0') + 
        g.toString(16).padStart(2, '0') + 
        b.toString(16).padStart(2, '0');
}


// EVENT LISTENERS


// tecla presionada
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        teclas.izquierda = true;
        usarMouse = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        teclas.derecha = true;
        usarMouse = false;
    }
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        alternarPausa();
    }
});

// tecla liberada
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        teclas.izquierda = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        teclas.derecha = false;
    }
});

// movimiento del mouse
lienzo.addEventListener('mousemove', (e) => {
    const rect = lienzo.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    usarMouse = true;
});

// mouse dentro del area del juego
lienzo.addEventListener('mouseleave', () => {
    usarMouse = false;
});

// INICIALIZACIÓN

// cargar datos guardados
function inicializar() {
    // Crear todos los elementos de la interfaz
    crearInterfaz();
    crearPantallaGameOver();
    crearPantallaVictoria();
    crearPantallaPausa();
    
    // Cargar mejor puntaje guardado
    cargarMejorPuntaje();
    
    // Intentar cargar progreso guardado
    const haProgreso = cargarProgreso();
    
    if (haProgreso) {
        const continuar = confirm('¿Continuar?');
        if (continuar) {
            crearBloques();
            reiniciarPelota();
            reiniciarPaleta();
            actualizarInterfaz();
        }
    }
}

inicializar();