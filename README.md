# Midy

[![GitHub CI Status](https://img.shields.io/github/workflow/status/krmax44/midy/build/master)](https://github.com/krmax44/midy/actions?query=workflow%3Abuild)
[![Code Coverage](https://img.shields.io/codecov/c/github/krmax44/midy)](https://codecov.io/gh/krmax44/midy)
[![bundle size](https://img.shields.io/bundlephobia/minzip/midy)](https://bundlephobia.com/result?p=midy)
[![npm version](https://img.shields.io/npm/v/midy)](https://www.npmjs.com/package/midy)

A super-minimalistic MIDI library.

## Installation

```bash
yarn add midy
# or using npm
npm i midy
```

## Example

```js
import Midy from 'midy';

const midy = new Midy();
if (await midy.requestAccess()) {
	midy.on('noteDown', (note, channel) => {
		console.log('A key was pressed!', note, channel);
	});
}
```

## Methods

| Method name     | Parameters                               | Description                                                                        | Type               |
| --------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- | ------------------ |
| `requestAccess` | _none_                                   | Request access to the Web MIDI API.                                                | `Promise<boolean>` |
| `on`            | event name `string`, listener `function` | Register an event listener. See [Houk API](https://github.com/krmax44/houk/#api)   | `void`             |
| `off`           | event name `string`, listener `function` | Unregister an event listener. See [Houk API](https://github.com/krmax44/houk/#api) | `boolean`          |

## Events

| Event name    	| Description                       	| Parameters                                	|
|---------------	|-----------------------------------	|-------------------------------------------	|
| `noteUp`      	| Triggered once a key is released. 	| MIDI note `number`, MIDI channel `number` 	|
| `noteDown`    	| Triggered once a key is pressed.  	| MIDI note `number`, MIDI channel `number` 	|
| `midiMessage` 	| Raw MIDI events.                  	| MIDI event `MIDIMessageEvent`             	|

## Properties

| Property name | Description  | Type            |
| ------------- | ------------ | --------------- |
| `access`      | MIDI access  | `MIDIAccess`    |
| `inputs`      | MIDI inputs  | `MIDIInputMap`  |
| `outputs`     | MIDI outputs | `MIDIOutputMap` |
| `state`       | Access state | `'none' | 'pending' | 'granted' | 'denied'`        |