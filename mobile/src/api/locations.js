import client from './client';

export const locationsApi = {
  list: () => client.get('/locations').then((r) => r.data.locations),
};
