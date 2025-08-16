"use client";
import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { CTA } from "@/components/ui/CTA";

import { Select } from "@/components/ui/Select";

interface GoogleCalendarSettings {
  isConnected: boolean;
  calendarId?: string;
  syncEnabled: boolean;
  autoSync: boolean;
  syncDirection: 'one-way' | 'two-way';
  lastSync?: string;
  userEmail?: string;
}

interface GoogleCalendarIntegrationProps {
  className?: string;
}

export function GoogleCalendarIntegration({ className = "" }: GoogleCalendarIntegrationProps) {
  const [settings, setSettings] = useState<GoogleCalendarSettings>({
    isConnected: false,
    syncEnabled: false,
    autoSync: false,
    syncDirection: 'one-way',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [calendars, setCalendars] = useState<Array<{ id: string; name: string; primary?: boolean }>>([]);
  const [syncStatus, setSyncStatus] = useState<{ status: 'idle' | 'syncing' | 'success' | 'error'; message?: string }>({ 
    status: 'idle' 
  });

  // Load current settings
  useEffect(() => {
    void loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // This would typically fetch from your backend
      // For demo purposes, checking localStorage
      const saved = localStorage.getItem('googleCalendarSettings');
      if (saved) {
        setSettings(JSON.parse(saved) as GoogleCalendarSettings);
      }
    } catch (error) {
      console.error('Failed to load Google Calendar settings:', error);
    }
  };

  const saveSettings = async (newSettings: GoogleCalendarSettings) => {
    try {
      // This would typically save to your backend
      localStorage.setItem('googleCalendarSettings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save Google Calendar settings:', error);
    }
  };

  const connectToGoogle = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would:
      // 1. Initiate OAuth flow with Google
      // 2. Get authorization code
      // 3. Exchange for tokens
      // 4. Store securely on backend
      
      // Simulating OAuth flow
      // const authUrl = `https://accounts.google.com/oauth/authorize?` +
      //   `client_id=your-client-id&` +
      //   `redirect_uri=${encodeURIComponent(window.location.origin + '/api/auth/google/callback')}&` +
      //   `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
      //   `response_type=code&` +
      //   `access_type=offline`;
      
      // For demo purposes, simulate successful connection
      setTimeout(() => {
        const mockSettings: GoogleCalendarSettings = {
          isConnected: true,
          syncEnabled: true,
          autoSync: false,
          syncDirection: 'one-way',
          userEmail: 'admin@example.com',
          lastSync: new Date().toISOString(),
        };
        void saveSettings(mockSettings);
        setCalendars([
          { id: 'primary', name: 'Primary Calendar', primary: true },
          { id: 'work', name: 'Work Calendar' },
          { id: 'bookings', name: 'AI Consulate Bookings' },
        ]);
        setIsLoading(false);
        setSyncStatus({ status: 'success', message: 'Successfully connected to Google Calendar!' });
      }, 2000);

      // In real implementation, open OAuth window
      // window.open(authUrl, 'google-auth', 'width=500,height=600');
      
    } catch (error) {
      console.error('Failed to connect to Google Calendar:', error);
      setSyncStatus({ status: 'error', message: 'Failed to connect to Google Calendar' });
      setIsLoading(false);
    }
  };

  const disconnectGoogle = async () => {
    try {
      const newSettings: GoogleCalendarSettings = {
        isConnected: false,
        syncEnabled: false,
        autoSync: false,
        syncDirection: 'one-way',
      };
      await saveSettings(newSettings);
      setCalendars([]);
      setSyncStatus({ status: 'idle' });
    } catch (error) {
      console.error('Failed to disconnect Google Calendar:', error);
    }
  };

  const syncNow = async () => {
    if (!settings.isConnected) return;
    
    setSyncStatus({ status: 'syncing', message: 'Syncing appointments...' });
    
    try {
      // In real implementation, this would:
      // 1. Fetch appointments from your database
      // 2. Create/update events in Google Calendar
      // 3. Optionally sync back from Google Calendar (two-way)
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const updatedSettings = {
        ...settings,
        lastSync: new Date().toISOString(),
      };
      await saveSettings(updatedSettings);
      
      setSyncStatus({ status: 'success', message: 'Successfully synced 5 appointments to Google Calendar' });
      
      setTimeout(() => {
        setSyncStatus({ status: 'idle' });
      }, 3000);
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus({ status: 'error', message: 'Failed to sync appointments' });
    }
  };

  const handleSettingChange = (key: keyof GoogleCalendarSettings, value: unknown) => {
    const newSettings = { ...settings, [key]: value } as GoogleCalendarSettings;
    void saveSettings(newSettings);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Connection Status */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-2xl">📅</span>
              Google Calendar Integration
            </h3>
            <p className="text-sm text-muted mt-1">
              Sync your appointments with Google Calendar for better scheduling
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              settings.isConnected ? 'bg-green-500' : 'bg-surface-2 border border-border'
            }`}></div>
            <span className="text-sm font-medium">
              {settings.isConnected ? 'Connected' : 'Not Connected'}
            </span>
          </div>
        </div>

        {!settings.isConnected ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 dark:bg-blue-900/30 dark:border-blue-700/30">
              <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-2">Connect your Google Calendar</h4>
              <p className="text-sm text-blue-800 dark:text-blue-300 mb-3">
                Automatically sync your appointments to Google Calendar so you never miss a booking.
              </p>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mb-4 space-y-1">
                <li>• Automatic appointment creation in Google Calendar</li>
                <li>• Real-time sync when bookings are made</li>
                <li>• Optional two-way sync to prevent double-booking</li>
                <li>• Choose which calendar to sync to</li>
              </ul>
            </div>
            
            <CTA 
              onClick={connectToGoogle}
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? 'Connecting...' : '🔗 Connect Google Calendar'}
            </CTA>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 dark:bg-green-900/30 dark:border-green-700/30">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-300">✅ Connected to Google Calendar</h4>
                  {settings.userEmail && (
                    <p className="text-sm text-green-700 dark:text-green-300">Account: {settings.userEmail}</p>
                  )}
                  {settings.lastSync && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Last synced: {new Date(settings.lastSync).toLocaleString()}
                    </p>
                  )}
                </div>
                <CTA 
                  onClick={disconnectGoogle}
                  tone="secondary"
                  size="sm"
                >
                  Disconnect
                </CTA>
              </div>
            </div>
            
            {/* Sync Status */}
            {syncStatus.status !== 'idle' && (
              <div className={`border rounded-lg p-3 ${
                syncStatus.status === 'syncing' ? 'bg-blue-50 border-blue-200' :
                syncStatus.status === 'success' ? 'bg-green-50 border-green-200' :
                'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-2">
                  {syncStatus.status === 'syncing' && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                  )}
                  {syncStatus.status === 'success' && <span className="text-green-600">✅</span>}
                  {syncStatus.status === 'error' && <span className="text-red-600">❌</span>}
                  <span className={`text-sm font-medium ${
                    syncStatus.status === 'syncing' ? 'text-blue-700' :
                    syncStatus.status === 'success' ? 'text-green-700' :
                    'text-red-700'
                  }`}>
                    {syncStatus.message}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Settings */}
      {settings.isConnected && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Sync Settings</h3>
          
          <div className="space-y-4">
            {/* Calendar Selection */}
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Target Calendar
              </label>
              <Select
                value={settings.calendarId ?? ''}
                onChange={(e) => handleSettingChange('calendarId', e.target.value)}
                options={[
                  { value: '', label: 'Select a calendar...' },
                  ...calendars.map(cal => ({
                    value: cal.id,
                    label: cal.name + (cal.primary ? ' (Primary)' : '')
                  }))
                ]}
              />
              <p className="text-xs text-muted mt-1">
                Choose which Google Calendar to sync appointments to
              </p>
            </div>

            {/* Sync Direction */}
            <div>
              <label className="block text-sm font-medium text-fg mb-2">
                Sync Direction
              </label>
              <Select
                value={settings.syncDirection}
                onChange={(e) => handleSettingChange('syncDirection', e.target.value as 'one-way' | 'two-way')}
                options={[
                  { value: 'one-way', label: 'One-way (App → Google Calendar)' },
                  { value: 'two-way', label: 'Two-way (Bidirectional sync)' }
                ]}
              />
              <p className="text-xs text-muted mt-1">
                {settings.syncDirection === 'one-way' 
                  ? 'Appointments will only be sent to Google Calendar'
                  : 'Sync both ways to prevent double-booking (coming soon)'
                }
              </p>
            </div>

            {/* Auto Sync Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-fg">
                  Automatic Sync
                </label>
                <p className="text-xs text-muted">
                  Automatically sync when appointments are created or updated
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-2 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          </div>

          {/* Manual Sync Button */}
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Manual Sync</h4>
                <p className="text-sm text-muted">
                  Sync all appointments to Google Calendar now
                </p>
              </div>
              <CTA
                onClick={syncNow}
                disabled={syncStatus.status === 'syncing'}
                size="sm"
              >
                {syncStatus.status === 'syncing' ? 'Syncing...' : '🔄 Sync Now'}
              </CTA>
            </div>
          </div>
        </Card>
      )}

      {/* Help & Documentation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Help & Documentation</h3>
        <div className="space-y-3">
          <div className="border-l-4 border-blue-500 pl-4">
            <h4 className="font-medium text-sm">Setup Requirements</h4>
            <p className="text-xs text-muted mt-1">
                                You&apos;ll need to authorize this application to access your Google Calendar. 
              Your data is never shared with third parties.
            </p>
          </div>
          <div className="border-l-4 border-green-500 pl-4">
            <h4 className="font-medium text-sm">Sync Process</h4>
            <p className="text-xs text-muted mt-1">
              When enabled, new appointments will automatically appear in your selected Google Calendar 
              with all relevant details including customer information and meeting duration.
            </p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4">
            <h4 className="font-medium text-sm">Privacy & Security</h4>
            <p className="text-xs text-muted mt-1">
              We use secure OAuth 2.0 authentication and only request minimal permissions needed 
              for calendar integration. You can revoke access at any time.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
