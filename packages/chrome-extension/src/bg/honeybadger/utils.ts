export const isErrorResponse = <T extends string, U, V>(response: API.Jira.Response<T, U, V>): response is API.Jira.ErrorResponse =>
  !!(response as API.Jira.ErrorResponse).errors;

export type ReactorEvent = 'send-data' | 'new-saved-sprints' | 'meta-request' | 'meta-response';