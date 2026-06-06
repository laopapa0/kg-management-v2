export interface NodeStyle {
  borderColor: string;
  bgColor: string;
}

export function getNodeStyle(role: string): NodeStyle {
  switch (role) {
    case 'root':
      return { borderColor: '#dc2626', bgColor: '#fef2f2' };
    case 'anomaly':
      return { borderColor: '#f59e0b', bgColor: '#fffbeb' };
    case 'affected':
      return { borderColor: '#7c5cfc', bgColor: '#f3f0ff' };
    case 'normal':
      return { borderColor: '#10b981', bgColor: '#ecfdf5' };
    default:
      return { borderColor: '#9ba4b3', bgColor: '#f8f9fb' };
  }
}
