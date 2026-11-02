import client from './client';

export const driversApi = {
  list: (params) => client.get('/drivers', { params }).then((r) => r.data.drivers),
  get: (id) => client.get(`/drivers/${id}`).then((r) => r.data.driver),
  create: (body) => client.post('/drivers', body).then((r) => r.data.driver),
  rate: (id, body) => client.post(`/drivers/${id}/rate`, body).then((r) => r.data.driver),
  verify: (id) => client.patch(`/drivers/${id}/verify`).then((r) => r.data.driver),
  reject: (id) => client.delete(`/drivers/${id}`).then((r) => r.data.driver),
};
