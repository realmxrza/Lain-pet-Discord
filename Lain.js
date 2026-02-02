(function() {
    if (window.__LAIN_PET_INITIALIZED__) return;
    window.__LAIN_PET_INITIALIZED__ = true;
    const init = () => {
        if (!document.body) {
            setTimeout(init, 100);
            return;
        }
        const SPRITES = {
            default: 'https://media.tenor.com/XLprFoJLe6kAAAAi/lain-serial-experiments-lain.gif',
            bear: 'https://media.tenor.com/Xqae1hr-ATwAAAAi/lain-onesie.gif',
            ad: 'https://media1.tenor.com/m/2EZjkce1wDoAAAAC/skip-ads.gif'
        };

        const EXTRAS = [
            'https://media.tenor.com/6OjWREBRRf0AAAAm/comment.webp',
            'https://media.tenor.com/ZKBDtqe2rkwAAAAj/flowers-cherryblossom-pink-gif-png-cute.gif',
            'https://media.tenor.com/OEPDshveEx0AAAAi/butterfly.gif',
            'https://media.tenor.com/oFs2KYe8cAUAAAAj/aw-snap.gif',
            'https://media.tenor.com/AIEsLpFUaIsAAAAj/javascript-scroll.gif'
        ];

        const BRAIN = [
            ["There is no boundary between the Wired", "and the real world."],
            "The real world isn't real at all.",
            "Why don't you come to the Wired?",
            "You are just a software application.",
            ["Rumors are a kind of medium, you know.", "They're much more fluid than data."],
            "Who is the 'real' me?",
            "No matter where you are... everyone is always connected.",
            "Present day. Present time. Hahahaha!"
        ];

        let state = {
            posX: 100, posY: 100,
            velX: 0, velY: 0,
            mouse: { x: 0, y: 0 },
            clone: { x: 0, y: 0, active: false },
            ad: { x: 0, y: 0, active: false },
            dragging: false, glitching: false,
            bearMode: false, talking: false,
            sugarRush: false,
            lastInteraction: Date.now(),
            angle: Math.random() * Math.PI * 2,
            speed: 0.5
        };

        const PHYSICS = {
            friction: 0.95,
            chaseSpeed: 10,
            escapeSpeed: 14,
            sugarSpeed: 18,
            safeDistance: 65,
            orbitRadius: 150
        };

        const dialBox = document.createElement('div');
        dialBox.style.cssText = `
            position: fixed; padding: 8px 12px; background: rgba(10, 0, 20, 0.9);
            border: 1px solid #a0f; border-radius: 8px; color: #0f0;
            font-family: monospace; font-size: 12px; width: 220px;
            pointer-events: none; z-index: 1000000; opacity: 0;
            transition: opacity 0.3s; box-shadow: 0 0 10px rgba(160, 0, 255, 0.3);
        `;
        document.body.appendChild(dialBox);

        const createEntity = (src, zIndex, opacity = 0, isInteractive = false) => {
            const img = document.createElement('img');
            img.src = src;
            img.style.cssText = `
                position: fixed; width: 100px; z-index: ${zIndex}; opacity: ${opacity};
                pointer-events: ${isInteractive ? 'auto' : 'none'};
                user-select: none; transition: transform 0.2s linear, opacity 0.5s ease;
                left: 0; top: 0;
            `;
            document.body.appendChild(img);
            return img;
        };

        const lain = createEntity(SPRITES.default, 999999, 1, true);
        lain.style.cursor = 'grab';
        const shadow = createEntity(SPRITES.default, 999998);
        shadow.style.filter = 'invert(1) hue-rotate(180deg) blur(1px)';
        const popUp = createEntity(SPRITES.ad, 999997);
        popUp.style.width = '120px';
        const extraIcon = createEntity('', 1000001); 
        extraIcon.style.width = '50px';

        function talk(script, index = 0) {
            if (state.dragging || state.bearMode || state.sugarRush) { state.talking = false; dialBox.style.opacity = "0"; return; }
            state.talking = true;
            const line = Array.isArray(script) ? script[index] : script;
            dialBox.innerText = line;
            dialBox.style.opacity = "1";
            let time = Array.isArray(script) ? 3500 : 6000;
            setTimeout(() => {
                if (Array.isArray(script) && index < script.length - 1 && !state.dragging) {
                    talk(script, index + 1);
                } else {
                    dialBox.style.opacity = "0";
                    state.talking = false;
                }
            }, time);
        }

        function showExtra() {
            if (extraIcon.style.opacity === "1") return;
            extraIcon.src = EXTRAS[Math.floor(Math.random() * EXTRAS.length)];
            extraIcon.style.opacity = "1";
            setTimeout(() => { extraIcon.style.opacity = "0"; }, 5000);
        }

        function runBearMode() {
            if (state.bearMode || state.dragging || state.sugarRush) return;
            state.bearMode = true;
            state.velX = 0; state.velY = 0;
            lain.src = SPRITES.bear;
            lain.style.width = "200px";
            setTimeout(() => {
                lain.src = SPRITES.default;
                lain.style.width = "100px";
                state.bearMode = false;
            }, 7100);
        }

        function triggerSugarRush() {
            if (state.sugarRush || state.dragging) return;
            state.sugarRush = true;
            state.speed = PHYSICS.sugarSpeed;
            state.angle = Math.random() * Math.PI * 2;
            setTimeout(() => {
                state.sugarRush = false;
                state.speed = 0.5;
                state.glitching = false;
            }, 8000);
        }

        window.addEventListener('mousemove', (e) => {
            state.mouse.x = e.clientX; state.mouse.y = e.clientY;
            state.lastInteraction = Date.now();
        });

        window.addEventListener('keydown', (e) => {
            if (e.key.toLowerCase() === 'b') runBearMode();
            state.glitching = true;
            setTimeout(() => state.glitching = false, 500);
        });

        lain.onmousedown = (e) => {
            if (state.bearMode) return;
            state.dragging = true;
            state.ad.active = false;
            state.clone.active = false;
            state.sugarRush = false;
            shadow.style.opacity = "0";
            popUp.style.opacity = "0";
            dialBox.style.opacity = "0";
            extraIcon.style.opacity = "0";
            let offsetX = e.clientX - state.posX;
            let offsetY = e.clientY - state.posY;
            const onDrag = (ev) => {
                const nextX = ev.clientX - offsetX;
                const nextY = ev.clientY - offsetY;
                state.velX = ev.movementX * 0.8;
                state.velY = ev.movementY * 0.8;
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

        function updateLogic() {
            if (state.dragging || state.bearMode) return setTimeout(updateLogic, 1000);

            if (state.sugarRush) {
                state.speed = PHYSICS.sugarSpeed;
            }
            else if (state.clone.active) {
                
                const dx = state.posX - state.clone.x;
                const dy = state.posY - state.clone.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                
                if (dist < 150) {
                    state.angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
                    state.speed = PHYSICS.escapeSpeed;
                } else {
                    state.speed = PHYSICS.chaseSpeed;
                }
            } 
            else if (state.ad.active) {
                const dx = state.ad.x - state.posX;
                const dy = state.ad.y - state.posY;
                state.angle = Math.atan2(dy, dx);
                state.speed = 12;
                if (Math.sqrt(dx*dx + dy*dy) < 30) {
                    state.ad.active = false;
                    popUp.style.opacity = '0';
                    state.glitching = true;
                    setTimeout(() => state.glitching = false, 500);
                }
            } 
            else if (Date.now() - state.lastInteraction <= 60000) {
                if (Math.abs(state.velX) < 0.5 && Math.abs(state.velY) < 0.5) {
                    state.angle += (Math.random() - 0.5) * 1.5;
                    state.speed = Math.random() * 2 + 0.5;
                    state.velX = Math.cos(state.angle) * state.speed;
                    state.velY = Math.sin(state.angle) * state.speed;

                    const roll = Math.random();
                    if (roll < 0.05) { 
                        if (!state.talking) talk(BRAIN[Math.floor(Math.random() * BRAIN.length)]);
                    } else if (roll < 0.10) {
                        state.clone.active = true;

                        const spawnAngle = Math.random() * Math.PI * 2;
                        state.clone.x = state.posX + Math.cos(spawnAngle) * 400;
                        state.clone.y = state.posY + Math.sin(spawnAngle) * 400;
                        shadow.style.opacity = "0.7";
                        setTimeout(() => { state.clone.active = false; shadow.style.opacity = "0"; }, 10000);
                    } else if (roll < 0.15) {
                        state.ad.x = Math.random() * (window.innerWidth - 150);
                        state.ad.y = Math.random() * (window.innerHeight - 150);
                        state.ad.active = true;
                        popUp.style.left = `${state.ad.x}px`;
                        popUp.style.top = `${state.ad.y}px`;
                        popUp.style.opacity = '1';
                    } else if (roll < 0.18) {
                        triggerSugarRush();
                    } else if (roll < 0.22) {
                        runBearMode();
                    } else if (roll < 0.37) {
                        showExtra();
                    }
                }
            }
            setTimeout(updateLogic, (state.clone.active || state.ad.active || state.sugarRush) ? 50 : 2000);
        }

        function render() {
            const curW = state.bearMode ? 200 : 100;
            const limitX = window.innerWidth - curW;
            const limitY = window.innerHeight - curW;

            if (!state.dragging) {
                if (state.bearMode) { /* static */ }
                else if (state.clone.active || state.ad.active || state.sugarRush) {
                    state.posX += Math.cos(state.angle) * state.speed;
                    state.posY += Math.sin(state.angle) * state.speed;
                    if (state.posX <= 0 || state.posX >= limitX) {
                        state.angle = Math.PI - state.angle;
                        if (state.sugarRush) state.glitching = true;
                    }
                    if (state.posY <= 0 || state.posY >= limitY) {
                        state.angle = -state.angle;
                        if (state.sugarRush) state.glitching = true;
                    }
                } 
                else if (Date.now() - state.lastInteraction > 60000) {
                    const time = Date.now() * 0.002;
                    state.posX += (state.mouse.x + Math.cos(time) * PHYSICS.orbitRadius - (curW/2) - state.posX) * 0.05;
                    state.posY += (state.mouse.y + Math.sin(time) * PHYSICS.orbitRadius - (curW/2) - state.posY) * 0.05;
                } 
                else {
                    state.posX += state.velX;
                    state.posY += state.velY;
                    state.velX *= PHYSICS.friction;
                    state.velY *= PHYSICS.friction;
                    if (state.posX <= 0 || state.posX >= limitX) state.velX *= -1;
                    if (state.posY <= 0 || state.posY >= limitY) state.velY *= -1;
                }

                state.posX = Math.max(0, Math.min(state.posX, limitX));
                state.posY = Math.max(0, Math.min(state.posY, limitY));

                const lookDir = (state.clone.active || state.ad.active || state.sugarRush) ? Math.cos(state.angle) : state.velX;
                if (Math.abs(lookDir) > 0.1) {
                    lain.style.transform = lookDir > 0 ? 'scaleX(1)' : 'scaleX(-1)';
                }
                
                if (state.sugarRush) {
                    const hue = (Date.now() % 1000) / 1000 * 360;
                    lain.style.filter = `hue-rotate(${hue}deg) brightness(1.5) drop-shadow(0 0 10px #fff)`;
                } else {
                    lain.style.filter = state.glitching ? "invert(1) hue-rotate(250deg) contrast(2)" : "drop-shadow(2px 4px 6px rgba(0,0,0,0.5))";
                }
                
                updateStyle(lain, state.posX, state.posY);

                const centerX = state.posX + (curW / 2);
                extraIcon.style.left = (centerX - 25) + 'px';
                extraIcon.style.top = (state.posY - 60) + 'px';
                dialBox.style.left = (state.posX - 20) + 'px';
                dialBox.style.top = (state.posY - dialBox.offsetHeight - 15) + 'px';

                if (state.clone.active) {
                    const dx = state.posX - state.clone.x;
                    const dy = state.posY - state.clone.y;
                    const dist = Math.sqrt(dx*dx + dy*dy);
                    const move = dist < PHYSICS.safeDistance ? 0 : PHYSICS.chaseSpeed;
                    if (dist > 5) {
                        state.clone.x += (dx/dist) * move;
                        state.clone.y += (dy/dist) * move;
                    }
                    updateStyle(shadow, state.clone.x, state.clone.y);
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
    };
    init();
})();
