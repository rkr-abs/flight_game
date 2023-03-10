import * as random from '@laufire/utils/random';
import positionService from './positionService';
import config from '../core/config';

describe('PositionService', () => {
	const {
		limitMovement,
		pxToPercentage,
		getRandomValue,
		isPointInRect,
		getAllPoints,
		threeDProject,
		getHealthProps,
		getBulletPosition,
	} = positionService;
	const twentyFive = 25;
	const hundred = 100;
	const two = 2;
	const innerWidth = 1000;
	const thousand = 1000;
	const returnValue = Symbol('returnValue');
	const x = random.rndBetween(twentyFive, hundred);
	const y = random.rndBetween(twentyFive, hundred);
	const width = random.rndBetween(twentyFive, hundred);
	const height = random.rndBetween(twentyFive, hundred);

	describe('getBulletPosition', () => {
		test('getBulletPosition', () => {
			const state = {
				flight: {
					x: 50,
					width: 80,
				},
			};

			const flightQuarter = state.flight.width / config.quad;
			const context = { state, config };

			jest.spyOn(random, 'rndBetween').mockReturnValue(returnValue);

			const result = getBulletPosition(context);
			const expected = returnValue;

			expect(random.rndBetween)
				.toHaveBeenCalledWith(state.flight.x - flightQuarter,
					state.flight.x + flightQuarter);
			expect(result).toEqual(expected);
		});
	});
	test('limitMovement returns value greater than or equal to 0', () => {
		jest.spyOn(Math, 'max').mockReturnValue(returnValue);
		jest.spyOn(Math, 'min').mockReturnValue(returnValue);

		const context = { state: { flight: { width }, position: { x }}};

		const result = limitMovement(context);

		expect(Math.max)
			.toHaveBeenCalledWith(context.state.position.x,
				context.state.flight.width / two);
		expect(Math.min)
			.toHaveBeenCalledWith(hundred - (width / two), returnValue);
		expect(result).toEqual(returnValue);
	});

	test('returns value converted from px to percentage', () => {
		for(let i = 0; i <= thousand; i++) {
			const xpx = Math.floor(Math.random() * innerWidth);
			const result = pxToPercentage(xpx, innerWidth);

			expect(result).toBeLessThanOrEqual(hundred);
		}
	});

	test('get random value for height and width', () => {
		const data = random.rndBetween(twentyFive, hundred);
		const min = data / two;
		const max = hundred - min;

		jest.spyOn(random, 'rndBetween').mockReturnValue(returnValue);

		const result = getRandomValue(data);

		expect(random.rndBetween).toHaveBeenCalledWith(min, max);
		expect(result).toEqual(returnValue);
	});

	describe('isPointInRect', () => {
		const bulletPoints = [
			{ x: 52, y: 63 },
			{ x: 111, y: 125 },
			{ x: 110, y: 125 },
		];

		const targetsValue = {
			topLeft: { x: 10, y: 15 },
			bottomRight: { x: 110, y: 125 },
		};

		const expectations = [
			[bulletPoints[0], true],
			[bulletPoints[1], false],
			[bulletPoints[2], true],
		];

		test.each(expectations)('isPointInRect %p',
			(bulletPoint, isHit) => {
				const result = isPointInRect(bulletPoint, targetsValue);

				expect(result).toEqual(isHit);
			});
	});
	test('getAllPoints', () => {
		const rect = { x, y, height };
		const expectation = {
			topLeft: {
				x: x - (width / two),
				y: y - (height / two),
			},
			bottomRight: {
				x: x + (width / two),
				y: y + (height / two),
			},
		};
		const result = getAllPoints({ ...rect, width });

		expect(result).toMatchObject(expectation);
	});
	test('ThreeDProject', () => {
		const z = config.threeDProjectY;
		const data = { x, y, z, width, height };
		const viewport = {
			width: random.rndBetween(1, twentyFive),
			height: random.rndBetween(1, twentyFive),
		};
		const context = { config, data, viewport };

		const result = threeDProject(context);

		const expectation = {
			x: Math.round((result.x + (viewport.width / two))
					* (hundred / viewport.width)),
			y: Math.round((result.z + (viewport.height / two))
					* (hundred / viewport.height)),
			z: config.threeDProjectY,
			width: Math.round(result.width * hundred / viewport.width),
			height: Math.round(result.height * hundred / viewport.height),
		};

		expect(data).toEqual(expectation);
	});

	test('getHealthProps', () => {
		const state = { health: random.rndBetween(1, twentyFive) };
		const data = { width: random.rndBetween(1, twentyFive) };
		const mockConfig = {
			health: random.rndBetween(1, twentyFive),
		};
		const context = { state: state, config: mockConfig, data: data };

		const result = getHealthProps(context);

		expect(result.width - (result.XPosition * two))
			.toEqual(data.width);
		expect(result.width * mockConfig.health / state.health)
			.toEqual(data.width);
	});
});
