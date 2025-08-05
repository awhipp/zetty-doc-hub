import type { TemplateRegistry } from '../../types/template';
import GeneralTemplate from './GeneralTemplate';
import EffortTemplate from './EffortTemplate';

export const templateRegistry: TemplateRegistry = {
  'general': GeneralTemplate,
  'effort': EffortTemplate,
};

export const getTemplate = (templateName?: string) => {
  if (!templateName || !templateRegistry[templateName]) {
    return templateRegistry['general'];
  }
  return templateRegistry[templateName];
};

export const getAvailableTemplates = () => {
  return Object.keys(templateRegistry);
};