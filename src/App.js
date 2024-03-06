import React from 'react';
import CodeEditor from './CodeEditor';
import './App.css';

function App() {
    return (
        <div className="App" style={{ height: '92vh', color: '#ffffff' }}>
            <header className="App-header">
                <h3>CS4215 Project - Explicit-control evaluator (ECE) for Go</h3>
            </header>
            <CodeEditor />
        </div>
    );
}

export default App;
