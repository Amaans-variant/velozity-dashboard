import { useSearchParams } from 'react-router-dom';

// this is what makes the filter bar "shareable as a URL" per the brief.
// state literally lives in the address bar, nowhere else. no useState
// needed for the filter values themselves, which feels kinda illegal but
// its the correct way to do this
export function useTaskFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    status: searchParams.get('status') || undefined,
    priority: searchParams.get('priority') || undefined,
    dueBefore: searchParams.get('dueBefore') || undefined,
    dueAfter: searchParams.get('dueAfter') || undefined,
  };

  function setFilter(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  }

  return { filters, setFilter };
}
