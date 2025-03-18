"use client";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard ,  FileText, X,
  ChevronRight,
  Bell} from "lucide-react";
export default function Sidebar ({ userRole, className ,navigationByRole,roleInfo})  {
  const pathname = usePathname();
  const [openSubmenu, setOpenSubmenu] = useState(null);
  
  const navigationItems = navigationByRole[userRole] || [];
  const currentRoleInfo = roleInfo[userRole] || roleInfo.user;

  const toggleSubmenu = (name) => {
    setOpenSubmenu(openSubmenu === name ? null : name);
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* logo */}
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">
          S
        </div>
        <span className="font-bold text-xl">ShopSphere</span>
      </div>

      {/* profile */}
      <div className="px-4 py-2 border-b">
        <div className="flex items-center gap-2 mb-6">
          <Avatar>
            <AvatarImage
              src="/api/placeholder/40/40"
              alt={currentRoleInfo.name}
            />
            <AvatarFallback>{currentRoleInfo.avatar}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">{currentRoleInfo.name}</p>
            <p className="text-xs text-muted-foreground">
              {currentRoleInfo.email}
            </p>
          </div>
        </div>

        {/* <div className="relative mb-6">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search..." className="pl-8" />
        </div> */}
      </div>

      {/* scroll menu */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                               (item.submenu && item.submenu.some(sub => pathname === sub.href));
              const hasSubmenu = item.submenu && item.submenu.length > 0;
              const isSubmenuOpen = openSubmenu === item.name;
              
              return (
                <div key={item.name} className="space-y-1">
                  {hasSubmenu ? (
                    <>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md",
                          isActive
                            ? "bg-accent text-accent-foreground font-medium"
                            : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </div>
                        <ChevronRight className={cn(
                          "h-4 w-4 transition-transform",
                          isSubmenuOpen && "transform rotate-90"
                        )} />
                      </button>
                      
                      {isSubmenuOpen && (
                        <div className="pl-10 space-y-1 pt-1">
                          {item.submenu.map((subItem) => {
                            const isSubActive = pathname === subItem.href;
                            return (
                              <Link
                                key={subItem.name}
                                href={subItem.href}
                                className={cn(
                                  "flex items-center py-2 text-sm rounded-md",
                                  isSubActive
                                    ? "text-accent-foreground font-medium"
                                    : "text-muted-foreground hover:text-accent-foreground"
                                )}
                              >
                                {subItem.name}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 text-sm rounded-md",
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </div>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </ScrollArea>

     
      {/* <div className="p-4 border-t mt-auto">
        {userRole === 'admin' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Admin Reports</p>
                  <p className="text-xs text-muted-foreground">View monthly summary</p>
                </div>
              </div>
              <Button className="w-full mt-3" size="sm" variant="outline">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        )}
        
        {userRole === 'vendor' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Pending Payout</p>
                  <p className="text-xs text-muted-foreground">$1,234.56 available</p>
                </div>
              </div>
              <Button className="w-full mt-3" size="sm" variant="outline">
                View Earnings
              </Button>
            </CardContent>
          </Card>
        )}
        
        {userRole === 'user' && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Need help?</p>
                  <p className="text-xs text-muted-foreground">Contact support</p>
                </div>
              </div>
              <Button className="w-full mt-3" size="sm" variant="outline">
                Get Support
              </Button>
            </CardContent>
          </Card>
        )}
      </div> */}
    </div>
  );
};