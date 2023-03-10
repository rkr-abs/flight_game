/* eslint-disable max-lines */
import PositionService from './positionService';
import PlayerManager from './playerManager';
import config from '../core/config';
import * as collection from '@laufire/utils/collection';
import { random } from '@laufire/utils';
import * as helperService from './helperService';
import { rndBetween } from '@laufire/utils/lib';
import helper from '../testHelper/helper';
import * as timeService from './ticker/timeService';

describe('PlayerManager', () => {
	const { isAlive, decreaseHealth, backGroundMovingAxis,
		updateBackgroundObjects, resetBackgroundObjects, moveBullets,
		detectBulletHit, removeHitBullets,
		generateObjects, createObjects, removeTargets,
		isBulletHit, calDamage, detectOverLapping, filterTeamBullets
		, collectHits, updateHealth, processHits, activatePower,
		filterBullet, updateScore, getObjects, processPower,
		removePowers, collectEachHits, collectPowerHits } = PlayerManager;
	const { range, secure, keys } = collection;
	const hundred = 100;
	const two = 2;
	const four = 4;
	const ten = 10;
	const returnValue = Symbol('returnValue');
	const rndRange = secure(range(0, random.rndBetween(1, ten)));

	describe('isAlive', () => {
		const expectations = [
			['less than', false, 0],
			['greater than', true, 1],
		];

		test.each(expectations)('when the health is %p 0 isAlive return %p',
			(
				dummy, expected, health
			) => {
				const result = isAlive({ state: { health }});

				expect(result).toEqual(expected);
			});
	});
	describe('Decrease Health', () => {
		const state = {
			health: 100,
		};

		test('decrease Health', () => {
			const result = decreaseHealth({ state, config });
			const expectation = {
				health: state.health - config.damage,
			};

			expect(result).toEqual(expectation);
		});
	});

	test('backGroundMovingAxis', () => {
		const state = {
			bgnScreenY: 0,
		};
		const result = backGroundMovingAxis({ state, config });
		const expectation = {
			bgnScreenY:
			(state.bgnScreenY + config.bgnScreenYIncre) % hundred,
		};

		expect(result).toEqual(expectation);
	});

	describe('removeHitBullets test', () => {
		const state = {
			bullets: [{
				id: 320,
				isHit: true,
			},
			{
				id: 201,
				isHit: false,
			}],
		};

		test('Test removeHitBullets', () => {
			const result = removeHitBullets({ state });

			const expectation = [{
				id: 201,
				isHit: false,
			}];

			expect(result).toMatchObject(expectation);
		});
	});

	describe('moveBullets', () => {
		test('moveBullets decrease yPos', () => {
			const team = 'player';
			const state = {
				bullets: [{
					y: 100,
					team: team,
				}],
			};
			const expected = [{
				y: 95,
				team: team,
			}];
			const result = moveBullets({ state, config });

			expect(result).toEqual(expected);
		});

		test('moveBullets increase yPos', () => {
			const team = 'enemy';
			const state = {
				bullets: [{
					y: 100,
					team: team,
				}],
			};
			const expected = [{
				y: 105,
				team: team,
			}];
			const result = moveBullets({ state, config });

			expect(result).toEqual(expected);
		});
	});

	test('detectBulletHit', () => {
		const targets = Symbol('targets');
		const bullets = [
			{ id: 14569,
				isHit: true },
		];
		const state = {
			targets, bullets,
		};
		const expectation = [
			{ id: 14569,
				isHit: returnValue },
		];

		jest.spyOn(PlayerManager, 'isBulletHit')
			.mockReturnValue(returnValue);

		const result = detectBulletHit({ state });

		expect(result).toMatchObject(expectation);
		expect(PlayerManager.isBulletHit)
			.toHaveBeenCalledWith(targets, bullets[0]);
	});

	describe('isBulletHit', () => {
		const target = Symbol('targetValue');
		const bullet = Symbol('bulletValue');

		const expectations = [
			[false, undefined],
			[true, bullet],
		];

		test.each(expectations)('isBulletHit %p',
			(expected, detectOverlap) => {
				jest.spyOn(PlayerManager, 'detectOverLapping')
					.mockReturnValue(detectOverlap);
				jest.spyOn(PositionService, 'getAllPoints')
					.mockReturnValueOnce(bullet)
					.mockReturnValue(target);

				const result = isBulletHit(bullet, target);

				expect(PlayerManager.detectOverLapping)
					.toHaveBeenCalledWith(bullet, target);
				[bullet, target].map((data) =>
					expect(PositionService.getAllPoints)
						.toHaveBeenCalledWith(data));

				expect(result).toEqual(expected);
			});
	});

	test('calDamage', () => {
		const target = { health: random.rndBetween(0, ten) };
		const bullets = secure(rndRange.map((data) => ({ damage: data })));

		let sum = 0;

		bullets.forEach((bullet) => {
			sum += bullet.damage;
		});

		const expectation = Math.max(target.health - sum, 0);

		const result = calDamage(target, bullets);

		expect(result).toEqual(expectation);
	});

	describe('detectOverLapping', () => {
		const bulletValue = Symbol('bulletValue');
		const targetValue = Symbol('targetValue');
		const expectations = [
			[false, undefined],
			[true, bulletValue],
		];

		const bullet = { bulletValue };
		const target = { targetValue };

		test.each(expectations)('detectOverLapping %p',
			(returnFlag, expected) => {
				jest.spyOn(PositionService, 'isPointInRect')
					.mockReturnValue(returnFlag);

				const result = detectOverLapping(bullet, target);

				expect(result).toEqual(expected);
				expect(PositionService.isPointInRect)
					.toHaveBeenCalledWith(bulletValue, target);
			});
	});

	describe('collectHits', () => {
		const flights = {
			enemy: secure(rndRange.map((data) => ({ id: data }))),
			player: secure(rndRange.map((data) => ({ id: data }))),
		};
		const bullets = Symbol('bullets');

		test('enemy hits', () => {
			const team = 'enemy';
			const targets = flights[team];
			const data = { flights, bullets, team };
			const filteredBullets = Symbol('filteredBullets');

			jest.spyOn(PlayerManager, 'filterTeamBullets')
				.mockReturnValue(filteredBullets);
			jest.spyOn(PlayerManager, 'collectEachTargetHits')
				.mockReturnValue(returnValue);

			const result = collectHits({ data });
			const expectation = targets.map(() => returnValue);

			targets.map((target) => expect(PlayerManager.collectEachTargetHits)
				.toHaveBeenCalledWith(target, filteredBullets));
			expect(result).toMatchObject(expectation);
		});

		test('player hits', () => {
			const team = 'player';
			const targets = flights[team];
			const data = { flights, bullets, team };
			const filteredBullets = Symbol('filteredBullets');

			jest.spyOn(PlayerManager, 'filterTeamBullets')
				.mockReturnValue(filteredBullets);
			jest.spyOn(PlayerManager, 'collectEachTargetHits')
				.mockReturnValue(returnValue);

			const result = collectHits({ data });
			const expectation = targets.map(() => returnValue);

			targets.map((target) => expect(PlayerManager.collectEachTargetHits)
				.toHaveBeenCalledWith(target, filteredBullets));
			expect(result).toMatchObject(expectation);
		});
	});

	test('collectEachTargetHits', () => {
		const target = Symbol('targetValue');
		const bullets = Symbol('bulletsValue');

		jest.spyOn(PlayerManager, 'filterBullet')
			.mockReturnValue(returnValue);

		const expectation = { target: target,
			bullets: returnValue };

		const result = PlayerManager.collectEachTargetHits(target, bullets);

		expect(PlayerManager.filterBullet)
			.toHaveBeenCalledWith(bullets, target);

		expect(result).toEqual(expectation);
	});

	test('updateHealth', () => {
		const target = { target: Symbol('targetValue') };
		const bullets = Symbol('bullets');

		const hits = [{ target, bullets }];

		const expectation = [{ ...target, health: two }];

		jest.spyOn(PlayerManager, 'calDamage').mockReturnValue(two);

		const result = updateHealth(hits);

		expect(result).toMatchObject(expectation);
	});

	describe('updateBulletIsHit', () => {
		const bullets = secure(rndRange
			.map((data) => ({ id: data, isHit: false })));

		const hitBullets = random.rndValues(bullets, two)
			.map((data) => ({ ...data, isHit: true }));

		const hitBulletIds = hitBullets.map((bullet) => bullet.id);

		const bulletsExpected = bullets.map((bullet) => (
			{ ...bullet, isHit: hitBulletIds.includes(bullet.id) }));

		const expectations = [
			[hitBullets, bulletsExpected],
			[[{}], bullets],
		];

		test.each(expectations)('updateBulletIsHit %p',
			(hits, expected) => {
				const result = PlayerManager
					.updateBulletIsHit(hits, bullets);
				const resultCheck = result;

				expect(resultCheck).toMatchObject(expected);
			});
	});

	test('processHits', () => {
		const targets = Symbol('targets');
		const bullets = Symbol('bullets');
		const flight = Symbol('flight');
		const health = Symbol('health');
		const flights = {
			enemy: [{ ...flight, health }],
			player: targets,
		};
		const flattenBulletsValue = Symbol('flattenBulletsValue');

		const playerHits = [Symbol('playerHits')];
		const enemyHits = [Symbol('enemyHits')];
		const updatedFlight = [{
			health,
		}];
		const context = { state: { targets, bullets, flight, health }};
		const expected = { targets, health, bullets };

		jest.spyOn(PlayerManager, 'collectHits')
			.mockReturnValueOnce(playerHits)
			.mockReturnValue(enemyHits);
		jest.spyOn(PlayerManager, 'updateHealth')
			.mockReturnValueOnce(updatedFlight)
			.mockReturnValue(targets);
		jest.spyOn(PlayerManager, 'updateBulletIsHit')
			.mockReturnValue(bullets);
		jest.spyOn(helperService, 'flattenObjects')
			.mockReturnValue(flattenBulletsValue);

		const result = processHits(context);
		const data = {
			bullets,
			flights,
		};

		['player', 'enemy'].map((team) =>
			expect(PlayerManager.collectHits)
				.toHaveBeenCalledWith({ ...context, data: { ...data, team }}));
		[enemyHits, playerHits].map((team) =>
			expect(PlayerManager.updateHealth)
				.toHaveBeenCalledWith(team));
		expect(helperService.flattenObjects)
			.toHaveBeenCalledWith({
				hits: [...enemyHits, ...playerHits],
				data: 'bullets',
			});
		expect(PlayerManager.updateBulletIsHit)
			.toHaveBeenCalledWith(flattenBulletsValue, bullets);

		expect(result).toEqual(expected);
	});

	describe('filterTeamBullets', () => {
		const bullets = [{
			id: 100,
			team: 'enemy',
		},
		{
			id: 101,
			team: 'player',
		}];

		test('enemy bullets', () => {
			const team = 'enemy';
			const result = filterTeamBullets({ bullets, team });
			const expectation = [{
				id: 100,
				team: 'enemy',
			}];

			expect(result).toMatchObject(expectation);
		});

		test('player bullets', () => {
			const team = 'player';
			const result = filterTeamBullets({ bullets, team });
			const expectation = [{
				id: 101,
				team: 'player',
			}];

			expect(result).toMatchObject(expectation);
		});
	});

	test('filterBullet', () => {
		const bullets = secure(rndRange.map((data) => ({ id: data })));

		const rndBullets = random.rndValues(bullets, four);
		const rndBulletIds = rndBullets.map((data) => data.id);

		const target = Symbol('target');
		const expectation = rndBullets;

		jest.spyOn(PlayerManager, 'isBulletHit')
			.mockImplementation((bullet) => rndBulletIds.includes(bullet.id));

		const result = filterBullet(bullets, target);

		bullets.forEach((bullet) =>
			expect(PlayerManager.isBulletHit)
				.toHaveBeenCalledWith(bullet, target));

		expect(result).toMatchObject(expectation);
	});

	test('updateScore', () => {
		helper.retry(() => {
			const rndRangeNum = secure(range(0, random.rndBetween(1, ten)));
			const targets = secure(rndRangeNum
				.map((data) => ({ id: data, health:
				rndBetween(0, four) })));
			const score = rndBetween(0, ten);

			const damagedTargets = targets.filter((target) =>
				target.health === 0);

			const expectation = damagedTargets.length + score;

			const result = updateScore({ state: { targets, score }});

			expect(result).toEqual(expectation);
		});
	});

	test('removeTargets', () => {
		const targets = secure(rndRange.map((data) =>
			({ id: data, health: rndBetween(0, four) })));
		const expectation = [];

		targets.forEach((target) =>
			target.health !== 0 && expectation.push(target));

		const result = removeTargets({ state: { targets }});

		expect(result).toMatchObject(expectation);
	});
	describe('Test generateObjects and getObjects', () => {
		const prob = Symbol('prob');
		const height = Symbol('height');
		const width = Symbol('width');
		const gameObject = random.rndValue(['objects', 'powers']);
		const types = [keys(config[gameObject]), gameObject];
		const type = Symbol('type');
		const context = {
			config: {
				objects: {
					cloud: {
						prob,
						height,
						width,
						type,
					},
					ship: {
						prob,
						height,
						width,
						type,
					},
				},
				powers: {
					doubleBullet: {
						width,
						height,
						type,
						prob,
					},
				},

			},
			state: {
				objects: [Symbol('objects')],
				powers: [Symbol('powers')],
			},
			data: types,
		};

		test(' generateObjects is performed', () => {
			const objectKeys = [Symbol('objectKeys')];
			const newObjects = [Symbol('newObjects')];

			jest.spyOn(collection, 'keys').mockReturnValue(objectKeys);

			jest.spyOn(PlayerManager, 'createObjects')
				.mockReturnValue(newObjects);
			const result = generateObjects({ ...context, data: gameObject });

			expect(PlayerManager.createObjects)
				.toHaveBeenCalledWith({ ...context,
					data: collection.values(context.config[gameObject]) });

			expect(result).toEqual([...context.state[gameObject],
				...newObjects]);
		});

		test('to test getObjects', () => {
			const data = collection.values(context.config[gameObject]);
			const item = random.rndValue(data);
			const rndString = Symbol('rndString');
			const num = random.rndBetween(0, hundred);

			jest.spyOn(PositionService, 'getRandomValue')
				.mockReturnValueOnce(num)
				.mockReturnValueOnce(num);

			jest.spyOn(random, 'rndString').mockReturnValue(rndString);
			jest.spyOn(PositionService, 'getRandomValue')
				.mockReturnValue(width);
			jest.spyOn(PositionService, 'getRandomValue')
				.mockReturnValue(height);

			const result = getObjects({ ...context,
				data: item });

			const expected = {
				x: num,
				y: -num,
			};

			expect(result).toMatchObject(expected);
		});
	});

	describe('Test updateBackgroundObjects and resetBackgroundObjects', () => {
		const ninetyNine = 99;

		test('Test updateBackgroundObjects', () => {
			const state
			= { objects: [{ y: rndBetween() }, { y: rndBetween() }],
				powers: [{ y: rndBetween() }, { y: rndBetween() }] };
			const data = random.rndValue(['objects', 'powers']);
			const result = updateBackgroundObjects({ state, config, data });

			const expectation = state[data].map((obj) => ({
				...obj,
				y: obj.y + config.bgnScreenYIncre,
			}));

			expect(result).toMatchObject(expectation);
		});

		test('resetBackgroundObjects is executed', () => {
			const state = {
				objects: [
					{ y: rndBetween(0, ninetyNine) },
					{ y: rndBetween(0, ninetyNine) },
				],
				powers: [
					{ y: rndBetween(0, ninetyNine) },
					{ y: rndBetween(0, ninetyNine) },
				],
			};
			const result = resetBackgroundObjects({ state });

			expect(result).toMatchObject(state.objects);
		});

		test('resetBackgroundObjects is not executed', () => {
			const state = {
				objects: [
					{ y: 101 },
					{ y: 110 },
				],
			};
			const result = resetBackgroundObjects({ state });

			const expectation = [];

			expect(result).toMatchObject(expectation);
		});
	});

	describe('to test create Objects', () => {
		const gameObject = random.rndValue(['objects', 'powers']);
		const types = collection.values(config[gameObject]);
		const objects = Symbol('objects');
		const mockContext = {
			data: types,
			config: config,
		};

		test('Objects are created', () => {
			jest.spyOn(helperService, 'isProbable').mockReturnValue(true);
			jest.spyOn(PlayerManager, 'getObjects')
				.mockReturnValue(objects);

			const result = createObjects(mockContext);
			const expected = types.filter(() => true).map(() => objects);

			types.filter(({ prob }) => {
				expect(helperService.isProbable)
					.toHaveBeenCalledWith(prob);
			}).map((item) => expect(PlayerManager.getObjects)
				.toHaveBeenCalledWith({ ...mockContext,
					data: item }));

			expect(result).toEqual(expected);
		});

		test('Objects are not created', () => {
			jest.spyOn(helperService, 'isProbable').mockReturnValue(false);

			const result = createObjects(mockContext);
			const expected = [];

			types.filter(({ prob }) => {
				expect(helperService.isProbable)
					.toHaveBeenCalledWith(prob);
			}).map((item) => expect(PlayerManager.getObjects)
				.toHaveBeenCalledWith({ ...mockContext,
					data: item }));

			expect(result).toEqual(expected);
		});
	});

	test('processPower', () => {
		const flight = Symbol('flight');
		const powers = [Symbol('powers')];
		const duration = Symbol('duration');
		const hits = Symbol('hits');
		const flattenPowersValue = Symbol('flattenObjectsValue');
		const activatePowerValue = Symbol('activatePowerValue');
		const removePowersValue = Symbol('removePowersValue');
		const state = {
			flight,
			powers,
			duration,
		};
		const context = { state };

		jest.spyOn(PlayerManager, 'collectPowerHits').mockReturnValue(hits);
		jest.spyOn(helperService, 'flattenObjects')
			.mockReturnValue(flattenPowersValue);
		jest.spyOn(PlayerManager, 'activatePower')
			.mockReturnValue(activatePowerValue);
		jest.spyOn(PlayerManager, 'removePowers')
			.mockReturnValue(removePowersValue);

		const result = processPower(context);

		const expected = {
			durations: {
				...duration,
				...activatePowerValue,
			},
			powers: removePowersValue,
		};

		expect(helperService.flattenObjects)
			.toHaveBeenCalledWith({ hits: hits, data: 'powers' });
		expect(PlayerManager.collectPowerHits)
			.toHaveBeenCalledWith({ ...context, data: [[flight], powers] });
		expect(PlayerManager.activatePower)
			.toHaveBeenCalledWith(context, flattenPowersValue);
		expect(PlayerManager.removePowers)
			.toHaveBeenCalledWith(powers, flattenPowersValue);
		expect(result).toEqual(expected);
	});

	test('removePowers', () => {
		const powers = secure(rndRange.map(() => ({ id: Symbol('id') })));
		const hitPowers = random.rndValues(powers, four);
		const powersId = hitPowers.map((hitPower) => hitPower.id);

		const expectation = powers.filter((power) =>
			!powersId.includes(power.id));

		const result = removePowers(powers, hitPowers);

		expect(result).toEqual(expectation);
	});

	test('collectPowerHits', () => {
		const targets = secure(rndRange.map(() => ({ id: Symbol('id') })));

		const powers = [Symbol('powers')];
		const data = [targets, powers];
		const expectation = targets.map(() => returnValue);

		jest.spyOn(PlayerManager, 'collectEachHits')
			.mockReturnValue(returnValue);

		const result = collectPowerHits({ data });

		targets.forEach((target) => expect(PlayerManager.collectEachHits)
			.toHaveBeenCalledWith(target, powers));
		expect(result).toMatchObject(expectation);
	});

	test('collectEachHits', () => {
		const target = Symbol('targetValue');
		const powers = Symbol('powersValue');

		jest.spyOn(PlayerManager, 'filterBullet')
			.mockReturnValue(returnValue);

		const expectation = { target: target,
			powers: returnValue };

		const result = collectEachHits(target, powers);

		expect(PlayerManager.filterBullet)
			.toHaveBeenCalledWith(powers, target);

		expect(result).toEqual(expectation);
	});

	test('activatePower', () => {
		const powers = {
			doubleBullet: {
				width: 5,
				height: 10,
				type: 'doubleBullet',
				prob: 0.01,
				duration: 15,
			},
		};
		const unixTime = Symbol('newTime');
		const hits = random.rndValues(powers, two);
		const context = { config: { powers }};
		const powersType = hits.map((power) => power.type);
		const adjustTimeValue = Symbol('adjustTime');
		const second = 'seconds';

		jest.spyOn(timeService, 'adjustTime').mockReturnValue(adjustTimeValue);
		jest.spyOn(Date, 'now').mockReturnValue(unixTime);

		const result = activatePower(context, hits);

		const expected = powersType.reduce((acc, type) => ({
			[type]: adjustTimeValue,
		}), {});

		powersType.forEach((type) => expect(timeService.adjustTime)
			.toHaveBeenCalledWith(
				unixTime, powers[type].duration, second
			));
		expect(result).toMatchObject(expected);
	});
});
