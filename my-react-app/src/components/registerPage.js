import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const [nama, setNama] = useState('');
    const [role, setRole] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(null); 

    try {
      
      const response = await axios.post('http://localhost:3001/api/auth/register', {
        email: email,
        password: password,
        nama: nama,
        role: role
      });

      console.log('Register successful:', response.data);
      const token = response.data.token;
      localStorage.setItem('token', token); 

      navigate('/login');

    } catch (err) {
      // 4. Tangani error dari server
      setError(err.response ? err.response.data.message : 'Register gagal');
      console.error('Register error:', err.response || err.message);
    }
  };

return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
                Register
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label 
                        htmlFor="nama" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Nama:
                    </label>
                    <input
                        id="nama"
                        type="text"
                        value={nama}
                        onChange={(e) => setNama(e.target.value)}
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label 
                        htmlFor="email" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Email:
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label 
                        htmlFor="password" 
                        className="block text-sm font-medium text-gray-700"
                    >
                        Password:
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                        Role:
                    </label>
                    <div className="flex items-center">
                        <input
                            id="admin"
                            type="radio"
                            name="role"
                            value="admin"
                            checked={role === 'admin'}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="h-4 w-4"
                        />
                        <label htmlFor="admin" className="ml-2 text-sm text-gray-700">Admin</label>
                    </div>
                    <div className="flex items-center">
                        <input
                            id="user"
                            type="radio"
                            name="role"
                            value="user"
                            checked={role === 'user'}
                            onChange={(e) => setRole(e.target.value)}
                            required
                            className="h-4 w-4"
                        />
                        <label htmlFor="user" className="ml-2 text-sm text-gray-700">User</label>
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md shadow-sm hover:bg-blue-700"
                >
                    Register
                </button>
            </form>
            {error && (
                <p className="text-red-600 text-sm mt-4 text-center">{error}</p>
            )}
        </div>
    </div>
);
}
export default RegisterPage;
