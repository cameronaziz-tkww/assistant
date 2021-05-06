import type { APIGatewayProxyResult } from 'aws-lambda';

const fourOhFour = (functionName: string, failed: string): APIGatewayProxyResult => ({
  statusCode: 404,
  body: JSON.stringify({ functionName, failed }),
});

export default fourOhFour;