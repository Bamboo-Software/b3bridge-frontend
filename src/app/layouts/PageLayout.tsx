import { cn } from "@/lib/utils"
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { routesPaths } from "@/lib/types/constants/routes";
import { HomeIcon, MenuIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

const PageLayout = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [, setIsDropdownOpen] = useState(false);
  const location = useLocation();
  const { ROOT } = routesPaths;

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [location.pathname]);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: ROOT, label: 'Home', icon: <HomeIcon className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation bar */}
      <header 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled ? 
            "bg-card/80 backdrop-blur-lg shadow-md border-b border-primary/10" : 
            "bg-transparent"
        )}
      >
        {/* Gradient border at the bottom */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 h-[1px] transition-opacity duration-300",
          isScrolled ? "opacity-100" : "opacity-0"
        )}>
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary to-transparent opacity-30"></div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 px-3 pt-1">
            {/* Logo */}
            <Link to={ROOT} className="flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="relative"
              >
                {/* Logo glow effect */}
                <div className="absolute -inset-1 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-cyan-400 to-purple-500 bg-clip-text text-transparent relative z-10">
                  B3Bridge
                </h1>
              </motion.div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <NavLink 
                  key={item.path} 
                  to={item.path}
                  className={({ isActive }) => cn(
                    "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all relative group",
                    isActive 
                      ? "bg-primary/10 text-primary" 
                      : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {/* Hover glow effect */}
                  <span className="absolute inset-0 rounded-md bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300"></span>
                  
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
              <ThemeToggle />
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
                className="relative overflow-hidden group"
              >
                {/* Button hover effect */}
                <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 rounded-full"></span>
                
                {isMobileMenuOpen ? (
                  <XIcon className="h-5 w-5 relative z-10" />
                ) : (
                  <MenuIcon className="h-5 w-5 relative z-10" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {isMobileMenuOpen && (
          <motion.div 
            className="md:hidden bg-card/95 backdrop-blur-lg border-b border-primary/10"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item, index) => (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                >
                  <NavLink 
                    to={item.path}
                    className={({ isActive }) => cn(
                      "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1.5 transition-all",
                      isActive 
                        ? "bg-primary/10 text-primary" 
                        : "text-foreground/70 hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navItems.length * 0.05, duration: 0.3 }}
              >
              </motion.div>
            </div>
          </motion.div>
        )}
      </header>

      {/* Main content */}
      <main 
        className={cn(
          "flex-1 overflow-y-auto pb-4 transition-all duration-300 mt-16",
        )}
      >
        <Outlet />
      </main>
    </div>
  )
}

export default PageLayout