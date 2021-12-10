import React from 'react';

import Screen from './Screen/Screen';
import Keypad from './Keypad/Keypad';

const operations = {
    '+': 'add',
    '-': 'sub',
    '*': 'mult',
    '/': 'div',
};

class Calculator extends React.Component {
    state = {
        equation: '',
        result: 0
    }

    onButtonPress = event => {
      let equation = this.state.equation;
      const pressedButton = event.target.innerHTML;
      if ([',', 'M', 'D', 'C', 'L', 'X', 'V', 'I'].indexOf(pressedButton) !== -1) equation += pressedButton;
      else if (pressedButton === '␀') equation += pressedButton;
      else if (['+', '-', '*', '/'].indexOf(pressedButton) !== -1) {
        const operation = operations[pressedButton];
        const url = `/api/calculator/${operation}?operands=${equation}`;
        try {
          fetch(url)
            .then(async (res) => ({
              status: res.status,
              statusText: res.statusText,
              text: await res.text()
            })).then(({ status, statusText, text }) => {
              console.log(status); // this is the status code
              console.log(text);   // this is json body 
              if (status === 200) this.setState({result: text});
              else this.setState({result: statusText});
            });
        } catch (error) {
          alert('ERROR');
        }
        equation += ' ' + pressedButton + ' ';
      }
      else if (pressedButton === '🆑') return this.clear();
      else { // delete
        equation = equation.substr(0, equation.length - 1);
        equation = equation.trim();
      }
                    
      this.setState({equation: equation});
    }
    clear() {
      this.setState({equation: '', result: 0});
    }

    render() {
        return (
            <main className="calculator">
                <Screen equation={this.state.equation} result={this.state.result} />
                <Keypad onButtonPress={this.onButtonPress} />
            </main>
        );
    }
}

export default Calculator;
