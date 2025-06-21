import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/app/stores/store";
import { setTheme } from "@/app/stores/theme/theme.slice";
import { motion } from "framer-motion";

export function ThemeToggle() {
  const dispatch = useAppDispatch();
  const { theme } = useAppSelector((state) => state.theme);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    dispatch(setTheme(newTheme));
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative overflow-hidden group"
      aria-label="Toggle theme"
    >
      {/* Button hover effect */}
      <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300 rounded-full"></span>
      
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: theme === "dark" ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="absolute"
      >
        <Sun className="h-5 w-5 text-yellow-500" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: theme === "dark" ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="text-blue-300"
      >
        <Moon className="h-5 w-5" />
      </motion.div>
    </Button>
  );
}