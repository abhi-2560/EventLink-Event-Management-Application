export function cn(...classes: unknown[]) {
  return classes.filter((value): value is string => typeof value === 'string' && Boolean(value)).join(' ');
}
