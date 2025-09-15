import { ProblemType } from '@/types/math';

export const getProblemTypeInKorean = (type: string): string => {
  switch (type.toLowerCase()) {
    case ProblemType.MULTIPLE_CHOICE:
      return '객관식';
    case ProblemType.ESSAY:
      return '서술형';
    case ProblemType.SHORT_ANSWER:
      return '단답형';
    default:
      return type;
  }
};