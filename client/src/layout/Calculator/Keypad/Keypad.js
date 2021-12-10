import React from 'react';

import KeypadRow from './KeypadRow/KeypadRow';
import Button from '../../../components/Button/Button';

const keypad = (props) => (
  <section className="keypad">
    <KeypadRow>
      <Button onButtonPress={props.onButtonPress}>M</Button>
      <Button onButtonPress={props.onButtonPress}>D</Button>
      <Button onButtonPress={props.onButtonPress}>C</Button>
      <Button onButtonPress={props.onButtonPress}>L</Button>
      <Button onButtonPress={props.onButtonPress}>X</Button>
      <Button onButtonPress={props.onButtonPress}>V</Button>
      <Button onButtonPress={props.onButtonPress}>I</Button>
      <Button onButtonPress={props.onButtonPress}>␀</Button>
    </KeypadRow>

    <KeypadRow>
      <Button onButtonPress={props.onButtonPress}>,</Button>
      <Button onButtonPress={props.onButtonPress}>+</Button>
      <Button onButtonPress={props.onButtonPress}>-</Button>
      <Button onButtonPress={props.onButtonPress}>*</Button>
      <Button onButtonPress={props.onButtonPress}>/</Button>
      <Button onButtonPress={props.onButtonPress}> </Button>
      <Button onButtonPress={props.onButtonPress}>&larr;</Button>
      <Button onButtonPress={props.onButtonPress}>🆑</Button>
    </KeypadRow>
    
  </section>
);

export default keypad;

