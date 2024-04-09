import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBackward, faBook, faForward, faGear, faPlay, faRefresh } from '@fortawesome/free-solid-svg-icons';
import CodeMirror from '@uiw/react-codemirror';
import { StreamLanguage } from '@codemirror/language';
import { go } from '@codemirror/legacy-modes/mode/go';
import { EditorView } from "@codemirror/view"
import { basicDark } from '@uiw/codemirror-theme-basic';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { Stage, Layer, Rect, Text } from 'react-konva';

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
    const [visualize, setVisualize] = useState(false);
    const [snapshots, setSnapshots] = useState([]);
    const [snapshotStep, setSnapshotStep] = useState(0);

    const handleRunCode = async (code) => {
        setOutput("Running...");
        worker.onmessage = (e) => {
            const { output, time, snapshots } = e.data;
            setOutput(output + `==============\nTime: ${time}ms`);
            setSnapshots(snapshots);
            setSnapshotStep(0);
        }
        worker.postMessage({ code, heapSize, visualize });
    };

    const resetCode = () => {
        setCode(sampleCode);
        localStorage.setItem("code", sampleCode);
    };

    return (
        <>
            <div style={{ height: 'calc(100% - 40px)', width: '50%', float: 'left' }}>
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
            <div style={{ height: 'calc(100% - 40px)', width: '49%', float: 'right' }}>
                <Tabs>
                    <TabList>
                        <Tab>Output</Tab>
                        <Tab>
                            <input type="checkbox"
                            onChange = {(e) => {
                                setVisualize(e.target.checked);
                            }}
                            />
                            Visualization
                        </Tab>
                    </TabList>
                    <TabPanel>
                        <div style={{ border: '1px solid #ccc', maxHeight: 'calc(100% - 160px)', overflowY: 'auto' }}>
                            <CodeMirror
                                value={output}
                                readOnly={true}
                                theme={basicDark}
                                extensions={[EditorView.lineWrapping]}
                            />
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <Slider onChange={
                            (value) => {
                                setSnapshotStep(value);
                            }
                        }
                        style={{
                            display: "inline-flex",
                            width: "60%",
                        }}
                        max={snapshots.length - 1}
                        value={snapshotStep}
                        />
                        <button
                            onClick={() => {
                                if (snapshotStep > 0)
                                    setSnapshotStep(snapshotStep - 1);
                            }}
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
                            disabled={snapshotStep <= 0}
                        >
                            <FontAwesomeIcon icon={faBackward} />
                        </button>
                        <button
                            onClick={() => {
                                if (snapshotStep < snapshots.length - 1)
                                    setSnapshotStep(snapshotStep + 1);
                            }}
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
                            disabled={snapshotStep >= snapshots.length - 1}
                        >
                            <FontAwesomeIcon icon={faForward} />
                        </button>
                        <span style={{ color: 'white', marginLeft: '10px' }}>
                            {snapshotStep + 1} / {snapshots.length}
                        </span>
                        <Tabs>
                            <TabList>
                                {
                                    snapshots[snapshotStep]?.map(thread => (
                                        <Tab>
                                            Thread {thread.id} {thread.current ? <FontAwesomeIcon icon={faGear} /> : <></>}
                                        </Tab>
                                    ))
                                }
                            </TabList>
                            {
                                snapshots[snapshotStep]?.map(thread => (
                                    <TabPanel>
                                        <Stage width={775} height={window.innerHeight * 0.8}>
                                            <Layer>
                                                {
                                                    thread.control.map((item, i) => (
                                                        <>
                                                            <Rect
                                                                x={10}
                                                                y={10 + i * 55}
                                                                width={200}
                                                                height={55}
                                                                stroke={(thread.current === true && i === 0) ? "cyan" : "white"}
                                                                strokeWidth={1}
                                                            />
                                                            <Text
                                                                x={15}
                                                                y={15 + i * 55}
                                                                text={item}
                                                                ellipsis={true}
                                                                width={190}
                                                                height={50}
                                                                fill="white"
                                                                border={1}
                                                                fontFamily='Roboto Mono'
                                                            />
                                                        </>
                                                    ))
                                                }
                                                {
                                                    thread.stash.map((item, i) => (
                                                        <>
                                                            <Rect
                                                                x={240}
                                                                y={10 + i * 55}
                                                                width={200}
                                                                height={55}
                                                                stroke="white"
                                                                strokeWidth={1}
                                                            />
                                                            <Text
                                                                x={245}
                                                                y={15 + i * 55}
                                                                text={item}
                                                                ellipsis={true}
                                                                width={190}
                                                                height={50}
                                                                fill="white"
                                                                border={1}
                                                                fontFamily='Roboto Mono'
                                                            />
                                                        </>
                                                    ))
                                                }
                                                <Env env={thread.env} />
                                            </Layer>
                                        </Stage>
                                    </TabPanel>
                                ))
                            }
                        </Tabs>
                    </TabPanel>
                </Tabs>
                <img
                    src={process.env.PUBLIC_URL + '/gopher.png'}
                    alt="Go Logo"
                    style={{ position: 'fixed', bottom: '0', right: '10%' }}
                />
            </div>
        </>
    );
}

function Env(thread) {
    let height = 10;
    let thisHeight = 0;
    return thread.env.map((array, i) => {
        height += thisHeight;
        thisHeight = Math.max(array.length * 15 + 5, 30);
        return (
            <>
                <Rect
                    x={470}
                    y={height}
                    width={300}
                    height={thisHeight}
                    stroke="white"
                    strokeWidth={1}
                />
                {
                    array.map((item, j) => (
                        <Text
                            x={475}
                            y={height + j * 15 + 5}
                            text={item.name + " = " + item.value}
                            ellipsis={true}
                            width={290}
                            height={10}
                            fill="white"
                            border={1}
                            fontFamily='Roboto Mono'
                        />
                    ))
                }
            </>
        )
    })
}

export default CodeEditor;
