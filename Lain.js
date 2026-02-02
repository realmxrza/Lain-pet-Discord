/**
 * Wired Pet: Lain 
 */

(function() {
    // --- ASSETS ---
    const SPRITES = {
        default: 'https://media.tenor.com/XLprFoJLe6kAAAAi/lain-serial-experiments-lain.gif',
        ad: 'https://media1.tenor.com/m/2EZjkce1wDoAAAAC/skip-ads.gif'
    };

    // --- STATE MANAGEMENT ---
    let state = {
        posX: 100, posY: 100,
        velX: 0, velY: 0,
        mouse: { x: 0, y: 0 },
        clone: { x: 0, y: 0, active: false },
        ad: { x: 0, y: 0, active: false },
        dragging: false,
        glitching: false,
        lastInteraction: Date.now(),
        angle: Math.random() * Math.PI * 2,
        speed: 0.5
    };

    const PHYSICS = {
        friction: 0.97,
        chaseSpeed: 10,
        safeDistance: 80, // Buffer to keep clone from touching Lain
        orbitRadius: 150
    };

    // --- DOM SETUP ---
    const createEntity = (src, zIndex, opacity = 0, isInteractive = false) => {
        const img = document.createElement('img');
        img.src = src;
        img.style.cssText = `
            position: fixed; width: 100px; 
            z-index: ${zIndex}; opacity: ${opacity};
            pointer-events: ${isInteractive ? 'auto' : 'none'};
            user-select: none; transition: transform 0.2s linear, opacity 0.5s ease;
        `;
        document.body.appendChild(img);
        return img;
    };

    const lain = createEntity(SPRITES.default, 999999, 1, true);
    lain.style.cursor = 'grab';
    lain.style.filter = 'drop-shadow(2px 4px 6px rgba(0,0,0,0.5))';

    const shadow = createEntity(SPRITES.default, 999998);
    shadow.style.filter = 'invert(1) hue-rotate(180deg) blur(1px)';

    const popUp = createEntity(SPRITES.ad, 999997);
    popUp.style.width = '120px';

    // --- BEHAVIORS ---
    function startGlitch(duration = 500) {
        state.glitching = true;
        setTimeout(() => state.glitching = false, duration);
    }

    function triggerSplit() {
        if (state.clone.active || state.dragging) return;
        state.clone.active = true;
        state.clone.x = state.posX - Math.cos(state.angle) * 300;
        state.clone.y = state.posY - Math.sin(state.angle) * 300;
        shadow.style.opacity = "0.7";

        setTimeout(() => {
            state.clone.active = false;
            shadow.style.opacity = "0";
            state.speed = 0.5;
        }, 10000);
    }

    function spawnAd() {
        if (state.ad.active || state.dragging || state.clone.active) return;
        state.ad.x = Math.random() * (window.innerWidth - 150);
        state.ad.y = Math.random() * (window.innerHeight - 150);
        state.ad.active = true;
        popUp.style.left = `${state.ad.x}px`;
        popUp.style.top = `${state.ad.y}px`;
        popUp.style.opacity = '1';
    }

    // --- INPUT HANDLING ---
    window.addEventListener('mousemove', (e) => {
        state.mouse.x = e.clientX;
        state.mouse.y = e.clientY;
        state.lastInteraction = Date.now();
    });

    window.addEventListener('keydown', () => startGlitch());

    lain.onmousedown = (e) => {
        state.dragging = true;
        state.ad.active = false;
        state.clone.active = false;
        shadow.style.opacity = "0";
        popUp.style.opacity = "0";

        let offsetX = e.clientX - state.posX;
        let offsetY = e.clientY - state.posY;

        const onDrag = (ev) => {
            const nextX = ev.clientX - offsetX;
            const nextY = ev.clientY - offsetY;
            
            // Capture movement delta for throw inertia
            state.velX = nextX - state.posX;
            state.velY = nextY - state.posY;
            
            state.posX = nextX;
            state.posY = nextY;
            updateStyle(lain, state.posX, state.posY);
        };

        const stopDrag = () => {
            state.dragging = false;
            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', stopDrag);
        };

        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', stopDrag);
    };

    // --- ENGINE ---
    function updateLogic() {
        if (state.dragging) return setTimeout(updateLogic, 1000);

        if (state.clone.active) {
            state.speed = PHYSICS.chaseSpeed;
            if (Math.random() < 0.05) state.angle += (Math.random() - 0.5) * 2;
        } 
        else if (state.ad.active) {
            const dx = state.ad.x - state.posX;
            const dy = state.ad.y - state.posY;
            state.angle = Math.atan2(dy, dx);
            state.speed = 12;

            if (Math.sqrt(dx*dx + dy*dy) < 20) {
                state.ad.active = false;
                popUp.style.opacity = '0';
                startGlitch();
            }
        } 
        else if (Date.now() - state.lastInteraction <= 60000) {
            // Only wander if not sliding from a throw
            if (Math.abs(state.velX) < 1 && Math.abs(state.velY) < 1) {
                state.angle += (Math.random() - 0.5) * 1.5;
                state.speed = Math.random() * 2 + 0.5;
                
                const roll = Math.random();
                if (roll < 0.10) triggerSplit();
                else if (roll < 0.20) spawnAd();
            }
        }

        setTimeout(updateLogic, (state.clone.active || state.ad.active) ? 50 : 2000);
    }

    function render() {
        const limitX = window.innerWidth - 100;
        const limitY = window.innerHeight - 100;

        if (!state.dragging) {
            // 1. Movement Calculations
            if (state.clone.active || state.ad.active) {
                state.posX += Math.cos(state.angle) * state.speed;
                state.posY += Math.sin(state.angle) * state.speed;

                if (state.posX <= 0 || state.posX >= limitX) state.angle = Math.PI - state.angle;
                if (state.posY <= 0 || state.posY >= limitY) state.angle = -state.angle;

                if (state.clone.active) {
                    const dx = state.posX - state.clone.x;
                    const dy = state.posY - state.clone.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const moveSpeed = dist < PHYSICS.safeDistance ? 0 : PHYSICS.chaseSpeed;
                    
                    if (dist > 5) {
                        state.clone.x += (dx/dist) * moveSpeed;
                        state.clone.y += (dy/dist) * moveSpeed;
                    }
                }
            } 
            else if (Date.now() - state.lastInteraction > 60000) {
                const time = Date.now() * 0.002;
                state.posX += (state.mouse.x + Math.cos(time) * PHYSICS.orbitRadius - 50 - state.posX) * 0.05;
                state.posY += (state.mouse.y + Math.sin(time) * PHYSICS.orbitRadius - 50 - state.posY) * 0.05;
            } 
            else {
                // Apply physics/inertia slide
                state.posX += state.velX;
                state.posY += state.velY;
                state.velX *= PHYSICS.friction;
                state.velY *= PHYSICS.friction;

                if (state.posX <= 0 || state.posX >= limitX) state.velX *= -1;
                if (state.posY <= 0 || state.posY >= limitY) state.velY *= -1;
            }

            // 2. Bounds Correction
            state.posX = Math.max(0, Math.min(state.posX, limitX));
            state.posY = Math.max(0, Math.min(state.posY, limitY));

            // 3. Visual Updates
            const lookDir = (state.clone.active || state.ad.active) ? Math.cos(state.angle) : state.velX;
            lain.style.transform = lookDir > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            lain.style.filter = state.glitching ? "invert(1) contrast(2)" : "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))";
            
            updateStyle(lain, state.posX, state.posY);

            if (state.clone.active) {
                const jitter = (Math.random() - 0.5) * 3;
                updateStyle(shadow, state.clone.x + jitter, state.clone.y + jitter);
                shadow.style.transform = (state.posX - state.clone.x) > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            }
        }

        requestAnimationFrame(render);
    }

    function updateStyle(el, x, y) {
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
    }

    updateLogic();
    render();
})();
