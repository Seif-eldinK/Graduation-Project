function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

// when document is ready
document.addEventListener("DOMContentLoaded", function() {
    // resize canvas to fit window
    const canvas = document.getElementById("animated-background");
    const header = document.getElementsByTagName("header");
    let header_height = header[0].offsetHeight;
    const width = canvas.width = window.innerWidth;
    const height = canvas.height = window.innerHeight - header_height;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#cfcfff";
    ctx.fillRect(0, 0, width, height);


    class Diamond {
        constructor(x, y, velocity_x, velocity_y, color, size, angle, rotation_speed) {
            this.x = x;
            this.y = y;
            this.velocity_x = velocity_x;
            this.velocity_y = velocity_y;
            this.color = color;
            this.size = size;
            this.width = 280 * this.size;
            this.height = 260 * this.size;
            this.angle = degToRad(angle);
            this.rotation_speed = rotation_speed;
            // this.colors = ["#0202cf", "#407ff5", "#77a2f2"];
            this.colors = ["#0202cf", "#569cff", "#2f87ff"];
        }

        draw() {
            ctx.save();
            // move the origin to the center of the diamond
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            // rotate the diamond
            ctx.rotate(this.angle);
            // move the diamond back
            ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));

            ctx.fillStyle = this.colors[0];
            ctx.fillRect(this.x + 65 * this.size, this.y + 0 * this.size, 150 * this.size, 100 * this.size);

            ctx.fillStyle = this.colors[1];
            ctx.beginPath();
            ctx.moveTo(this.x + 0 * this.size, this.y + 85 * this.size);
            ctx.lineTo(this.x + 65 * this.size, this.y + 0 * this.size);
            ctx.lineTo(this.x + 65 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 140 * this.size, this.y + 0 * this.size);
            ctx.lineTo(this.x + 215 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 215 * this.size, this.y + 0 * this.size);
            ctx.lineTo(this.x + 280 * this.size, this.y + 85 * this.size);
            ctx.lineTo(this.x + 215 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 65 * this.size, this.y + 100 * this.size);
            ctx.moveTo(this.x + 0 * this.size, this.y + 85 * this.size);
            ctx.fill();

            ctx.fillStyle = this.colors[0];
            ctx.beginPath();
            ctx.moveTo(this.x + 0 * this.size, this.y + 85 * this.size);
            ctx.lineTo(this.x + 65 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 215 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 280 * this.size, this.y + 85 * this.size);
            ctx.lineTo(this.x + 140 * this.size, this.y + 260 * this.size);
            ctx.moveTo(this.x + 0 * this.size, this.y + 85 * this.size);
            ctx.fill();

            ctx.fillStyle = this.colors[2];
            ctx.beginPath();
            ctx.lineTo(this.x + 65 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 215 * this.size, this.y + 100 * this.size);
            ctx.lineTo(this.x + 140 * this.size, this.y + 260 * this.size);
            ctx.moveTo(this.x + 65 * this.size, this.y + 100 * this.size);
            ctx.fill();
            ctx.restore();
        }

        update() {
            // respawn on new random position after full exit from canvas
            if (this.x + this.width < 0 || this.x > width || this.y + this.height < 0 || this.y > height) {
                this.x = Math.random() * width;
                this.y = Math.random() * height;

                this.velocity_x = Math.random() * 5 - 2.5;
                this.velocity_y = Math.random() * 5 - 2.5;
            }

            // move
            this.x += this.velocity_x;
            this.y += this.velocity_y;

            // rotate
            this.angle += degToRad(this.rotation_speed);
        }
    }

    let diamonds = [];
    for (let i = 0; i < 10; i++) {
        // x and y coordinates
        let x = Math.random() * width;
        let y = Math.random() * height;
        // velocity_x and velocity_y
        let velocity_x = Math.random() * 5 - 2.5;
        let velocity_y = Math.random() * 5 - 2.5;
        // color
        let color = Math.random() * 360;
        // size
        let size = Math.random() * 0.1 + 0.05;
        // angle
        let angle = Math.random() * 360;
        // rotation_speed
        let rotation_speed = Math.random() * 4 - 2;

        diamonds.push(new Diamond(x, y, velocity_x, velocity_y, color, size, angle, rotation_speed));
    }

    // animate
    function loop() {
        ctx.fillStyle = "#cfcfff";
        ctx.fillRect(0, 0, width, height);
        for (let i = 0; i < diamonds.length; i++) {
            diamonds[i].draw();
            diamonds[i].update();
        }
        requestAnimationFrame(loop);
    }

    loop();
});
