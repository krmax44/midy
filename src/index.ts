import Houk from 'houk';

type MidiNoteEvent = [midiNote: number, midiChannel: number];
export default class Midy extends Houk<{
	noteUp: MidiNoteEvent;
	noteDown: MidiNoteEvent;
	midiMessage: [midiMessageEventData: WebMidi.MIDIMessageEvent];
}> {
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
				input.addEventListener('midimessage', (midiMessage) => {
					const [type, note] = midiMessage.data;

					if (type >= 128 && type <= 159) {
						const event = type >= 144 ? 'noteDown' : 'noteUp';
						const channel = event === 'noteDown' ? -143 + type : 129 - type;
						void this.emit(event, note, channel);
					}

					void this.emit('midiMessage', midiMessage);
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
