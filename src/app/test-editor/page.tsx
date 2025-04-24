'use client';

import React from 'react';
import CKEditor4Test from '../../components/CKEditor4Test';

const TestEditorPage = () => {
    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-2xl font-bold mb-6">Trang Test CKEditor 4</h1>
            <CKEditor4Test />
        </div>
    );
};

export default TestEditorPage; 