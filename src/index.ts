import Houk from 'houk';

// See midi event table
// https://web.archive.org/web/20200204061816/https://www.onicos.com/staff/iz/formats/midi-event.html

type MidiNoteEvent = [midiNote: number, midiChannel: number, velocity: number];
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
					const [statusByte, dataByte1, dataByte2] = midiMessage.data;

					if (statusByte >= 128 && statusByte <= 159) {
						const event = statusByte >= 144 ? 'noteDown' : 'noteUp';
						const channel =
							event === 'noteDown' ? statusByte - 143 : 129 - statusByte;

						const note = dataByte1;
						const velocity = dataByte2;

						void this.emit(event, note, channel, velocity);
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
