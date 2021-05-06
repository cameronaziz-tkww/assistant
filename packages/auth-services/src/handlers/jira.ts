import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as services from '../services';
import fourOhFour from '../utils/fourOhFour';

export const oAuth: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters: params } = event;
  if (!params) {
    return fourOhFour('jiraOAuth', 'params');
  }

  const { code, redirect } = params;
  if (!code || !redirect) {
    return fourOhFour('jiraOAuth', 'params');
  }

  const auth = await services.oAuth.oAuth({ code, redirect }, true);
  const cloudIdResponse = auth ? await services.jira.cloudId(auth.accessToken) : undefined;
  const cloudId = cloudIdResponse ? cloudIdResponse[0] : undefined;

  return {
    statusCode: 200,
    body: JSON.stringify({ auth, cloudId }),
  };
};

export const refresh: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters: params } = event;
  if (!params || !params.refresh) {
    return fourOhFour('jiraRefresh', 'params');
  }

  const auth = await services.jira.refresh(params.refresh);

  return {
    statusCode: 200,
    body: JSON.stringify(auth),
  };
};
