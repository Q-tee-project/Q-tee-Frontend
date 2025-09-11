'use client';

import { useState } from 'react';

export const useDistribution = () => {
  const [isDistributeDialogOpen, setIsDistributeDialogOpen] = useState(false);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const mockRecipients = [
    {
      id: '1',
      name: '이윤진',
      school: '진건고등학교',
      level: '중등',
      grade: '1학년',
      classId: '1',
    },
    { id: '2', name: '김병천', school: '병천중학교', level: '중등', grade: '2학년', classId: '1' },
    {
      id: '3',
      name: '김보연',
      school: '보연고등학교',
      level: '고등',
      grade: '3학년',
      classId: '1',
    },
    { id: '4', name: '한광구', school: '광구중학교', level: '중등', grade: '1학년', classId: '1' },
    {
      id: '5',
      name: '최현범',
      school: '현범고등학교',
      level: '고등',
      grade: '2학년',
      classId: '1',
    },
  ];

  const filteredRecipients =
    selectedClasses.length > 0
      ? mockRecipients.filter((recipient) => selectedClasses.includes(recipient.classId))
      : mockRecipients;

  const handleClassSelect = (classId: string) => {
    const isCurrentlySelected = selectedClasses.includes(classId);

    if (isCurrentlySelected) {
      setSelectedClasses((prev) => prev.filter((id) => id !== classId));
      const classStudents = mockRecipients.filter((recipient) => recipient.classId === classId);
      setSelectedRecipients((prev) =>
        prev.filter((recipientId) => !classStudents.some((student) => student.id === recipientId)),
      );
    } else {
      setSelectedClasses((prev) => [...prev, classId]);
      const classStudents = mockRecipients.filter((recipient) => recipient.classId === classId);
      setSelectedRecipients((prev) => [
        ...prev,
        ...classStudents.map((student) => student.id).filter((id) => !prev.includes(id)),
      ]);
    }
  };

  const handleRecipientSelect = (recipientId: string) => {
    const recipient = mockRecipients.find((r) => r.id === recipientId);
    if (!recipient) return;

    const isCurrentlySelected = selectedRecipients.includes(recipientId);

    if (isCurrentlySelected) {
      setSelectedRecipients((prev) => prev.filter((id) => id !== recipientId));

      const classStudents = mockRecipients.filter((r) => r.classId === recipient.classId);
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

  const handleDistribute = () => {
    alert(
      `워크시트가 배포되었습니다.\n선택된 클래스: ${selectedClasses.length}개\n선택된 수신자: ${selectedRecipients.length}명`,
    );
    setIsDistributeDialogOpen(false);
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
  };
};