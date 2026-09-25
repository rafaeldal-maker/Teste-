const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

// Configuração da Bola
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: 5,
    velocityX: 5,
    velocityY: 5,
    color: "WHITE"
};

// Raquete do Jogador (Esquerda)
const player = {
    x: 10,
    y: canvas.height / 2 - 40,
    width: 10,
    height: 80,
    score: 0,
    color: "WHITE"
};

// Raquete do Oponente / IA (Direita)
const ai = {
    x: canvas.width - 20,
    y: canvas.height / 2 - 40,
    width: 10,
    height: 80,
    score: 0,
    color: "WHITE"
};

// Desenhar Retângulos (Raquetes)
function drawRect(x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
}

// Desenhar Círculo (Bola)
function drawCircle(x, y, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
}

// Desenhar Texto (Placar)
function drawText(text, x, y, color) {
    ctx.fillStyle = color;
    ctx.font = "45px 'Courier New'";
    ctx.fillText(text, x, y);
}

// Desenhar Linha Central Pontilhada
function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRect(canvas.width / 2 - 1, i, 2, 10, "WHITE");
    }
}

// Controle do Jogador pelo Teclado
let upPressed = false;
let downPressed = false;

window.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") {
        upPressed = true;
    } else if (e.key === "ArrowDown") {
        downPressed = true;
    }
});

window.addEventListener("keyup", (e) => {
    if (e.key === "ArrowUp") {
        upPressed = false;
    } else if (e.key === "ArrowDown") {
        downPressed = false;
    }
});

function movePlayer() {
    if (upPressed && player.y > 0) {
        player.y -= 6;
    } else if (downPressed && player.y < canvas.height - player.height) {
        player.y += 6;
    }
}

// Detecção de Colisão entre Bola e Raquete
function collision(b, r) {
    b.top = b.y - b.radius;
    b.bottom = b.y + b.radius;
    b.left = b.x - b.radius;
    b.right = b.x + b.radius;

    r.top = r.y;
    r.bottom = r.y + r.height;
    r.left = r.x;
    r.right = r.x + r.width;

    return b.right > r.left && b.bottom > r.top && b.left < r.right && b.top < r.bottom;
}

// Resetar a Bola após um Ponto
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.velocityX = -ball.velocityX;
    ball.speed = 5;
}

// Atualizar Posições e Lógica do Jogo
function update() {
    // Movimento da raquete do jogador
    movePlayer();

    // Movimento da IA (Oponente) com velocidade ajustada
    let aiSpeed = 0.08; // Quanto menor, mais fácil; quanto maior, mais difícil
    ai.y += (ball.y - (ai.y + ai.height / 2)) * aiSpeed;

    // Limites da IA na tela
    if (ai.y < 0) ai.y = 0;
    if (ai.y > canvas.height - ai.height) ai.y = canvas.height - ai.height;

    // Movimento da Bola
    ball.x += ball.velocityX;
    ball.y += ball.velocityY;

    // Colisão com as paredes superior e inferior
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    // Determinar qual raquete a bola vai colidir
    let activePaddle = (ball.x < canvas.width / 2) ? player : ai;

    if (collision(ball, activePaddle)) {
        // Calcular onde a bola bateu na raquete (efeito de ângulo)
        let collidePoint = ball.y - (activePaddle.y + activePaddle.height / 2);
        collidePoint = collidePoint / (activePaddle.height / 2);

        // Ângulo de deflexão em radianos (máximo de 45 graus)
        let angleRad = (Math.PI / 4) * collidePoint;

        // Mudar direção X da bola dependendo de quem rebateu
        let direction = (ball.x < canvas.width / 2) ? 1 : -1;

        ball.velocityX = direction * ball.speed * Math.cos(angleRad);
        ball.velocityY = ball.speed * Math.sin(angleRad);

        // Aumentar a velocidade levemente a cada rebatida
        ball.speed += 0.4;
    }

    // Atualizar Pontuação
    if (ball.x - ball.radius < 0) {
        ai.score++;
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        player.score++;
        resetBall();
    }
}

// Renderizar Elementos na Tela
function render() {
    // Limpar o Canvas
    drawRect(0, 0, canvas.width, canvas.height, "BLACK");

    // Desenhar a linha central
    drawNet();

    // Desenhar Placares
    drawText(player.score, canvas.width / 4, canvas.height / 5, "WHITE");
    drawText(ai.score, 3 * canvas.width / 4, canvas.height / 5, "WHITE");

    // Desenhar Raquetes
    drawRect(player.x, player.y, player.width, player.height, player.color);
    drawRect(ai.x, ai.y, ai.width, ai.height, ai.color);

    // Desenhar Bola
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

// Loop Principal do Jogo
function gameLoop() {
    update();
    render();
}

// Rodar o jogo a ~60 quadros por segundo
const fps = 60;
setInterval(gameLoop, 1000 / fps);