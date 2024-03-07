import React from 'react';
import CodeEditor from './CodeEditor';
import './App.css';

function App() {
    return (
        <div className="App" style={{ height: '92vh', color: '#ffffff' }}>
            <header className="App-header">
                <h3 style={{ marginLeft: '10px' }}>
                    Go Interpreter with Explicit-control evaluator (ECE)
                </h3>
            </header>
            <CodeEditor />
        </div>
    );
}

export default App;
