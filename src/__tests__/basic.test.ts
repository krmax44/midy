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
			data: new Uint8Array([128, 60, 0])
		} as any);

		// NoteDown D4
		handler({
			data: new Uint8Array([144, 62, 0])
		} as any);

		expect(midi.state).toBe('granted');
		expect(listenerUp.mock.calls[0][0]).toBe(60);
		expect(listenerDown.mock.calls[0][0]).toBe(62);
	});

	it('catches denial', async () => {
		Object.defineProperty(navigator, 'requestMIDIAccess', {
			value: () => Promise.reject(),
			writable: true
		});

		const midi = new Midy();
		await midi.requestAccess();

		expect(midi.state).toBe('denied');
	});
});
