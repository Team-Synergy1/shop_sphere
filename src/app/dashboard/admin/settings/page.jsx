//  File: /app/dashboard/admin/settings/page.jsx
"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Switch
} from "@/components/ui/switch";
import { 
  Checkbox
} from "@/components/ui/checkbox";
import { 
  Label
} from "@/components/ui/label";
import { 
  Settings, 
  Globe, 
  Lock, 
  Bell, 
  Mail, 
  Shield, 
  CreditCard, 
  Users, 
  Percent
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>
      
      <Tabs defaultValue="general">
        <div className="flex">
          <div className="w-64 space-y-1 mr-6">
            <div className="text-muted-foreground mb-2 text-sm font-medium">Settings</div>
            <TabsList className="flex flex-col items-start h-auto bg-transparent space-y-1 p-0">
              <TabsTrigger value="general" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Settings className="mr-2 h-4 w-4" />
                General
              </TabsTrigger>
              <TabsTrigger value="site" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Globe className="mr-2 h-4 w-4" />
                Site Settings
              </TabsTrigger>
              <TabsTrigger value="security" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Lock className="mr-2 h-4 w-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="emails" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Mail className="mr-2 h-4 w-4" />
                Email Templates
              </TabsTrigger>
              <TabsTrigger value="api" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Shield className="mr-2 h-4 w-4" />
                API & Integrations
              </TabsTrigger>
              <TabsTrigger value="payment" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <CreditCard className="mr-2 h-4 w-4" />
                Payment Gateways
              </TabsTrigger>
              <TabsTrigger value="roles" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Users className="mr-2 h-4 w-4" />
                User Roles
              </TabsTrigger>
              <TabsTrigger value="fees" className="w-full justify-start px-3 py-2 data-[state=active]:bg-muted">
                <Percent className="mr-2 h-4 w-4" />
                Platform Fees
              </TabsTrigger>
            </TabsList>
          </div>
          
          <div className="flex-1">
            <TabsContent value="general" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your marketplace's general configurations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input id="site-name" defaultValue="ShopSphere" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-description">Site Description</Label>
                    <Textarea 
                      id="site-description" 
                      defaultValue="ShopSphere - The ultimate multi-vendor marketplace for all your shopping needs."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Contact Email</Label>
                    <Input id="contact-email" type="email" defaultValue="admin@shopsphere.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="support-phone">Support Phone</Label>
                    <Input id="support-phone" type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="maintenance-mode" />
                    <label htmlFor="maintenance-mode" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Enable Maintenance Mode
                    </label>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Save Changes</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="site" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Site Settings</CardTitle>
                  <CardDescription>
                    Configure your site appearance and functionality.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center rounded-md bg-muted/20">
                    <Globe className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Site configuration options</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage security configurations and access controls.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-60 flex items-center justify-center rounded-md bg-muted/20">
                    <Lock className="h-8 w-8 text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Security configuration options</span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Other TabsContent sections would follow the same pattern */}
          </div>
        </div>
      </Tabs>
    </div>
  );
}