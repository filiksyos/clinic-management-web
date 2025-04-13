export type IAdminFilterRequest = {
  name?: string | undefined;
  email?: string | undefined;
  contactNumber?: string | undefined;
  searchTerm?: string | undefined;
};

export type IAdminFilters = {
  searchTerm?: string;
  email?: string;
  contactNumber?: string;
  isDeleted?: boolean;
};
