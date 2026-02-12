'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const templates = {
  interview_invite: {
    subject: 'Interview Invitation - {{jobTitle}}',
    body: 'Hi {{candidateName}},\n\nWe are pleased to invite you for an interview for the {{jobTitle}} position.\n\nBest regards,\n{{companyName}}',
  },
  rejection: {
    subject: 'Application Update - {{jobTitle}}',
    body: 'Hi {{candidateName}},\n\nThank you for your interest in {{jobTitle}}. Unfortunately, we have decided to move forward with other candidates.\n\nBest regards,\n{{companyName}}',
  },
  offer: {
    subject: 'Job Offer - {{jobTitle}}',
    body: 'Hi {{candidateName}},\n\nCongratulations! We are excited to offer you the {{jobTitle}} position.\n\nBest regards,\n{{companyName}}',
  },
};

export function EmailTemplateEditor() {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof templates>('interview_invite');
  const [subject, setSubject] = useState(templates.interview_invite.subject);
  const [body, setBody] = useState(templates.interview_invite.body);

  const handleTemplateChange = (value: keyof typeof templates) => {
    setSelectedTemplate(value);
    setSubject(templates[value].subject);
    setBody(templates[value].body);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Template Type</Label>
          <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interview_invite">Interview Invitation</SelectItem>
              <SelectItem value="rejection">Rejection</SelectItem>
              <SelectItem value="offer">Job Offer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Subject</Label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div>
          <Label>Body</Label>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={10}
            className="font-mono text-sm"
          />
        </div>

        <div className="text-xs text-muted-foreground">
          Available variables: {'{'}{'{'} candidateName {'}'}{'}'}, {'{'}{'{'} jobTitle {'}'}{'}'}, {'{'}{'{'} companyName {'}'}{'}'} 
        </div>

        <Button className="w-full">Save Template</Button>
      </CardContent>
    </Card>
  );
}


