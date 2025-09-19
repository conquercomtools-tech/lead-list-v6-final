export const getInitials = (first?: string, last?: string, fallbackName?: string): string => {
  const name = `${first ?? ''} ${last ?? ''}`.trim() || (fallbackName ?? '');
  const parts = name.split(/\s+/).filter(Boolean);
  return (parts[0]?.[0] ?? '').concat(parts[1]?.[0] ?? '').toUpperCase() || '•';
};