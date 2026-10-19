import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_ROUTES } from '../constants/routes';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    useEffect(() => {
        const savedIdentifier = localStorage.getItem('rememberedIdentifier');
        if (savedIdentifier) {
            setIdentifier(savedIdentifier);
            setRememberMe(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(identifier, password);

            if (rememberMe) {
                localStorage.setItem('rememberedIdentifier', identifier);
            } else {
                localStorage.removeItem('rememberedIdentifier');
            }

            navigate(APP_ROUTES.DASHBOARD);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col font-display antialiased overflow-hidden relative">
            {/* Background Image & Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-105"
                style={{
                    backgroundImage: "url('/src/assets/PTDI_Forkominhan.jpeg')",
                }}
            ></div>
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-900/60"></div>

            <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative z-10">

                <div className="relative w-full max-w-[460px] bg-white/80 dark:bg-gray-900/70 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col">
                    <div className="pt-10 pb-6 px-8 flex flex-col items-center text-center">
                        <div className="w-20 h-20 mb-6 bg-white rounded-xl shadow-sm flex items-center justify-center p-2 border border-gray-100">
                            <img
                                className="w-full h-full object-contain opacity-90 hover:opacity-100 transition-opacity"
                                alt="PTDI Logo"
                                src="/src/assets/LOGO-16.png.webp"
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#0e121b] dark:text-white mb-2">
                            Tool Crib DPM
                        </h1>
                        <p className="text-[#4d6599] dark:text-gray-400 font-medium text-sm">
                            User Login

                        </p>
                    </div>

                    <form className="px-8 pb-8 flex flex-col gap-5" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-top-1 duration-200">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="identifier">
                                Employee ID (NIK)

                            </label>
                            <div className="relative flex items-center group">
                                <input
                                    className="form-input block w-full rounded-lg border border-[#d0d7e7] dark:border-gray-700 bg-slate-50 dark:bg-[#232936] text-[#0e121b] dark:text-white h-12 pl-4 pr-12 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all placeholder:text-[#9ca3af] text-sm font-medium outline-none"
                                    id="identifier"
                                    placeholder="Enter your User ID"

                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <span className="material-symbols-outlined absolute right-4 text-[#9ca3af] dark:text-gray-500 pointer-events-none group-focus-within:text-primary transition-colors text-[20px]">
                                    badge

                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider" htmlFor="password">
                                Security Password
                            </label>
                            <div className="relative flex items-center group">
                                <input
                                    className="form-input block w-full rounded-lg border border-[#d0d7e7] dark:border-gray-700 bg-slate-50 dark:bg-[#232936] text-[#0e121b] dark:text-white h-12 pl-4 pr-12 focus:border-primary focus:ring-primary/20 focus:ring-4 transition-all placeholder:text-[#9ca3af] text-sm font-medium outline-none"
                                    id="password"
                                    placeholder="Enter Password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 text-[#9ca3af] dark:text-gray-500 cursor-pointer hover:text-primary transition-colors focus:outline-none"
                                    disabled={isLoading}
                                >
                                    <span className="material-symbols-outlined text-[20px]">
                                        {showPassword ? 'visibility_off' : 'visibility'}
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center mt-1">
                            <label className="flex items-center gap-2.5 cursor-pointer group">
                                <div className="relative flex items-center">
                                    <input
                                        className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#232936] checked:border-primary checked:bg-primary transition-all"
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <svg className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                                <span className="text-sm text-[#4d6599] dark:text-gray-400 font-medium">Remember me</span>
                            </label>
                        </div>

                        <button
                            className="flex items-center justify-center w-full h-12 mt-2 bg-primary hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                    <span className="tracking-wide text-sm uppercase">Signing In...</span>
                                </>
                            ) : (
                                <>
                                    <span className="tracking-wide text-sm uppercase">Enter System</span>
                                    <span className="material-symbols-outlined ml-2 text-[18px] group-hover:translate-x-1 transition-transform">
                                        login
                                    </span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="bg-white/80 dark:bg-gray-900/70 border-t border-[#e7ebf3] dark:border-gray-700 py-4 px-6 text-center">
                        <p className="text-[7px] text-[#64748b] dark:text-gray-500 font-medium">Digitalizing Tool Crib for DPM Production Directorate PTDI</p>
                        <p className="text-[7px] text-[#64748b] dark:text-gray-500 font-medium">Version 1.0.0</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
