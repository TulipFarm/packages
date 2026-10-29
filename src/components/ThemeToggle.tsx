import { Button } from '@tulipfarm/sprout/button';
import Sun from 'reicon-react/icons/Sun';
import Moon from 'reicon-react/icons/Moon';

export default function ThemeToggle() {
  return (
    <Button
      className="theme-toggle"
      variant="ghost"
      size="icon-lg"
      data-theme-toggle
      aria-label="Toggle color theme"
      title="Toggle color theme"
    >
      <Sun className="theme-sun" size={18} aria-hidden="true" />
      <Moon className="theme-moon" size={18} aria-hidden="true" />
    </Button>
  );
}
