const check = async (token: string): Promise<boolean> => {
  const headers = new Headers();
  headers.append('Authorization', `Bearer ${token}`);

  const requestOptions: RequestInit = {
    headers,
    method: 'GET',
  };

  const url = `https://api.atlassian.com/oauth/token/accessible-resources`;
  try {
    const response = await fetch(
      url,
      requestOptions,
    );

    return response.status === 200;
  }
  catch (error) {
    return false;
  }
};

export default check;