import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAnnouncementRepository } from '../../../hooks/useAnnouncementRepository';
import { Announcement } from '../../../models/announcement.model';
import { Card, CardHeader, CardContent, CardFooter } from '../../../components/ui2/card';
import { Button } from '../../../components/ui2/button';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '../../../components/ui2/alert-dialog';
import { Input } from '../../../components/ui2/input';
import { Badge } from '../../../components/ui2/badge';
import { Plus, Edit2, Trash2, Loader2, Bell, Calendar, CheckCircle2, XCircle, Search, Megaphone, Info } from 'lucide-react';
import { format } from 'date-fns';

function AnnouncementList() {
  const { useQuery, useDelete } = useAnnouncementRepository();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: result, isLoading } = useQuery({ order: { column: 'starts_at', ascending: false } });
  const announcements = result?.data || [];

  const deleteMutation = useDelete();

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this announcement?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err) {
        console.error('Error deleting announcement', err);
      }
    }
  };

  const isActive = (announcement: Announcement) => {
    try {
      const now = new Date();
      const startDate = announcement.starts_at ? new Date(announcement.starts_at) : null;
      const endDate = announcement.ends_at ? new Date(announcement.ends_at) : null;
    
      if (!startDate && !endDate) return announcement.active;
      if (startDate && !endDate) return announcement.active && now >= startDate;
      if (!startDate && endDate) return announcement.active && now <= endDate;
      return announcement.active && now >= startDate! && now <= endDate!;
    } catch (error) {
      console.error('Error checking announcement active status:', error);
      return false;
    }
  };
  
  const filtered = announcements.filter(a => a.message.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
              <Megaphone className="h-6 w-6 mr-2 text-primary" />
              Announcements
            </h1>
            <p className="mt-2 text-muted-foreground">
              Create and manage announcements for your church members.
            </p>
          </div>
          <Link to="add" className="self-start sm:self-auto">
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" /> New Announcement
            </Button>
          </Link>
        </div>
      
        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-start">
          <div className="w-full sm:max-w-xs">
            <Input
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search announcements..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex-1 text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'announcement' : 'announcements'} found
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6 h-48 flex flex-col justify-between">
                <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
                <div className="h-4 bg-muted rounded w-4/6 mb-6"></div>
                <div className="flex justify-between">
                  <div className="h-6 bg-muted rounded w-20"></div>
                  <div className="h-6 bg-muted rounded w-24"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filtered.length > 0 ? (
          filtered.map(announcement => (
            <Card key={announcement.id} className={`overflow-hidden transition-all duration-200 ${isActive(announcement) ? 'border-primary/50 shadow-md' : 'opacity-75'}`}>
              <CardContent className="p-6 relative">
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <Badge 
                    variant={isActive(announcement) ? 'success' : 'secondary'} 
                    className="flex items-center"
                  >
                    {isActive(announcement) ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                
                {/* Message */}
                <div className="mb-6 pr-20">
                  <p className="text-foreground whitespace-pre-line">{announcement.message}</p>
                </div>
                
                {/* Date range */}
                <div className="flex items-center text-sm text-muted-foreground mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {announcement.starts_at ? format(new Date(announcement.starts_at), 'MMM d, yyyy') : 'Any time'} 
                    {announcement.ends_at ? ` - ${format(new Date(announcement.ends_at), 'MMM d, yyyy')}` : ''}
                  </span>
                </div>
                
                {/* Actions */}
                <div className="flex justify-end gap-2 mt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => navigate(`${announcement.id}/edit`)}
                  >
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleDelete(announcement.id)} 
                    disabled={deleteMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No announcements found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm ? 'Try adjusting your search term' : 'Create your first announcement to keep members informed'}
                </p>
                <Link to="add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" /> New Announcement
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnnouncementList;