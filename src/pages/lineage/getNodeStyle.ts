export interface NodeStyle {
  borderColor: string;
  bgColor: string;
}

export function getNodeStyle(role: string): NodeStyle {
  switch (role) {
    case 'root':
      return { borderColor: '#dc2626', bgColor: '#450a0a' };
    case 'anomaly':
      return { borderColor: '#f59e0b', bgColor: '#451a03' };
    case 'affected':
      return { borderColor: '#7c5cfc', bgColor: '#2e1065' };
    case 'normal':
      return { borderColor: '#10b981', bgColor: '#064e3b' };
    default:
      return { borderColor: '#9ba4b3', bgColor: '#1e293b' };
  }
}
