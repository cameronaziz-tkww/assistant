declare namespace API {
  namespace Honeybadger {
    interface Fault {
      action: null | string;
      assignee: null | unknown;
      comments_count: number;
      component: null | unknown;
      created_at: string;
      deploy: null | unknown;
      environment: string;
      id: number
      ignored: boolean;
      klass: string;
      last_notice_at: string;
      message: string;
      notices_count: number;
      project_id: number;
      resolved: boolean;
      tags: unknown[]
      url: string;

    }
  }
}