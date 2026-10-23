import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_ROUTES } from '../constants/routes';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const loginRole = (user?.role || '').toUpperCase();
    const isSuperAdmin = loginRole === 'SUPER ADMIN';
    const isAdmin = isSuperAdmin || loginRole === 'ADMIN';
    const isQC = loginRole === 'QUALITY CONTROL';

    const handleSignOut = async () => {
        if (logout) {
            await logout();
        } else {
            localStorage.removeItem('user');
        }
        navigate(APP_ROUTES.LOGIN);
    };

    const isActive = (path) => {
        return location.pathname === path ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200';
    };

    return (
        <aside className={`w-64 bg-surface-light dark:bg-surface-dark border-r border-slate-200 dark:border-slate-800 flex-shrink-0 flex flex-col transition-colors duration-200 ${isOpen ? 'flex' : 'hidden'}`}>
            <div className="h-[73px] px-4 border-b border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="select-none h-12 w-12 rounded-lg bg-white flex items-center justify-center shrink-0">
                        <img
                            src='/src/assets/PTDI_LOGO.webp'
                            alt='Logo'
                            className='w-10 h-10 object-contain'
                        />
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-base font-bold leading-tight text-slate-900 dark:text-white">Tool Crib DPM</h1>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">PT. Dirgantara</p>
                    </div>
                </div>
                <button
                    onClick={toggleSidebar}
                    className="p-1.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title="Collapse Sidebar"
                >
                    <span className="material-symbols-outlined text-[20px]">menu</span>
                </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-6 px-3 flex flex-col gap-1">
                <Link to={APP_ROUTES.DASHBOARD} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all ${isActive(APP_ROUTES.DASHBOARD)}`}>
                    <span className={`material-symbols-outlined ${location.pathname === APP_ROUTES.DASHBOARD ? 'filled' : ''}`}>dashboard</span>
                    <span className="text-sm font-semibold">Dashboard</span>
                </Link>
                {(isAdmin || loginRole === 'PRODUCTION CONTROL' || loginRole === 'USER') && (
                    <Link to={APP_ROUTES.BORROW} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all ${isActive(APP_ROUTES.BORROW)}`}>
                        <span className={`material-symbols-outlined ${location.pathname === APP_ROUTES.BORROW ? 'filled' : ''}`}>upload</span>
                        <span className="text-sm font-medium">Borrow</span>
                    </Link>
                )}

                {(isAdmin || isQC) && (
                    <>
                        {isAdmin && (
                            <Link to={APP_ROUTES.RETURN} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(APP_ROUTES.RETURN)}`}>
                                <span className={`material-symbols-outlined ${location.pathname === APP_ROUTES.RETURN ? 'filled text-primary' : ''}`}>download</span>
                                <span className="text-sm font-medium">Return</span>
                            </Link>
                        )}

                        {isAdmin && (
                            <Link to={APP_ROUTES.BORROW_VERIFICATION} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(APP_ROUTES.BORROW_VERIFICATION)}`}>
                                <span className={`material-symbols-outlined ${location.pathname === APP_ROUTES.BORROW_VERIFICATION ? 'filled text-purple-600' : ''}`}>verified_user</span>
                                <span className="text-sm font-medium">Verify Requests</span>
                            </Link>
                        )}
                    </>
                )}

                <Link to={APP_ROUTES.INVENTORY} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg group transition-all ${isActive(APP_ROUTES.INVENTORY)}`}>
                    <span className={`material-symbols-outlined ${location.pathname === APP_ROUTES.INVENTORY ? 'filled text-primary' : ''}`}>inventory_2</span>
                    <span className="text-sm font-medium">Inventory</span>
                </Link>

                {isSuperAdmin && (
                    <Link to={APP_ROUTES.USER_MANAGEMENT} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive(APP_ROUTES.USER_MANAGEMENT)}`}>
                        <span className={`material-symbols-outlined ${location.pathname === APP_ROUTES.USER_MANAGEMENT ? 'filled text-primary' : ''}`}>group</span>
                        <span className="text-sm font-medium">User Management</span>
                    </Link>
                )}
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <span className="material-symbols-outlined">logout</span>
                    <span className="text-sm font-medium">Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
