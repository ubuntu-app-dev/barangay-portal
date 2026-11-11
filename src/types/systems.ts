export type BentoCopy = {
  tag: string;
  title: string;
  text: string;
  chips?: string[];
};

export type AccessRole = {
  id: string;
  label: string;
  summary: string;
  barangay: boolean;
  municipal: boolean;
};
