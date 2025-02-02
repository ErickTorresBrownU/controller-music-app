import { Scene } from 'phaser';

export class MainMenu extends Scene
{
    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        //  Get the current highscore from the registry
        const score = this.registry.get('highscore');

        const textStyle = { fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff', stroke: '#000000', strokeThickness: 8 };

        this.add.image(400, 280, 'main-menu').setScale(0.65);
    

        const logo = this.add.image(400, -100, 'logo');

        this.tweens.add({
            targets: logo,
            y: 250,
            duration: 1000,
            ease: 'Bounce'
        });

        this.input.once('pointerdown', () => {

            this.scene.start('ClickerGame');

        });
    }
}
