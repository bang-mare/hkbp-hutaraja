import React from 'react';
import type { EditorState } from '../../lib/types';
import { PublicPage } from '../PublicPage';

interface PhonePreviewProps {
  data: EditorState;
  onPreviewBlocked: () => void;
}

export const PhonePreview: React.FC<PhonePreviewProps> = ({
  data,
  onPreviewBlocked,
}) => {
  return (
    <div className="mare-phone-frame">
      <div className="mare-phone-notch" aria-hidden="true" />
      <div className="mare-phone-scroll">
        <PublicPage
          data={data}
          isPreview={true}
          onPreviewBlocked={onPreviewBlocked}
        />
      </div>
    </div>
  );
};
