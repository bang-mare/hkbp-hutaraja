import React from 'react';
import type { EditorState } from '../../lib/types';
import { PhonePreview } from './PhonePreview';

interface TabPratinjauProps {
  state: EditorState;
  onPreviewBlocked: () => void;
  onJumpToFooter?: () => void;
}

export const TabPratinjau: React.FC<TabPratinjauProps> = ({
  state,
  onPreviewBlocked,
  onJumpToFooter,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'var(--mu)',
          textAlign: 'center',
        }}
      >
        Pratinjau langsung. Ketuk link untuk menghitung klik.
      </p>
      <PhonePreview data={state} onPreviewBlocked={onPreviewBlocked} />
      {onJumpToFooter && (
        <button
          type="button"
          className="mare-btn-ghost mare-btn-sm"
          onClick={onJumpToFooter}
        >
          Ubah teks footer
        </button>
      )}
    </div>
  );
};
