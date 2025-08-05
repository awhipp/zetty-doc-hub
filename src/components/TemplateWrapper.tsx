import React from 'react';
import type { TemplateProps } from '../types/template';
import './TemplateWrapper.css';

interface TemplateWrapperProps {
  TemplateComponent: React.FC<TemplateProps>;
  templateProps: TemplateProps;
}

const TemplateWrapper: React.FC<TemplateWrapperProps> = ({ TemplateComponent, templateProps }) => {
  return (
    <div className="template-wrapper">
      <div className="template-content-container">
        <div className="template-main-content">
          <TemplateComponent {...templateProps} />
        </div>
      </div>
    </div>
  );
};

export default TemplateWrapper;