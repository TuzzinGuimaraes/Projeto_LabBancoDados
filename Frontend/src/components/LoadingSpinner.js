import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
    );
};

export default LoadingSpinner;

