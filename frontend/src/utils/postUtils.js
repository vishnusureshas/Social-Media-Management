export const formatRelative = (dateIso) => {
  if (!dateIso) return '';
  const date = new Date(dateIso);
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const splitHashtags = (text = '') => {
  return text.split(/(\s+)/).map((part) => {
    if (/^#[a-zA-Z0-9_]+$/.test(part)) {
      return { isTag: true, value: part.slice(1), text: part };
    }
    return { isTag: false, text: part };
  });
};