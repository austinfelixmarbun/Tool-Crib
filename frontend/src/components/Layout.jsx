import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark">
                <Header toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                    <div className="max-w-[1200px] mx-auto flex flex-col gap-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
};


export default Layout;

