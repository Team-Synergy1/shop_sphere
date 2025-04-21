"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    emailNotifications: {
      orderUpdates: true,
      promotions: true,
      newsletter: false,
    },
    privacy: {
      shareOrderHistory: false,
      shareWishlist: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setSettings(data.settings);
    } catch (error) {
      toast.error(error.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (category, setting, value) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          setting,
          value,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [setting]: value,
        },
      }));

      toast.success("Setting updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update setting");
    }
  };

  const deleteAccount = async () => {
    try {
      const response = await fetch("/api/user/account", {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      toast.success("Account deleted successfully");
      // Redirect to home page after account deletion
      window.location.href = "/";
    } catch (error) {
      toast.error(error.message || "Failed to delete account");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Manage your email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="orderUpdates" className="flex flex-col space-y-1">
              <span>Order Updates</span>
              <span className="text-sm text-muted-foreground">
                Receive updates about your orders
              </span>
            </Label>
            <Switch
              id="orderUpdates"
              checked={settings.emailNotifications.orderUpdates}
              onCheckedChange={(checked) =>
                updateSetting("emailNotifications", "orderUpdates", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="promotions" className="flex flex-col space-y-1">
              <span>Promotions</span>
              <span className="text-sm text-muted-foreground">
                Receive updates about sales and promotions
              </span>
            </Label>
            <Switch
              id="promotions"
              checked={settings.emailNotifications.promotions}
              onCheckedChange={(checked) =>
                updateSetting("emailNotifications", "promotions", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="newsletter" className="flex flex-col space-y-1">
              <span>Newsletter</span>
              <span className="text-sm text-muted-foreground">
                Subscribe to our monthly newsletter
              </span>
            </Label>
            <Switch
              id="newsletter"
              checked={settings.emailNotifications.newsletter}
              onCheckedChange={(checked) =>
                updateSetting("emailNotifications", "newsletter", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
          <CardDescription>
            Manage your privacy preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shareOrderHistory" className="flex flex-col space-y-1">
              <span>Share Order History</span>
              <span className="text-sm text-muted-foreground">
                Allow sharing of your order history for personalized recommendations
              </span>
            </Label>
            <Switch
              id="shareOrderHistory"
              checked={settings.privacy.shareOrderHistory}
              onCheckedChange={(checked) =>
                updateSetting("privacy", "shareOrderHistory", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="shareWishlist" className="flex flex-col space-y-1">
              <span>Share Wishlist</span>
              <span className="text-sm text-muted-foreground">
                Make your wishlist visible to others
              </span>
            </Label>
            <Switch
              id="shareWishlist"
              checked={settings.privacy.shareWishlist}
              onCheckedChange={(checked) =>
                updateSetting("privacy", "shareWishlist", checked)
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your
                  account and remove all your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={deleteAccount}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}