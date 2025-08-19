export type Instruction = {
    _id: string;
    instruction: string;
    type: 'auto' | 'manual';
    active: boolean;
    merchantId?: string;
    relatedReplies?: string[];
    createdAt: string;
    updatedAt: string;
  };
  