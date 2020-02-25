import Houk from 'houk';

export default class Midy extends Houk {
	public access: WebMidi.MIDIAccess | undefined;
	public inputs: WebMidi.MIDIInputMap | undefined;
	public outputs: WebMidi.MIDIOutputMap | undefined;
	public state: 'none' | 'pending' | 'granted' | 'denied' = 'none';

	async requestAccess(): Promise<boolean> {
		try {
			this.state = 'pending';

			const access = await navigator.requestMIDIAccess({
				sysex: true
			});

			const { inputs, outputs } = access;
			this.access = access;
			this.inputs = inputs;
			this.outputs = outputs;

			for (const input of inputs.values()) {
				input.addEventListener('midimessage', midiMessage => {
					const [type, note] = midiMessage.data;

					if (type === 128) {
						this.emit('noteUp', undefined, note);
					} else if (type === 144) {
						this.emit('noteDown', undefined, note);
					}

					this.emit('midiMessage', midiMessage);
				});
			}

			this.state = 'granted';
			return true;
		} catch {
			this.state = 'denied';
			return false;
		}
	}
}
