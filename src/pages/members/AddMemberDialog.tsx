import React from 'react';
import { useForm } from 'react-hook-form';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '../../components/ui2/dialog';
import { Button } from '../../components/ui2/button';
import { Input } from '../../components/ui2/input';
import { Textarea } from '../../components/ui2/textarea';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage
} from '../../components/ui2/form';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '../../components/ui2/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui2/tabs';
import { useMemberRepository } from '../../hooks/useMemberRepository';
import { categoryUtils } from '../../utils/categoryUtils';
import type { Member } from '../../models/member.model';

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormValues {
  first_name: string;
  middle_name: string;
  last_name: string;
  preferred_name: string;
  gender: 'male' | 'female' | 'other';
  marital_status: 'single' | 'married' | 'widowed' | 'divorced';
  birthday: string;
  membership_type_id: string;
  membership_status_id: string;
  membership_date: string;
  baptism_date: string;
  envelope_number: string;
  email: string;
  contact_number: string;
  address: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  leadership_position: string;
  ministries: string;
  small_groups: string;
  volunteer_roles: string;
  spiritual_gifts: string;
  ministry_interests: string;
  attendance_rate: string;
  last_attendance_date: string;
  pastoral_notes: string;
  prayer_requests: string;
}

const splitCsv = (str: string): string[] =>
  str
    ? str
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    : [];

const splitLines = (str: string): string[] =>
  str
    ? str
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
    : [];

export default function AddMemberDialog({ open, onOpenChange }: AddMemberDialogProps) {
  const form = useForm<FormValues>({
    defaultValues: {
      first_name: '',
      middle_name: '',
      last_name: '',
      preferred_name: '',
      gender: 'male',
      marital_status: 'single',
      birthday: '',
      membership_type_id: '',
      membership_status_id: '',
      membership_date: '',
      baptism_date: '',
      envelope_number: '',
      email: '',
      contact_number: '',
      address: '',
      emergency_contact_name: '',
      emergency_contact_phone: '',
      leadership_position: '',
      ministries: '',
      small_groups: '',
      volunteer_roles: '',
      spiritual_gifts: '',
      ministry_interests: '',
      attendance_rate: '',
      last_attendance_date: '',
      pastoral_notes: '',
      prayer_requests: ''
    }
  });

  const { useCreate } = useMemberRepository();
  const createMutation = useCreate();

  const { data: membershipTypes } = useQuery({
    queryKey: ['categories', 'membership'],
    queryFn: () => categoryUtils.getCategories('membership')
  });

  const { data: membershipStatuses } = useQuery({
    queryKey: ['categories', 'member_status'],
    queryFn: () => categoryUtils.getCategories('member_status')
  });

  const membershipTypeOptions = React.useMemo(
    () =>
      (membershipTypes || []).map(t => ({ value: t.id, label: t.name })),
    [membershipTypes]
  );

  const membershipStatusOptions = React.useMemo(
    () =>
      (membershipStatuses || []).map(s => ({ value: s.id, label: s.name })),
    [membershipStatuses]
  );

  const [activeTab, setActiveTab] = React.useState('basic');

  const onSubmit = async (values: FormValues) => {
    const data: Partial<Member> = {
      first_name: values.first_name,
      middle_name: values.middle_name || undefined,
      last_name: values.last_name,
      preferred_name: values.preferred_name || undefined,
      gender: values.gender,
      marital_status: values.marital_status,
      birthday: values.birthday || null,
      membership_type_id: values.membership_type_id || null,
      membership_status_id: values.membership_status_id || null,
      membership_date: values.membership_date || null,
      baptism_date: values.baptism_date || null,
      envelope_number: values.envelope_number || null,
      email: values.email || null,
      contact_number: values.contact_number,
      address: values.address,
      emergency_contact_name: values.emergency_contact_name || null,
      emergency_contact_phone: values.emergency_contact_phone || null,
      leadership_position: values.leadership_position || null,
      ministries: splitCsv(values.ministries),
      small_groups: splitCsv(values.small_groups),
      volunteer_roles: splitCsv(values.volunteer_roles),
      spiritual_gifts: splitCsv(values.spiritual_gifts),
      ministry_interests: splitCsv(values.ministry_interests),
      attendance_rate: values.attendance_rate ? Number(values.attendance_rate) : undefined,
      last_attendance_date: values.last_attendance_date || null,
      pastoral_notes: values.pastoral_notes || null,
      prayer_requests: splitLines(values.prayer_requests)
    };

    await createMutation.mutateAsync({ data, fieldsToRemove: ['membership_type', 'membership_status'] });
    onOpenChange(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw] sm:w-full sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="contact">Contact</TabsTrigger>
                <TabsTrigger value="ministry">Ministry</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="middle_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="preferred_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preferred Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marital_status"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Marital Status</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single</SelectItem>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthday"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Birthday</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="membership_type_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Type</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              {membershipTypeOptions.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="membership_status_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              {membershipStatusOptions.map(o => (
                                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="membership_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Membership Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="baptism_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Baptism Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="envelope_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Envelope Number</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="contact" className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contact_number"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address"
                    rules={{ required: 'Required' }}
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[80px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergency_contact_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Emergency Contact Phone</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="ministry" className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="leadership_position"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leadership Position</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ministries"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ministries (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="small_groups"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Small Groups (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="volunteer_roles"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Volunteer Roles (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="spiritual_gifts"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Spiritual Gifts (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="ministry_interests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ministry Interests (comma separated)</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="attendance_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Attendance Rate</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_attendance_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Attendance</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>
              <TabsContent value="notes" className="pt-4 space-y-4">
                <FormField
                  control={form.control}
                  name="pastoral_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pastoral Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prayer_requests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prayer Requests (one per line)</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px]" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
