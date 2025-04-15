import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFolder, FiActivity, FiEdit } from 'react-icons/fi';

export default function Layout({ children, topbarContent, sidebarContent, rightbarContent }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showTopbar, setShowTopbar] = useState(false);
  const [showRightbar, setShowRightbar] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#0d1b2a] text-white overflow-hidden relative">

      {/* Topbar Toggle Area */}
      <div className="absolute top-2 left-2 right-2 z-50 flex justify-between px-2">
        <div className="flex gap-2">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="bg-[#1b263b] p-2 rounded hover:bg-[#415a77]"
          >
            <FiFolder />
          </button>
          <button
            onClick={() => setShowTopbar(!showTopbar)}
            className="bg-[#1b263b] p-2 rounded hover:bg-[#415a77]"
          >
            <FiActivity />
          </button>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRightbar(!showRightbar)}
            className="bg-[#1b263b] p-2 rounded hover:bg-[#415a77]"
          >
            <FiEdit />
          </button>
        </div>
      </div>

      {/* Topbar */}
      <AnimatePresence>
        {showTopbar && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="w-full bg-[#1b263b] p-3 pl-20 shadow-md z-20"
          >
            {topbarContent}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout: sidebar | content | rightbar */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar (projects) */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '16rem' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1b263b] p-4 shadow-lg overflow-auto"
            >
              {sidebarContent}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 p-6 mt-14 overflow-auto">
          {children}
        </div>

        {/* Right Sidebar (notes) */}
        <AnimatePresence>
          {showRightbar && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: '16rem' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[#1b263b] p-4 shadow-lg overflow-auto"
            >
              {rightbarContent}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}

