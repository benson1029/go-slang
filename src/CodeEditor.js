import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faPlay, faRefresh } from '@fortawesome/free-solid-svg-icons';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { EditorView } from "@codemirror/view"
import { basicDark } from '@uiw/codemirror-theme-basic';

const sampleCode = `package main

import "fmt"

func main() {
  fmt.Println("Hello, World!")
}`;

const worker = new Worker(new URL('./EvalWorker.js', import.meta.url));

function CodeEditor() {
    const [code, setCode] = useState(
        localStorage.getItem("code") || sampleCode
    );
    const [output, setOutput] = useState("");
    const [heapSize, setHeapSize] = useState(8 * 1024 * 1024);

    const handleRunCode = async (code) => {
        setOutput("Running...");
        worker.onmessage = (e) => {
            const { output, time } = e.data;
            setOutput(output + `==============\nTime: ${time}ms`);
        }
        worker.postMessage({ code, heapSize });
    };

    const resetCode = () => {
        setCode(sampleCode);
        localStorage.setItem("code", sampleCode);
    };

    return (
        <>
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
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginLeft: '10px'
                    }}
                >
                    <FontAwesomeIcon icon={faPlay} style={{ marginRight: '5px' }} />
                    Run Code
                </button>
                <button
                    onClick={() => resetCode()}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: '#2e3235',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginLeft: '10px'
                    }}
                >
                    <FontAwesomeIcon icon={faRefresh} style={{ marginRight: '5px' }} />
                    Reset Code
                </button>
                <span style={{ marginLeft: '10px' }}>
                    Heap size:
                </span>
                <input
                    type="number"
                    style={{
                        marginLeft: '5px',
                        padding: '5px',
                        borderRadius: '5px',
                        width: '100px',
                        backgroundColor: '#2e3235',
                        color: 'white',
                    }}
                    value={heapSize}
                    onChange={(e) => setHeapSize(e.target.value)}
                    />
                <button
                    onClick={() => window.location.replace('./docs/')}
                    style={{
                        padding: '10px',
                        borderRadius: '5px',
                        backgroundColor: '#2e3235',
                        color: 'white',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        marginLeft: '10px'
                    }}
                >
                    <FontAwesomeIcon icon={faBook} style={{ marginRight: '5px' }} />
                    Language Specification
                </button>
            </div>
            <div style={{ height: 'calc(100% - 40px)', width: '50%', float: 'left' }}>
                <div style={{ height: 'calc(100% - 40px)', border: '1px solid #ccc' }}>
                    <CodeMirror
                        value={code}
                        onChange={(value) => {
                            setCode(value);
                            localStorage.setItem("code", value);
                        }}
                        extensions={[EditorView.lineWrapping, StreamLanguage.define(go)]}
                        theme={basicDark}
                    />
                </div>
            </div>
            <div style={{ height: 'calc(100% - 40px)', width: '50%', float: 'right' }}>
                <div style={{ border: '1px solid #ccc', maxHeight: 'calc(100% - 160px)', overflowY: 'auto' }}>
                    <CodeMirror
                        value={output}
                        readOnly={true}
                        theme={basicDark}
                        extensions={[EditorView.lineWrapping]}
                    />
                </div>
                <img
                    src={process.env.PUBLIC_URL + '/gopher.png'}
                    alt="Go Logo"
                    style={{ position: 'fixed', bottom: '0', right: '10%' }}
                />
            </div>
        </>
    );
}

export default CodeEditor;
