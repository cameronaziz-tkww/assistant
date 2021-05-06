import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as services from '../services';
import fourOhFour from '../utils/fourOhFour';

export const oAuth: APIGatewayProxyHandler = async (event) => {
  const { queryStringParameters: params } = event;
  if (!params) {
    return fourOhFour('githubOAuth', 'params');
  }

  const { code, redirect } = params;
  if (!code || !redirect) {
    return fourOhFour('githubOAuth', 'params');
  }
  const auth = await services.oAuth.oAuth({ code, redirect }, false);

  return {
    statusCode: 200,
    body: JSON.stringify({ auth }),
  };
};