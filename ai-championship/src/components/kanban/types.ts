import { UniqueIdentifier } from '@dnd-kit/core';

export type ColumnId = 'Applied' | 'Screening' | 'Technical Interview' | 'HR Interview' | 'Offer' | 'Rejected' | 'Hired';

export type Task = {
  id: UniqueIdentifier;
  columnId: ColumnId;
  content: string;
  candidateName: string;
  jobTitle: string;
  fitScore: number;
  avatar?: string;
};

export type Column = {
  id: ColumnId;
  title: string;
};
