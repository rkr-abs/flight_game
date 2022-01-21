import React from 'react';
import GameOverScreen from './gameOverScreen';
import PlayerManager from '../services/playerManager';
import GameScreen from './gameScreen';
import WelcomeScreen from './welcomeScreen';

const Game = (context) => {
	const { state } = context;
	const readyScreens = {
		true: PlayerManager.isAlive(context)
			? GameScreen
			: GameOverScreen,
		false: WelcomeScreen,
	};

	return (
		<div className="game" role="game">
			{ readyScreens[state.ready](context) }
		</div>
	);
};

export default Game;
