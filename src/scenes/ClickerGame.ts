import { Scene } from 'phaser';

export class ClickerGame extends Scene
{
    constructor ()
    {
        super('ClickerGame');
    }

    create ()
    {
        this.score = 0;

        this.coins = [];
        // this.coins = this.physics.add.group();

        const textStyle = { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#000000', strokeThickness: 8 };

        this.add.image(512, 384, 'background');

        this.scoreText = this.add.text(32, 32, 'Coins: 0', textStyle).setDepth(1);
        this.timeText = this.add.text(1024 - 32, 32, 'Time: 10', textStyle).setOrigin(1, 0).setDepth(1);

        //  Our 10 second timer. It starts automatically when the scene is created.
        this.timer = this.time.addEvent({ delay: 30000, callback: () => this.gameOver() });

        this.physics.world.setBounds(0, -400, 1024, 768 + 310);

        for (let i = 0; i < 20; i++)
        {
            setTimeout(() => {
                this.dropCoin();
            }, i * 500); // Delay in milliseconds
        }

        this.player = this.physics.add.sprite(100, 300, 'player');
        this.player.setWidth = 1000;
        this.player.setCollideWorldBounds(true);

        // this.physics.add.overlap(player, gameObject, this.clickCoin(gameObject), null, this);

        this.cursors = this.input.keyboard.createCursorKeys();

        this.input.on('gameobjectdown', (pointer, gameObject) => this.clickCoin(gameObject));

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);

        this.inputCooldown = 0;

        
    }

    checkIfOffScreen()
    {
        for(coin in this.coins){
            if(coin.x <= 0){
                coin.destroy();
            }
        }
    }

    dropCoin ()
    {
        /*
        const x = Phaser.Math.Between(128, 896);
        const y = Phaser.Math.Between(400, 0);

        const coin = this.physics.add.sprite(x, y, 'coin').play('rotate');

        coin.setVelocityX(Phaser.Math.Between(-400, 400));
        coin.setCollideWorldBounds(true);
        coin.setBounce(0.9);
        coin.setInteractive();

        this.coins.push(coin);
        */
       //const x = Phaser.Math.Between(0, 400);
       const x = 1000;
       const y = Phaser.Math.Between(600, 150);

    const coin = this.physics.add.sprite(x, y, 'coin').play('rotate');
    coin.setScale(0.5); // Adjust the scale factor as desired
       coin.setVelocityX(-500);
       coin.setInteractive();

       this.coins.push(coin);

    //    const x = 1000;
    //    const y = 150*parseInt(Phaser.Math.Between(1, 4));

    //    //const coin = this.physics.add.sprite(x, y, 'coin').play('rotate');
    //    const coin = this.physics.add.sprite(x, y, 'coin').play('rotate');
    //    //coin.setVelocityY(Phaser.Math.Between(-400, 400));
    //    coin.setVelocityX(Phaser.Math.Between(-400, 400));

    //    coin.setCollideWorldBounds(true);
    //    //coin.setBounce(0.9);
    //    coin.setInteractive();

    //    this.coins.push(coin);
    }

    collectCoin(player, coin) {
        // Update the score or perform other actions
        //coin.play('vanish');
        coin.play('vanish');
        coin.disableBody(true, true);

        //  Add 1 to the score
        this.score++;

        //  Update the score text
        this.scoreText.setText('Coins: ' + this.score);

        //  Drop a new coin
        for (let i = 0; i < 2; i++)
        {
            setTimeout(() => {
                this.dropCoin();
            }, i * 500); // Delay in milliseconds
        }
        
    }
    
    clickCoin (coin)
    {
        //  Disable the coin from being clicked
        coin.disableInteractive();

        //  Stop it from moving
        coin.setVelocity(0, 0);

        //  Play the 'vanish' animation
        coin.play('vanish');

        coin.once('animationcomplete-vanish', () => coin.destroy());

        //  Add 1 to the score
        this.score++;

        //  Update the score text
        this.scoreText.setText('Coins: ' + this.score);

        //  Drop a new coin
        this.dropCoin();
    }

    update ()
    {
        const moveAmount = 30

        // Check for cursor key input and update player velocity accordingly
        // setTimeout(() => {
        //     console.log("Paused for 2 seconds");
        // }, 200);
        if (this.inputCooldown > 0) {
            this.inputCooldown -= 1;
        }

        if (this.inputCooldown <= 0) {
            if (this.cursors.up.isDown && this.player.y - moveAmount >= 0) {
                this.player.y -= moveAmount;
                this.inputCooldown = 5; // Set cooldown time in milliseconds
            } else if (this.cursors.down.isDown && this.player.y + moveAmount <= this.physics.world.bounds.height) {
                this.player.y += moveAmount;
                this.inputCooldown = 5; // Set cooldown time in milliseconds
            }
        }

        // this.coins.children.each(function(coin) {
        //     if (coin.x < 0 || coin.x > this.physics.world.bounds.width 
        //         || coin.y < 0 || coin.y > this.physics.world.bounds.height) {
        //         coin.destroy();
        //     }
        // }, this);

        this.timeText.setText('Time: ' + Math.ceil(this.timer.getRemainingSeconds()));
        
        //requestAnimationFrame(this.checkIfOffScreen);
    }

    keyInput ()
    {
        // if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
        //     this.player.y -= moveAmount;
        // } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
        //     this.player.y += moveAmount;
        // }
    }

    gameOver ()
    {
        this.coins.forEach((coin) => {

            if (coin.active)
            {
                coin.setVelocity(0, 0);

                coin.play('vanish');
            }

        });

        this.input.off('gameobjectdown');

        //  Save our highscore to the registry
        const highscore = this.registry.get('highscore');

        if (this.score > highscore)
        {
            this.registry.set('highscore', this.score);
        }

        //  Swap to the GameOver scene after a 2 second delay
        this.time.delayedCall(2000, () => this.scene.start('GameOver'));
    }
}
