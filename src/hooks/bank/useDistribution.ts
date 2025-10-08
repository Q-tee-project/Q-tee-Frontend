'use client';

import { useState } from 'react';

export interface Recipient {
  id: string;
  name: string;
  school: string;
  level: string;
  grade: string;
  classId: string;
}

interface UseDistributionProps {
  recipients?: Recipient[];
}

export const useDistribution = ({ recipients = [] }: UseDistributionProps = {}) => {
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const filteredRecipients =
    selectedClasses.length > 0
      ? recipients.filter((recipient) => selectedClasses.includes(recipient.classId))
      : recipients;

  const handleClassSelect = (classId: string) => {
    const isCurrentlySelected = selectedClasses.includes(classId);

    if (isCurrentlySelected) {
      setSelectedClasses((prev) => prev.filter((id) => id !== classId));
      const classStudents = recipients.filter((recipient) => recipient.classId === classId);
      setSelectedRecipients((prev) =>
        prev.filter((recipientId) => !classStudents.some((student) => student.id === recipientId)),
      );
    } else {
      setSelectedClasses((prev) => [...prev, classId]);
      const classStudents = recipients.filter((recipient) => recipient.classId === classId);
      setSelectedRecipients((prev) => [
        ...prev,
        ...classStudents.map((student) => student.id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleRecipientSelect = (recipientId: string) => {
    const recipient = recipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    const isCurrentlySelected = selectedRecipients.includes(recipientId);

    if (isCurrentlySelected) {
      setSelectedRecipients((prev) => prev.filter((id) => id !== recipientId));

      const classStudents = recipients.filter((r) => r.classId === recipient.classId);
      const remainingSelectedInClass = selectedRecipients.filter(
        (id) => id !== recipientId && classStudents.some((s) => s.id === id),
      );

      if (remainingSelectedInClass.length === 0) {
        setSelectedClasses((prev) => prev.filter((id) => id !== recipient.classId));
      }
    } else {
      setSelectedRecipients((prev) => [...prev, recipientId]);

      if (!selectedClasses.includes(recipient.classId)) {
        setSelectedClasses((prev) => [...prev, recipient.classId]);
      }
    }
  };

  const handleDistribute = (onDistribute?: (classIds: string[], recipientIds: string[]) => void) => {
    if (onDistribute) {
      onDistribute(selectedClasses, selectedRecipients);
    }
    setIsDistributeDialogOpen(false);
    setSelectedClasses([]);
    setSelectedRecipients([]);
  };

  const resetSelection = () => {
    setSelectedClasses([]);
    setSelectedRecipients([]);
  };

  return {
    isDistributeDialogOpen,
    setIsDistributeDialogOpen,
    selectedClasses,
    selectedRecipients,
    filteredRecipients,
    handleClassSelect,
    handleRecipientSelect,
    handleDistribute,
    resetSelection,
  };
};
