import { Scene } from 'phaser';

export class ClickerGame extends Scene {
    private score: number;
    private coins: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[];
    private scoreText: Phaser.GameObjects.Text;
    private timeText: Phaser.GameObjects.Text;
    private timer: Phaser.Time.TimerEvent;
    private player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private inputCooldown: number;
    private moveSpeed: number; // Movement speed
    private background: Phaser.GameObjects.TileSprite;
    private clef: Phaser.GameObjects.Sprite;
    private gameRunning: boolean;

    constructor() {
        super('ClickerGame');
    }

    create() {
        this.score = 0;
        this.coins = [];
        this.moveSpeed = 300; // Increased movement speed for better feel

        const textStyle = { fontFamily: 'Storybook', fontSize: 55, color: '#ffffff', stroke: '#ff4500', strokeThickness: 8 };
        this.add.image(512, 384, 'background');

        this.background = this.add.tileSprite(512, 384, 1024, 768, 'background');

        this.scoreText = this.add.text(32, 32, 'Coins: 0', textStyle).setDepth(1);
        this.timeText = this.add.text(1024 - 32, 32, 'Time: 10', textStyle).setOrigin(1, 0).setDepth(1);

        this.timer = this.time.addEvent({ delay: 30000, callback: () => this.gameOver() });

        this.physics.world.setBounds(0, -400, 1024, 768 + 310);

        this.player = this.physics.add.sprite(100, 300, 'player');
        this.player.setScale(2);
        this.player.width = 1000;
        this.player.setCollideWorldBounds(true);
        this.player.setDragY(600); // 🌟 Set drag for smooth stopping

        this.clef = this.add.sprite(80, 415, 'clef-note');
        this.clef.setScale(1.5, 1.5)

        this.cursors = this.input.keyboard.createCursorKeys();
        this.inputCooldown = 0;

        const INITIAL_COIN_SPAWN_COUNT = 20;
        for (let i = 0; i < INITIAL_COIN_SPAWN_COUNT; i++) {
            setTimeout(() => {
                this.dropCoin();
            }, i * 500)
        }

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    }

    /** Moves the player up using velocity */
    moveUp() {
        console.log("Moving Up");
        this.player.setVelocityY(-this.moveSpeed);
    }

    /** Moves the player down using velocity */
    moveDown() {
        console.log("Moving Down");
        this.player.setVelocityY(this.moveSpeed);
    }

    /** Smoothly stops the player by letting drag slow it down */
    stopMoving() {
        console.log("Slowing Down...");
        this.player.setAccelerationY(0); // Remove any acceleration
        // 🌟 Instead of setting velocity to 0, let `dragY` gradually reduce speed
    }

    dropCoin() {
        if (!this.gameRunning) return;

        const x = 1000;
        const y = Phaser.Math.Between(600, 150);

        const coin = this.physics.add.sprite(x, y, 'coin').play('rotate');
        coin.setScale(0.5); // Adjust the scale factor as desired
        coin.setVelocityX(-500);
        coin.setInteractive();

        this.coins.push(coin);
    }

    collectCoin(player, coin) {
        coin.disableBody(true, true);
        this.score++;
        this.scoreText.setText('Coins: ' + this.score);

        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                this.dropCoin();
            }, i * 500);
        }
    }

    // clickCoin(coin) {
    //     coin.disableInteractive();
    //     coin.setVelocity(0, 0);
    //     coin.play('vanish');
    //     coin.once('animationcomplete-vanish', () => coin.destroy());
    //     this.score++;
    //     this.scoreText.setText('Coins: ' + this.score);
    //     this.dropCoin();
    // }

    /** Update function to process input */
    update() {
        if (this.inputCooldown > 0) {
            this.inputCooldown -= 1;
        }

        // Process movement only if cooldown allows
        if (this.inputCooldown <= 0) {
            if (this.cursors.up.isDown) {
                this.moveUp();
            } else if (this.cursors.down.isDown) {
                this.moveDown();
            } else {
                this.stopMoving(); // 🌟 Now slows down instead of stopping instantly
            }

            this.inputCooldown = 5; // Prevents input spam
        }

        this.timeText.setText('Time: ' + Math.ceil(this.timer.getRemainingSeconds()));

        this.background.tilePositionX += 1;
    }

    gameOver() {
        this.gameRunning = false;

        this.coins.forEach((coin) => {
            if (coin.active) {
                coin.setVelocity(0, 0);
                coin.play('vanish');
            }
        });

        this.input.off('gameobjectdown');

        const highscore = this.registry.get('highscore');
        if (this.score > highscore) {
            this.registry.set('highscore', this.score);
        }

        this.time.delayedCall(2000, () => this.scene.start('GameOver'));
    }
}
