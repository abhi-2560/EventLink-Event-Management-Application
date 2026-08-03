/** Build API search params from URL state — never send duplicate title+keyword. */
export interface EventSearchFilters extends Record<string, string | undefined> {
  title?: string;
  city?: string;
  category?: string;
  type?: string;
  date?: string;
  organizer?: string;
}

export function buildEventSearchFilters(params: EventSearchFilters): EventSearchFilters | null {
  const active: EventSearchFilters = {};
  if (params.title?.trim()) active.title = params.title.trim();
  if (params.city?.trim()) active.city = params.city.trim();
  if (params.category?.trim()) active.category = params.category.trim();
  if (params.type?.trim()) active.type = params.type.trim();
  if (params.date?.trim()) active.date = params.date.trim();
  if (params.organizer?.trim()) active.organizer = params.organizer.trim();
  return Object.keys(active).length ? active : null;
}

export function hasActiveEventFilters(filters: EventSearchFilters | null) {
  return filters !== null && Object.keys(filters).length > 0;
}
