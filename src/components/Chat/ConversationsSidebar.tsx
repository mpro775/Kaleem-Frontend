import { Tabs, Tab } from '@mui/material';
import type { ChannelType } from '../../types/chat';
import type { FC } from 'react';

const channels: Array<{ label: string; value: '' | ChannelType; color?: string }> = [
  { label: 'الكل', value: '' },
  { label: 'واتساب', value: 'whatsapp', color: '#25D366' },
  { label: 'تيليجرام', value: 'telegram', color: '#229ED9' },
  { label: 'ويب شات', value: 'webchat', color: '#805ad5' },
];

interface Props {
  selectedChannel: '' | ChannelType;
  setChannel: (c: '' | ChannelType) => void;
}
const ConversationsSidebar: FC<Props> = ({ selectedChannel, setChannel }) => (
  <Tabs
    value={selectedChannel}
    onChange={(_, v) => setChannel(v)}
    variant="scrollable"
    orientation="horizontal"
  >
    {channels.map((ch) => (
      <Tab label={ch.label} value={ch.value} key={ch.value} sx={{ color: ch.color || undefined }} />
    ))}
  </Tabs>
);

export default ConversationsSidebar;
