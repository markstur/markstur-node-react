import React from 'react';

import Screen from './Screen/Screen';
import Keypad from './Keypad/Keypad';

const EMPTY = '🧮';
const DEL = '🔙';
const operations = {
    '+': 'add',
    '-': 'sub',
    '*': 'mult',
    '/': 'div',
};

class Calculator extends React.Component {
    state = {
        equation: '',
        result: EMPTY 
    }

    onButtonPress = event => {
      let equation = this.state.equation;
      const pressedButton = event.target.innerHTML;
      if (['+', '-', '*', '/'].some(o=>equation.includes(o)) && pressedButton != DEL) {
        this.clear();
        equation = '';
      }
      if ([',', 'M', 'D', 'C', 'L', 'X', 'V', 'I'].indexOf(pressedButton) !== -1) equation += pressedButton;
      else if (pressedButton === '␀') equation += 'nulla';
      else if (['+', '-', '*', '/'].indexOf(pressedButton) !== -1) {
        const operation = operations[pressedButton];
        equation.trimRight(',');
        const url = `/api/calculator/${operation}?operands=${equation}`;
        try {
          fetch(url)
            .then(async (res) => ({
              status: res.status,
              statusText: res.statusText,
              text: await res.text()
            })).then(({ status, statusText, text }) => {
              if (status === 200) this.setState({result: text});
              else this.setState({result: statusText});
            });
        } catch (error) {
          alert('ERROR');
        }
        equation += ' ' + pressedButton;
      }
      else if (pressedButton === '🆑') return this.clear();
      else { // delete (including white space padding around operators)
        equation = equation.substr(0, equation.length - 1);
        equation = equation.trim();
        this.setState({result: EMPTY});
      }
                    
      this.setState({equation: equation});
    }
    clear() {
      this.setState({equation: '', result: EMPTY});
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
