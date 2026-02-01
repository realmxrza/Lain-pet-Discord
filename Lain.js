/* * Wired Pet: Lain 
 * Authorized by: realmxrza
 */

(function() {
    const defaultSprite = 'https://media.tenor.com/XLprFoJLe6kAAAAi/lain-serial-experiments-lain.gif';
    const bearOnesie = 'https://media.tenor.com/Xqae1hr-ATwAAAAi/lain-onesie.gif';

    const lain = document.createElement('img');
    lain.src = defaultSprite;
    lain.style.cssText = `
        position: fixed; top: 100px; left: 100px; width: 100px; 
        z-index: 999999; cursor: grab; user-select: none; 
        transition: transform 0.2s linear, width 0.3s ease;
        filter: drop-shadow(2px 4px 6px rgba(0,0,0,0.5));
    `;
    document.body.appendChild(lain);

    const dialBox = document.createElement('div');
    dialBox.style.cssText = `
        position: fixed; padding: 8px 12px; background: rgba(10, 0, 20, 0.9);
        border: 1px solid #a0f; border-radius: 8px; color: #0f0;
        font-family: monospace; font-size: 12px; width: 220px;
        pointer-events: none; z-index: 1000000; opacity: 0;
        transition: opacity 0.3s; box-shadow: 0 0 10px rgba(160, 0, 255, 0.3);
    `;
    const arrow = document.createElement('div');
    arrow.style.cssText = `position: absolute; bottom: -8px; left: 20px; border-left: 8px solid transparent; border-right: 8px solid transparent; border-top: 8px solid #a0f;`;
    dialBox.appendChild(arrow);
    document.body.appendChild(dialBox);

    let posX = 100, posY = 100, velX = 0, velY = 0, mX = 0, mY = 0;
    let dragging = false, glitching = false, afkTimer = Date.now();
    let talking = false, bearMode = false;
    
    // Movement tuning
    let angle = Math.random() * Math.PI * 2;
    let speed = 0.5;
    const friction = 0.95; 

    const brain = [
        ["There is no boundary between the Wired", "and the real world."],
        "The real world isn't real at all.",
        "Why don't you come to the Wired?",
        "You are just a software application.",
        ["Rumors are a kind of medium, you know.", "They're much more fluid than data."],
        "Who is the 'real' me?",
        "No matter where you are... everyone is always connected.",
        "Present day. Present time. Hahahaha!"
    ];

    function runBearMode() {
        if (bearMode) return;
        bearMode = true;
        velX = 0; velY = 0;
        lain.style.width = "110px";
        lain.src = bearOnesie;
        setTimeout(() => {
            lain.src = defaultSprite;
            lain.style.width = "100px";
            bearMode = false;
            dialBox.style.opacity = "0";
        }, 7100);
    }

    function talk(script, index = 0) {
        if (dragging || bearMode) { talking = false; return; }
        talking = true;
        const line = Array.isArray(script) ? script[index] : script;
        dialBox.innerText = line;
        dialBox.appendChild(arrow);
        dialBox.style.opacity = "1";
        let time = Array.isArray(script) ? 3500 : 6000;
        setTimeout(() => {
            if (Array.isArray(script) && index < script.length - 1 && !dragging) {
                talk(script, index + 1);
            } else {
                dialBox.style.opacity = "0";
                talking = false;
            }
        }, time);
    }

    setInterval(() => {
        if (!dragging && !bearMode && dialBox.style.opacity === "0" && Math.random() > 0.5) {
            talk(brain[Math.floor(Math.random() * brain.length)]);
        }
    }, 45000);

    window.onmousemove = (e) => { mX = e.clientX; mY = e.clientY; afkTimer = Date.now(); };
    window.onkeydown = () => { 
        glitching = true; 
        setTimeout(() => { glitching = false; lain.style.filter = "none"; }, 500); 
    };

    // Solid Grab Implementation
    lain.onmousedown = (e) => {
        if (bearMode) return;
        dragging = true;
        talking = false;
        dialBox.style.opacity = "0";
        lain.style.cursor = 'grabbing';
        
        let offsetX = e.clientX - posX;
        let offsetY = e.clientY - posY;
        
        function onMove(ev) {
            posX = ev.clientX - offsetX;
            posY = ev.clientY - offsetY;
            // Calculate velocity for "throw" effect
            velX = ev.movementX * 0.8;
            velY = ev.movementY * 0.8;
            lain.style.left = posX + 'px';
            lain.style.top = posY + 'px';
        }

        function onUp() {
            dragging = false;
            lain.style.cursor = 'grab';
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
        }

        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    };

    // Realistic Drift Logic
    function updateLogic() {
        if (dragging || bearMode) return setTimeout(updateLogic, 500);

        if (Date.now() - afkTimer > 60000) {
            // AFK: Slowly drift toward mouse
            let dx = mX - posX;
            let dy = mY - posY;
            angle = Math.atan2(dy, dx);
            speed = Math.min(window.innerWidth / 100, 2);
        } else {
            // Organic Random Walk: Shift angle slightly over time
            angle += (Math.random() - 0.5) * 1.5; 
            speed = Math.random() * 2 + 0.5;
            
            // 10% chance to dash
            if (Math.random() < 0.1) speed = 8;
            
            // 10% chance for Bear Mode
            if (Math.random() < 0.05) runBearMode();
        }

        velX = Math.cos(angle) * speed;
        velY = Math.sin(angle) * speed;

        setTimeout(updateLogic, Math.random() * 3000 + 1000);
    }

    function render() {
        if (!dragging && !bearMode) {
            const limX = window.innerWidth - 100;
            const limY = window.innerHeight - 100;

            posX += velX;
            posY += velY;
            
            // Smooth Bounce
            if (posX <= 0 || posX >= limX) { velX *= -1; angle = Math.PI - angle; }
            if (posY <= 0 || posY >= limY) { velY *= -1; angle = -angle; }

            // Keep in bounds
            posX = Math.max(0, Math.min(posX, limX));
            posY = Math.max(0, Math.min(posY, limY));

            // Physics Decay
            velX *= friction;
            velY *= friction;

            if (Math.abs(velX) > 0.1) lain.style.transform = velX > 0 ? 'scaleX(1)' : 'scaleX(-1)';
            if (glitching) lain.style.filter = Math.random() > 0.5 ? "invert(1) hue-rotate(250deg) contrast(2)" : "none";
            
            lain.style.left = posX + 'px';
            lain.style.top = posY + 'px';
        }
        
        dialBox.style.left = (posX - 20) + 'px';
        dialBox.style.top = (posY - dialBox.offsetHeight - 15) + 'px';
        
        requestAnimationFrame(render);
    }

    updateLogic();
    render();
})();
