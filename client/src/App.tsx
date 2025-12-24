import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Contractor Foreman AI</h1>
        <p className="text-gray-600">Initial Project Setup Successful!</p>
        <div className="mt-6">
          <button 
            onClick={async () => {
              try {
                const response = await fetch('http://localhost:5000/api/health');
                const data = await response.json();
                alert(`Backend Health: ${data.status}`);
              } catch (error) {
                alert('Backend not reachable. Start the server first!');
              }
            }}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Check Backend Status
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;