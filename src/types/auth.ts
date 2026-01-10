export type UserRole = 'admin' | 'user';

export interface Permission {
  pages: {
    create: boolean;
    edit: boolean;
    delete: boolean;
    publish: boolean;
  };
  users: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  templates: {
    create: boolean;
    edit: boolean;
    delete: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
  };
  applications: {
    view: boolean;
    submit: boolean;
    edit: boolean;
  };
  reports: {
    view: boolean;
    generate: boolean;
  };
  payments: {
    view: boolean;
    manage: boolean;
  };
  allocations: {
    view: boolean;
    manage: boolean;
  };
}

