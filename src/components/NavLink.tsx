import { NavLink as RouterNavLink, NavLinkProps } from "react-router-dom";
import { forwardRef, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Settings, ArrowLeft } from "lucide-react";

interface NavLinkCompatProps extends Omit<NavLinkProps, "className" | "children"> {
  className?: string;
  activeClassName?: string;
  pendingClassName?: string;
  children?: ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkCompatProps>(
  ({ className, activeClassName, pendingClassName, to, children, ...props }, ref) => {
    const isBackLink = to === "/";
    const isSettingsLink = to === "/settings";
    
    return (
      <RouterNavLink
        ref={ref}
        to={to}
        className={({ isActive, isPending }) =>
          cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            "bg-secondary/50 hover:bg-secondary text-foreground hover:shadow-card",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            className, 
            isActive && activeClassName, 
            isPending && pendingClassName
          )
        }
        {...props}
      >
        {isBackLink && <ArrowLeft className="w-4 h-4" />}
        {children}
        {isSettingsLink && <Settings className="w-4 h-4" />}
      </RouterNavLink>
    );
  },
);

NavLink.displayName = "NavLink";

export { NavLink };
