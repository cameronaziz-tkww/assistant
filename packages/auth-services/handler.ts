import type { APIGatewayProxyHandler } from 'aws-lambda';
import * as handlers from './src/handlers';

export const githubOAuth: APIGatewayProxyHandler = handlers.github.oAuth;
export const jiraOAuth: APIGatewayProxyHandler = handlers.jira.oAuth;
export const jiraRefresh: APIGatewayProxyHandler = handlers.jira.refresh;