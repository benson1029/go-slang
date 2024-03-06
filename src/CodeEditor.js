import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { basicDark } from '@uiw/codemirror-theme-basic';
import { run } from './go/index.ts';


function CodeEditor() {
    const [code, setCode] = useState('');
    const [output, setOutput] = useState('');

    const handleRunCode = async (code) => {
        setOutput("Running...");
        let output = await run(code);
        setOutput(output);
    };

    return (
        <>
            <div style={{ height: 'calc(100% - 25px)', width: '50%', float: 'left' }}>
                <div style={{ paddingBottom: '5px', height: '35px' }}>
                    <button
                        onClick={() => handleRunCode(code)}
                        style={{
                            padding: '10px',
                            borderRadius: '5px',
                            backgroundColor: '#2e3235',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <FontAwesomeIcon icon={faPlay} style={{ marginRight: '5px' }} />
                        Run Code
                    </button>
                </div>
                <div style={{ height: 'calc(100% - 40px)', border: '1px solid #ccc' }}>
                    <CodeMirror
                        value={code}
                        onChange={(value) => {
                            setCode(value);
                        }}
                        extensions={[StreamLanguage.define(go)]}
                        theme={basicDark}
                    />
                </div>
            </div>
            <div style={{ height: 'calc(100% - 25px)', width: '50%', float: 'right' }}>
                <div style={{ border: '1px solid #ccc', marginTop: '40px' }}>
                    <CodeMirror
                        value={output}
                        readOnly={true}
                        theme={basicDark}
                    />
                </div>
            </div>
        </>
    );
}

export default CodeEditor;
