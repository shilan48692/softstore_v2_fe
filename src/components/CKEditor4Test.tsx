'use client';

import React, { useState, useEffect, useRef } from 'react';
// Import types if available and needed, otherwise use any
import { CKEditor, CKEditorEventHandler, CKEditorEventPayload } from 'ckeditor4-react'; 

// Adjust event type based on ckeditor4-react exports
type EditorChangeEvent = CKEditorEventPayload<'change'>;

const CKEditor4Test = () => {
    const [editorData, setEditorData] = useState('<p>Hello from CKEditor 4 (v4.14.0)!</p>');
    const originalWarn = useRef<(...data: any[]) => void>();

    // Keep the console.warn override for now, might be removable if 4.14.0 doesn't warn
    useEffect(() => {
        originalWarn.current = console.warn;
        console.warn = (...args) => {
            // Check for known warning messages from different versions
            if (typeof args[0] === 'string' && 
                (args[0].includes('version is not secure'))) // General check
            {
                return; // Suppress the warning
            }
            originalWarn.current?.(...args);
        };
        return () => {
            if (originalWarn.current) {
                console.warn = originalWarn.current;
            }
        };
    }, []);

    const handleEditorChange: CKEditorEventHandler<'change'> = (event: EditorChangeEvent) => {
        // Safely access editor data
        const data = event.editor?.getData(); 
        if (data !== undefined) {
             // console.log( 'Editor data changed:', data );
             // setEditorData(data); // Uncomment to update state
        }
    };

    return (
        <div className="ckeditor-container p-4 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3">Test CKEditor 4 (v4.14.0)</h2>
            <CKEditor
                // Use version 4.14.0 from CDN
                editorUrl="https://cdn.ckeditor.com/4.14.0/full-all/ckeditor.js"
                
                initData={editorData} 
                config={{
                    preset: 'full',
                    // You can add other CKEditor 4 configs here if needed
                }}
                onChange={handleEditorChange}
                onInstanceReady={({ editor }) => {
                    console.log( 'CKEditor 4 (v4.14.0) instance is ready:', editor );
                }}
                // Enable type checking if you have CKEditor 4 types installed
                // type="classic"
            />
        </div>
    );
};

export default CKEditor4Test; 