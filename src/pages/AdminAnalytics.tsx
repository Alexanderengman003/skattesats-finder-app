
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsEvent {
  id: string;
  created_at: string;
  event_type: string;
  event_name: string;
  session_id: string;
  user_id?: string;
  page_url?: string;
  properties?: any;
  form_data?: any;
}

interface AnalyticsSession {
  id: string;
  session_start: string;
  user_id?: string;
  municipality?: string;
  country?: string;
  device_type?: string;
  browser?: string;
  page_views?: number;
  events_count?: number;
}

const AdminAnalytics = () => {
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [sessions, setSessions] = useState<AnalyticsSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'events' | 'sessions'>('events');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load recent events
      const { data: eventsData, error: eventsError } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (eventsError) throw eventsError;

      // Load recent sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('analytics_sessions')
        .select('*')
        .order('session_start', { ascending: false })
        .limit(100);

      if (sessionsError) throw sessionsError;

      setEvents(eventsData || []);
      setSessions(sessionsData || []);
    } catch (error) {
      console.error('Error loading analytics data:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('analytics_events')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEvents(events.filter(event => event.id !== id));
      toast.success('Event deleted successfully');
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
    }
  };

  const deleteSession = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session and all its events? This action cannot be undone.')) {
      return;
    }

    try {
      // First delete all events for this session
      const { error: eventsError } = await supabase
        .from('analytics_events')
        .delete()
        .eq('session_id', id);

      if (eventsError) throw eventsError;

      // Then delete the session
      const { error: sessionError } = await supabase
        .from('analytics_sessions')
        .delete()
        .eq('id', id);

      if (sessionError) throw sessionError;

      setSessions(sessions.filter(session => session.id !== id));
      setEvents(events.filter(event => event.session_id !== id));
      toast.success('Session and all related events deleted successfully');
    } catch (error) {
      console.error('Error deleting session:', error);
      toast.error('Failed to delete session');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="text-center py-8">Loading analytics data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <h3 className="font-medium text-yellow-800">Admin Access Required</h3>
          </div>
          <p className="text-yellow-700 mt-1">
            This page allows you to delete analytics data. Use with caution as deletions cannot be undone.
          </p>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'events' ? 'default' : 'outline'}
            onClick={() => setActiveTab('events')}
          >
            Events ({events.length})
          </Button>
          <Button
            variant={activeTab === 'sessions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sessions')}
          >
            Sessions ({sessions.length})
          </Button>
        </div>

        {activeTab === 'events' && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Events</CardTitle>
              <CardDescription>
                Individual events tracked in the system. Showing the most recent 100 events.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Event Name</TableHead>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Page URL</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(event.created_at)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{event.event_type}</Badge>
                        </TableCell>
                        <TableCell>{event.event_name}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {event.session_id.substring(0, 8)}...
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {event.page_url}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteEvent(event.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'sessions' && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Sessions</CardTitle>
              <CardDescription>
                User sessions in the system. Deleting a session will also delete all its events. Showing the most recent 100 sessions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Municipality</TableHead>
                      <TableHead>Country</TableHead>
                      <TableHead>Device</TableHead>
                      <TableHead>Browser</TableHead>
                      <TableHead>Page Views</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessions.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(session.session_start)}
                        </TableCell>
                        <TableCell>{session.municipality || '-'}</TableCell>
                        <TableCell>{session.country || '-'}</TableCell>
                        <TableCell>{session.device_type || '-'}</TableCell>
                        <TableCell>{session.browser || '-'}</TableCell>
                        <TableCell>{session.page_views || 0}</TableCell>
                        <TableCell>{session.events_count || 0}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteSession(session.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;
