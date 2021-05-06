
export const defaultFilters: Storage.Github.SettingsStore['filters'] = [
  'status',
  'createdBy',
  'labels',
];

export const defaultReviewsRequired: Storage.Github.SettingsStore['reviewsRequired'] = 2;

export const defaultSettings: Required<Storage.Github.SettingsStore> = {
  reviewsRequired: defaultReviewsRequired,
  filters: defaultFilters,
};