import bulletManager from '../services/bulletManager';
import PlayerManager from '../services/playerManager';
import PositionService from '../services/positionService';
import targetManager from '../services/targetManager';

const restart = ({ seed }) => ({ ...seed, ready: true });

const decreaseHealth = (context) => PlayerManager.decreaseHealth(context);

const addTargets = (context) => ({
	targets: targetManager.addTargets(context),
});

const backGroundMovingAxis = (context) =>
	PlayerManager.backGroundMovingAxis(context);

const updateMousePosition = ({ data }) => ({
	position: {
		x: PositionService.pxToPercentage(data.clientX, data.view.innerWidth),
		y: PositionService.pxToPercentage(data.clientY, data.view.innerHeight),
	},
});

const updateFlightPosition = (context) => ({
	flight: {
		x: PositionService.limitMovement(context),
	},
});

const updateObjects = (context) => ({
	objects: PlayerManager.updateBackgroundObjects({
		...context, data: 'objects',
	}),
});
const updatePowers = (context) => ({
	powers: PlayerManager.updateBackgroundObjects({
		...context, data: 'powers',
	}),
});

const resetObjects = (context) => ({
	objects: PlayerManager.resetBackgroundObjects(context),
});

const generatePlayerBullets = (context) => ({
	bullets: bulletManager.generateBullets(context),
});

const generateEnemyBullets = (context) => ({
	bullets: bulletManager
		.generateBullets({ ...context, data: { team: 'enemy' }}),
});

const moveBullets = (context) => ({
	bullets: PlayerManager.moveBullets(context),
});

const processBullets = (context) => PlayerManager.processHits(context);

const processPowers = (context) =>
	PlayerManager.processPower(context);

const clearHitBullets = (context) => ({
	bullets: PlayerManager.removeHitBullets(context),
});
const generateObjects = (context) => ({
	objects: PlayerManager.generateObjects({
		...context, data: 'objects',
	}),
});
const generatePowers = (context) => ({
	powers: PlayerManager.generateObjects({
		...context, data: 'powers',
	}),
});
const updateScore = (context) => ({
	score: PlayerManager.updateScore(context),
});

const removeTargets = (context) => ({
	targets: PlayerManager.removeTargets(context),
});

const gameStart = ({ data }) => ({
	ready: data,
});

const setAudio = ({ data }) => ({
	audio: data,
});

const setHelp = ({ data }) => ({
	help: data,
});

const setPlayPause = ({ data }) => ({
	playPause: data,
});

const actions = {
	updateMousePosition,
	restart,
	decreaseHealth,
	backGroundMovingAxis,
	addTargets,
	updateObjects,
	resetObjects,
	generatePlayerBullets,
	moveBullets,
	updateFlightPosition,
	processBullets,
	clearHitBullets,
	updateScore,
	removeTargets,
	generateObjects,
	gameStart,
	setAudio,
	setHelp,
	setPlayPause,
	generateEnemyBullets,
	generatePowers,
	updatePowers,
	processPowers,
};

export default actions;
