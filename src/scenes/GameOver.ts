import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        //  Get the current highscore from the registry
        const score = this.registry.get('highscore');

        const textStyle = { fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff', stroke: '#000000', strokeThickness: 8 };

        this.add.image(400, 280, 'main-menu').setScale(0.65);

        this.add.text(400, 150, `Game Over\n\nHigh Score: ${score}`, textStyle).setAlign('center').setOrigin(0.5);
    }
}
