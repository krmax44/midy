import Midy from '..';

type HandlerFn = (m: WebMidi.MIDIMessageEvent) => void;
describe('Midy', () => {
	let handler: HandlerFn;

	const source = {
		values: jest.fn().mockImplementation(() => [
			{
				addEventListener: jest
					.fn()
					.mockImplementation((_eventName: string, h: HandlerFn) => {
						handler = h;
					})
			}
		])
	};

	test('listens to events', async () => {
		expect.assertions(7);

		Object.defineProperty(navigator, 'requestMIDIAccess', {
			value: () =>
				Promise.resolve({
					inputs: source,
					outputs: source
				}),
			writable: true
		});

		const midi = new Midy();
		await midi.requestAccess();

		const listenerUp = jest.fn();
		const listenerDown = jest.fn();

		midi.on('noteUp', listenerUp);
		midi.on('noteDown', listenerDown);

		// NoteUp C4
		handler({
			data: new Uint8Array([128, 60, 40])
		} as any);

		// NoteDown D4
		handler({
			data: new Uint8Array([144, 62, 50])
		} as any);

		expect(midi.state).toBe('granted');
		expect(listenerUp.mock.calls[0][0]).toBe(60);
		expect(listenerUp.mock.calls[0][1]).toBe(1);
		expect(listenerUp.mock.calls[0][2]).toBe(40);
		expect(listenerDown.mock.calls[0][0]).toBe(62);
		expect(listenerDown.mock.calls[0][1]).toBe(1);
		expect(listenerDown.mock.calls[0][2]).toBe(50);
	});

	it('catches denial', async () => {
		expect.assertions(1);
		
		Object.defineProperty(navigator, 'requestMIDIAccess', {
			value: () => Promise.reject(),
			writable: true
		});

		const midi = new Midy();
		await midi.requestAccess();

		expect(midi.state).toBe('denied');
	});
});
