# Wired Pet: Lain
by realmxrza

Interactive physics-based desktop pet of Lain Iwakura. This script implements organic movement, momentum-based dragging, and a random Bear Lain for the Discord client. It also randomly talks on a text box.

### ( TEMPORARY )
1. Press `Ctrl` + `Shift` + `I` to open Developer Tools.
2. Go to the **Console** tab.
3. If it is your first time, type `allow pasting` and press `Enter`.
4. Copy the code from `Lain.js`.
5. Paste it into the console.
6. Hit `Enter`.

### ( VENCORD PRELOAD )
1. Press `Win` + `R` on your keyboard.
2. Paste `%appdata%\Vencord` and press `Enter`.
3. Open the `dist` folder.
4. Place your `Lain.js` file inside this folder.
5. Open `preload.js` with Notepad or a code editor.
6. Scroll to the very bottom and paste the following line:
   `require("./Lain.js");`
7. Save the file and restart Discord.

### Overview
* **Bear Lain:** A 10% chance during any update cycle to trigger the onesie transformation. Duration is fixed at 7.1 seconds with a 10% scale increase.
* **Wired Glitch:** Keyboard listeners trigger a CSS filter inversion and hue-rotation to simulate digital interference.
* **Idle Tracking:** Entity enters AFK mode after 60 seconds of mouse inactivity, drifting toward the last known cursor coordinates.
