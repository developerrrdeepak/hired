
'use client';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { PlusCircle, Star, Search, Bookmark, Mail, Sparkles, UserPlus, FileText, MapPin, Briefcase, Check, X, Download } from 'lucide-react';
import Link from 'next/link';
import { DataTable } from '@/components/data-table';
import type { Candidate, Application, Job } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, arrayUnion, addDoc, writeBatch } from 'firebase/firestore';
import { useMemo, useState, useEffect } from 'react';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';
import { useUserContext } from '../layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';
import { exportCandidatesToExcel } from '@/lib/export-utils';

type CandidateWithAppInfo = Candidate & {
  jobTitle?: string;
  stage?: string;
  fitScore?: number;
  isShortlisted?: boolean;
};

export default function CandidatesPage() {
    const router = useRouter();
    const { firestore } = useFirebase();
    const { organizationId, isUserLoading, userId, displayName, role } = useUserContext();
    const { toast } = useToast();

    const [mounted, setMounted] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'cards'>('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const [skillFilter, setSkillFilter] = useState('');
    const [experienceFilter, setExperienceFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [showShortlisted, setShowShortlisted] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState<CandidateWithAppInfo | null>(null);
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [selectedJobForInvite, setSelectedJobForInvite] = useState('');
    const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

    useEffect(() => {
      const t = setTimeout(() => setMounted(true), 10);
      return () => clearTimeout(t);
    }, []);

    const columns: {
      id: string;
      header?: ({ table }: any) => JSX.Element;
      cell?: ({ row }: { row: { original: CandidateWithAppInfo, getIsSelected: () => boolean, toggleSelected: (value: boolean) => void } }) => JSX.Element;
      accessorKey?: keyof CandidateWithAppInfo;
      enableSorting?: boolean;
    }[] = [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
              const allIds = table.getRowModel().rows.map((row: any) => row.original.id);
              setSelectedCandidates(value ? allIds : []);
            }}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
                row.toggleSelected(!!value);
                setSelectedCandidates(prev => 
                    value ? [...prev, row.original.id] : prev.filter(id => id !== row.original.id)
                );
            }}
            aria-label="Select row"
          />
        ),
      },
      {
        id: 'candidate',
        accessorKey: 'name',
        header: 'Candidate',
        enableSorting: true,
        cell: ({ row }) => (
            <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={placeholderImages.find(p => p.id === 'avatar-2')?.imageUrl} data-ai-hint="person face" />
                    <AvatarFallback>{row.original.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-semibold">{row.original.name}</div>
                    <div className="text-sm text-muted-foreground">{row.original.email}</div>
                </div>
            </div>
        ),
      },
      {
        id: 'appliedFor',
        accessorKey: 'jobTitle',
        header: 'Applied For',
        enableSorting: true,
        cell: ({ row }) => row.original.jobTitle ? row.original.jobTitle : <span className="text-muted-foreground">-</span>,
      },
      {
        id: 'stage',
        accessorKey: 'stage',
        header: 'Current Stage',
        cell: ({ row }) => {
            if (!row.original.stage) return <span className="text-muted-foreground">-</span>;
            return <Badge variant="secondary">{row.original.stage}</Badge>;
        },
      },
      {
        id: 'fitScore',
        accessorKey: 'fitScore',
        header: 'Fit Score',
        enableSorting: true,
        cell: ({ row }) => (row.original.fitScore ? <div className="flex items-center gap-1 font-semibold">{row.original.fitScore} <Star className="w-4 h-4 text-amber-400 fill-amber-400" /></div> : <span className="text-muted-foreground">-</span>),
      },
      {
          id: 'lastUpdated',
          accessorKey: 'updatedAt',
          header: 'Last Updated',
          enableSorting: true,
          cell: ({ row }) => new Date(row.original.updatedAt).toLocaleDateString(),
      }
    ];

    // Query real candidates from Firestore
    const candidatesQuery = useMemoFirebase(() => {
        if (!firestore || !organizationId) return null;
        return query(
            collection(firestore, `organizations/${organizationId}/candidates`),
            orderBy('updatedAt', 'desc')
        );
    }, [firestore, organizationId]);

    const { data: candidates, isLoading: isLoadingCandidates } = useCollection<any>(candidatesQuery);

    const [applicationsByCandidate, setApplicationsByCandidate] = useState<Map<string, Application>>(new Map());
    const [isLoadingApps, setIsLoadingApps] = useState(true);

     useEffect(() => {
        if (!firestore || !organizationId) {
            setIsLoadingApps(false);
            return;
        };

        const fetchApplications = async () => {
            setIsLoadingApps(true);
            const newAppMap = new Map<string, Application>();
            
            const appsQuery = query(
                collection(firestore, `organizations/${organizationId}/applications`)
            );

            try {
                const querySnapshot = await getDocs(appsQuery);
                querySnapshot.forEach(doc => {
                    const app = { ...doc.data(), id: doc.id } as Application;
                    const existingApp = newAppMap.get(app.candidateId);
                     if (!existingApp || new Date(app.updatedAt) > new Date(existingApp.updatedAt)) {
                        newAppMap.set(app.candidateId, app);
                    }
                });
            } catch (e) {
                console.error("Error fetching applications for candidates:", e);
            }
            
            setApplicationsByCandidate(newAppMap);
            setIsLoadingApps(false);
        };

        fetchApplications();

    }, [firestore, organizationId]);


    const jobsQuery = useMemoFirebase(() => {
        if (!organizationId || !firestore) return null;
        return query(collection(firestore, `organizations/${organizationId}/jobs`));
    }, [organizationId, firestore]);

    const { data: jobs, isLoading: isLoadingJobs } = useCollection<Job>(jobsQuery);
    
    const candidatesWithInfo: CandidateWithAppInfo[] = useMemo(() => {
        if (!candidates) return [];
        if (!jobs && isLoadingJobs) return candidates.map(c => ({ ...c, isShortlisted: false })); 

        const jobsMap = new Map(jobs?.map(job => [job.id, job]));

        return candidates.map(candidate => {
            const application = applicationsByCandidate.get(candidate.id);
            const job = application ? jobsMap.get(application.jobId) : undefined;
            return {
                ...candidate,
                name: candidate.displayName || candidate.name || 'Unknown',
                email: candidate.email || '',
                currentRole: candidate.currentRole || candidate.role || '',
                location: candidate.location || '',
                skills: candidate.skills || [],
                yearsOfExperience: candidate.yearsOfExperience || 0,
                jobTitle: job?.title,
                stage: application?.stage,
                fitScore: application?.fitScore,
                isShortlisted: candidate.isShortlisted || false,
                updatedAt: candidate.updatedAt || candidate.createdAt || new Date().toISOString(),
            };
        });
    }, [candidates, applicationsByCandidate, jobs, isLoadingJobs]);

    const filteredCandidates = useMemo(() => {
        return candidatesWithInfo.filter(candidate => {
            const matchesSearch = searchTerm.toLowerCase() 
                ? candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  candidate.currentRole?.toLowerCase().includes(searchTerm.toLowerCase())
                : true;
            
            const matchesSkill = skillFilter
                ? candidate.skills?.some(s => s.toLowerCase().includes(skillFilter.toLowerCase()))
                : true;
            
            const matchesExperience = experienceFilter !== 'all'
                ? (() => {
                    const exp = candidate.yearsOfExperience || 0;
                    if (experienceFilter === '0-2') return exp <= 2;
                    if (experienceFilter === '3-5') return exp >= 3 && exp <= 5;
                    if (experienceFilter === '6-10') return exp >= 6 && exp <= 10;
                    if (experienceFilter === '10plus') return exp > 10;
                    return true;
                  })()
                : true;
            
            const matchesLocation = locationFilter !== 'all'
                ? candidate.location?.toLowerCase().includes(locationFilter.toLowerCase())
                : true;
            
            const matchesShortlist = showShortlisted ? candidate.isShortlisted : true;
            
            return matchesSearch && matchesSkill && matchesExperience && matchesLocation && matchesShortlist;
        });
    }, [candidatesWithInfo, searchTerm, skillFilter, experienceFilter, locationFilter, showShortlisted]);

    const topMatchedCandidates = useMemo(() => {
        return [...filteredCandidates]
            .filter(c => c.fitScore)
            .sort((a, b) => (b.fitScore || 0) - (a.fitScore || 0))
            .slice(0, 10);
    }, [filteredCandidates]);

    const allSkills = useMemo(() => {
        const skills = new Set<string>();
        candidates?.forEach(c => c.skills?.forEach(s => skills.add(s)));
        return Array.from(skills);
    }, [candidates]);

    const allLocations = useMemo(() => {
        const locations = new Set<string>();
        candidates?.forEach(c => c.location && locations.add(c.location));
        return Array.from(locations);
    }, [candidates]);

    const handleBulkShortlist = async (shortlist: boolean) => {
        if (!firestore || selectedCandidates.length === 0) return;
        const batch = writeBatch(firestore);
        selectedCandidates.forEach(id => {
            const docRef = doc(firestore, 'users', id);
            batch.update(docRef, { isShortlisted: shortlist, updatedAt: new Date().toISOString() });
        });

        try {
            await batch.commit();
            toast({
                title: `Candidates ${shortlist ? 'shortlisted' : 'removed from shortlist'}`,
                description: `${selectedCandidates.length} candidates have been updated.`,
            });
            setSelectedCandidates([]);
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to update candidates.",
            });
        }
    };
    
    const handleInviteToApply = async () => {
        if (!firestore || !organizationId || !selectedCandidate || !selectedJobForInvite) return;
        try {
            await updateDoc(doc(firestore, `users`, selectedCandidate.id), {
                notifications: arrayUnion({
                    id: `invite-${Date.now()}`,
                    type: 'job_invite',
                    message: `You've been invited to apply for ${jobs?.find(j => j.id === selectedJobForInvite)?.title}`,
                    jobId: selectedJobForInvite,
                    timestamp: new Date().toISOString(),
                    read: false,
                })
            });
            toast({
                title: "Invitation sent",
                description: `${selectedCandidate.name} has been invited to apply.`,
            });
            setInviteDialogOpen(false);
            setSelectedCandidate(null);
            setSelectedJobForInvite('');
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to send invitation.",
            });
        }
    };

    const handleRowClick = (row: CandidateWithAppInfo) => {
        router.push(`/candidates/${row.id}`);
    };
    
    const isLoading = isUserLoading || isLoadingCandidates || isLoadingApps || isLoadingJobs;

  return (
    <div className={`transform transition-all duration-300 ease-out ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <PageHeader
        title="Talent Pool"
        description="Connect with qualified candidates."
      >
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => exportCandidatesToExcel(filteredCandidates)}
            disabled={filteredCandidates.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>
          <Button variant="outline" onClick={() => setViewMode(viewMode === 'cards' ? 'table' : 'cards')}>
            {viewMode === 'cards' ? 'Table View' : 'Card View'}
          </Button>
          <Button asChild>
            <Link href="/candidates/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Candidate
            </Link>
          </Button>
        </div>
      </PageHeader>

      {selectedCandidates.length > 0 && (
        <div className="my-4 p-3 rounded-lg bg-muted flex items-center justify-between">
            <p className="text-sm font-medium">{selectedCandidates.length} candidate{selectedCandidates.length > 1 ? 's' : ''} selected</p>
            <div className="flex gap-2">
                <Button size="sm" onClick={() => handleBulkShortlist(true)}>
                    <Check className="mr-2 h-4 w-4" />
                    Shortlist
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkShortlist(false)}>
                    <X className="mr-2 h-4 w-4" />
                    Remove from Shortlist
                </Button>
            </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 mt-6">
        <aside className="w-full lg:w-1/4 lg:min-w-[280px] space-y-4">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div>
                <Label>Skills</Label>
                <Select value={skillFilter || 'all-skills'} onValueChange={(v) => setSkillFilter(v === 'all-skills' ? '' : v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Skills" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-skills">All Skills</SelectItem>
                    {allSkills.map(skill => <SelectItem key={skill} value={skill}>{skill}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Experience</Label>
                <Select value={experienceFilter || 'all'} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10plus">10+ years</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Location</Label>
                <Select value={locationFilter || 'all'} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {allLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Label htmlFor="shortlisted">Shortlisted Only</Label>
                <input
                  id="shortlisted"
                  type="checkbox"
                  checked={showShortlisted}
                  onChange={(e) => setShowShortlisted(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setSearchTerm('');
                  setSkillFilter('');
                  setExperienceFilter('all');
                  setLocationFilter('all');
                  setShowShortlisted(false);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Smart Matches
              </CardTitle>
              <CardDescription>Ranked by AI Fit Score</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {topMatchedCandidates.slice(0, 5).map((candidate, idx) => (
                <div
                  key={candidate.id}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => router.push(`/candidates/${candidate.id}`)}
                >
                  <Badge variant="secondary" className="w-6 h-6 flex items-center justify-center p-0">
                    {idx + 1}
                  </Badge>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={placeholderImages.find(p => p.id === 'avatar-2')?.imageUrl} />
                    <AvatarFallback>{candidate.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{candidate.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{candidate.currentRole}</p>
                  </div>
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-700 bg-amber-50">
                    {candidate.fitScore}%
                  </Badge>
                </div>
              ))}
              {topMatchedCandidates.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No scored candidates yet</p>
              )}
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1">
          {viewMode === 'cards' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredCandidates.map((candidate, i) => (
                <Card key={candidate.id} className="hover:shadow-md transition-shadow group flex flex-col h-full relative">
                  <div className="absolute top-2 right-2 z-10">
                    <Checkbox
                        className="h-5 w-5 bg-white"
                        checked={selectedCandidates.includes(candidate.id)}
                        onCheckedChange={(value) => {
                            setSelectedCandidates(prev => 
                                value ? [...prev, candidate.id] : prev.filter(id => id !== candidate.id)
                            );
                        }}
                    />
                  </div>
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 border border-border">
                        <AvatarImage src={placeholderImages.find(p => p.id === 'avatar-2')?.imageUrl} />
                        <AvatarFallback>{candidate.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base truncate cursor-pointer hover:text-primary transition-colors" onClick={() => router.push(`/candidates/${candidate.id}`)}>
                          {candidate.name}
                        </CardTitle>
                        <CardDescription className="text-sm truncate flex items-center gap-1">
                           <Briefcase className="w-3 h-3" />
                           {candidate.currentRole || 'Open to work'}
                        </CardDescription>
                      </div>
                      {candidate.fitScore && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-amber-50 text-amber-700 border-amber-200">
                          {candidate.fitScore} <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3 space-y-3 flex-1">
                    {candidate.location && <p className="text-sm flex items-center gap-2 text-muted-foreground"><MapPin className="w-3 h-3" /> {candidate.location}</p>}
                    {candidate.yearsOfExperience && <p className="text-sm flex items-center gap-2 text-muted-foreground"><Briefcase className="w-3 h-3" /> {candidate.yearsOfExperience} years exp</p>}
                    
                    {candidate.skills && candidate.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {candidate.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary" className="text-xs font-normal">{skill}</Badge>
                        ))}
                        {candidate.skills.length > 3 && <Badge variant="secondary" className="text-xs font-normal">+{candidate.skills.length - 3}</Badge>}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-3 border-t bg-muted/20">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => router.push(`/public-profile/${candidate.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" /> Profile
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={async () => {
                        if (!firestore || !userId) return;
                        try {
                          const convRef = await addDoc(collection(firestore, 'conversations'), {
                            participants: [
                              { id: userId, name: displayName, role: role },
                              { id: candidate.id, name: candidate.name, role: 'Candidate' }
                            ],
                            participantIds: [userId, candidate.id],
                            lastMessage: '',
                            lastMessageAt: new Date().toISOString(),
                            unreadCount: {},
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          });
                          router.push(`/messages?convId=${convRef.id}`);
                        } catch (error){
                          console.error(error);
                        }
                      }}
                    >
                      <Mail className="h-4 w-4 mr-2" /> Message
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <DataTable columns={columns} data={filteredCandidates} searchKey="name" onRowClick={handleRowClick} />
            </div>
          )}
          
          {filteredCandidates.length === 0 && !isLoading && (
            <div className="text-center py-16 px-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserPlus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No candidates found</h3>
              <p className="text-muted-foreground mb-4">No candidates match your current filters. Try adjusting them.</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setSkillFilter('');
                setExperienceFilter('all');
                setLocationFilter('all');
                setShowShortlisted(false);
              }}>
                Clear all filters
              </Button>
            </div>
          )}
        </main>
      </div>

      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite to Apply</DialogTitle>
            <DialogDescription>
              Invite {selectedCandidate?.name} to apply for a job opening.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label>Select Job</Label>
            <Select value={selectedJobForInvite} onValueChange={setSelectedJobForInvite}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a job" />
              </SelectTrigger>
              <SelectContent>
                {jobs?.filter(j => j.status === 'open').map(job => (
                  <SelectItem key={job.id} value={job.id}>{job.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleInviteToApply} disabled={!selectedJobForInvite}>
              <Mail className="mr-2 h-4 w-4" />
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
