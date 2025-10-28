import React, { useState } from 'react'; // Impor useState
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import apiClient from '../../api/axiosConfig'; // Impor apiClient
import { FaUserShield, FaSignOutAlt } from 'react-icons/fa'; // Impor ikon

export default function Setting() {
    const navigate = useNavigate();

    // --- State dan Logic untuk Form Tambah Admin ---
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        age: '',
        gender: 'Laki-laki',
        address: '',
        role: 'admin'
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAddAdminSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setSuccess('');

        if (!formData.name || !formData.email || !formData.password) {
            setError('Nama, Email, dan Password wajib diisi.');
            setIsLoading(false);
            return;
        }

        try {
            await apiClient.post('/users', formData);
            setSuccess(`Admin "${formData.name}" berhasil ditambahkan!`);
            setFormData({ // Kosongkan form
                name: '', email: '', password: '', age: '',
                gender: 'Laki-laki', address: '', role: 'admin'
            });
            // Tampilkan pesan sukses sebentar, lalu hapus
            setTimeout(() => setSuccess(''), 3000);

        } catch (err) {
            console.error('Gagal menambah admin:', err);
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('Gagal menambahkan admin. Silakan coba lagi.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    // --- Akhir State dan Logic Form ---


    // Fungsi Logout (tetap sama)
    const handleLogout = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen">
            {/* Pastikan Sidebar menampilkan halaman 'Pengaturan' sebagai aktif */}
            <Sidebar activePage="Pengaturan" /> 
            <div className="flex-1 bg-gray-100 p-8 space-y-8"> 
                {/* Judul Halaman */}
                <h1 className="text-3xl font-bold text-gray-800">Pengaturan</h1>

                {/* --- Kartu Pengaturan Akun (Logout) --- */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2">Akun</h2>
                    <p className="text-sm text-gray-600 mb-4">Keluar dari sesi Anda saat ini.</p>
                    <button
                        onClick={handleLogout}
                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition shadow-md"
                    >
                        <FaSignOutAlt className="mr-2"/>
                        Logout
                    </button>
                </div>

                {/* --- Kartu Form Tambah Admin --- */}
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700 border-b pb-2 flex items-center">
                       <FaUserShield className="mr-3 text-indigo-600"/> Tambah Admin Baru
                    </h2>
                    <form onSubmit={handleAddAdminSubmit} className="space-y-4 mt-4">
                        {/* Nama */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nama Lengkap</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                        
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>

                        {/* Usia & Jenis Kelamin */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="age" className="block text-sm font-medium text-gray-700">Usia</label>
                                <input type="number" name="age" id="age" value={formData.age} onChange={handleChange} 
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"/>
                            </div>
                            <div>
                                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                                <select name="gender" id="gender" value={formData.gender} onChange={handleChange} 
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>
                        </div>

                        {/* Alamat */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">Alamat</label>
                            <textarea name="address" id="address" rows="3" value={formData.address} onChange={handleChange} 
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
                            </textarea>
                        </div>
                        
                        {/* Role (Hidden/Info) */}
                         <div>
                            <label htmlFor="role-info" className="block text-sm font-medium text-gray-700">Role</label>
                            <input type="text" id="role-info" value="Admin (Otomatis)" readOnly disabled
                                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 cursor-not-allowed text-gray-500"/>
                         </div>

                        {/* Notifikasi */}
                        {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
                        {success && <p className="text-green-600 text-sm text-center bg-green-50 p-2 rounded">{success}</p>}

                        {/* Tombol Submit */}
                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={isLoading}
                                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 disabled:cursor-wait"
                            >
                                {isLoading ? 'Menyimpan...' : 'Tambah Admin'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}