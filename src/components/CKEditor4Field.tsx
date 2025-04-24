'use client';

import React, { useEffect, useRef } from 'react';
import { CKEditor, CKEditorEventHandler, CKEditorEventPayload } from 'ckeditor4-react';

// Define the props for the reusable component
interface CKEditor4FieldProps {
  value: string | null | undefined; // Value from form state
  onChange: (data: string) => void; // Callback to update form state
  id?: string; // Optional ID for accessibility or linking with Label
  config?: Record<string, any>; // Optional additional CKEditor config
}

const CKEditor4Field: React.FC<CKEditor4FieldProps> = ({ value, onChange, id, config }) => {
  const editorRef = useRef<any>(null); // To hold the CKEditor instance
  const isDataBeingSet = useRef(false); // Flag to prevent echo changes

  const handleEditorChange: CKEditorEventHandler<'change'> = (event: CKEditorEventPayload<'change'>) => {
    // If the editor data is currently being set programmatically, ignore the change event
    if (isDataBeingSet.current) {
      return;
    }
    const data = event.editor?.getData();
    if (data !== undefined && data !== value) { // Only call onChange if data actually changed
      onChange(data);
    }
  };

  // Effect to update editor data when the `value` prop changes from the parent state
  useEffect(() => {
    if (editorRef.current) {
      const editorData = editorRef.current.getData();
      const incomingData = value ?? ''; // Use empty string for null/undefined

      // Only update if the incoming value is different from the current editor content
      if (editorData !== incomingData) {
        isDataBeingSet.current = true; // Set flag before setting data
        editorRef.current.setData(incomingData, {
            callback: () => {
                // Reset the flag AFTER the data is set
                // Use setTimeout to ensure it runs after the current event loop potentially triggering onChange
                setTimeout(() => {
                  isDataBeingSet.current = false;
                }, 0);
            }
        });
      }
    }
  }, [value]); // Depend on the external value prop

  return (
    <div className="ckeditor-field-container w-full">
      <CKEditor
        // Use the version that doesn't require license key (shows dev warning)
        editorUrl="https://cdn.ckeditor.com/4.22.1/full-all/ckeditor.js" 
        
        // Use value for initialization if needed, but useEffect handles updates
        initData={value ?? ''} 
        
        // Assign ID if provided
        id={id}
        
        // Merge default config with any passed-in config
        config={{
          preset: 'full', // Default to full preset
          // Add other default configurations here if desired
          height: 300, // Example default height
          ...config, // Allow overriding with passed config
        }}
        
        onChange={handleEditorChange}
        
        onInstanceReady={({ editor }) => {
          console.log( `CKEditor instance ready for ID: ${id || 'unknown'}` );
          editorRef.current = editor; // Store the editor instance
          // Set initial data again if value prop exists and editor loaded empty
          // This handles race conditions where initData might not be ready initially
          if (value && !editor.getData()) {
              isDataBeingSet.current = true;
              editor.setData(value, { callback: () => { setTimeout(() => { isDataBeingSet.current = false; }, 0); } });
          }
        }}
      />
    </div>
  );
};

export default CKEditor4Field; 