import client from './client';

const unwrapRide = (response) => response.data.ride;

export const ridesApi = {
  list: (params) => client.get('/rides', { params }).then((r) => r.data.rides),
  mine: () => client.get('/rides/my').then((r) => r.data.rides),
  suggestions: (params) => client.get('/rides/suggestions', { params }).then((r) => r.data.rides),
  get: (id) => client.get(`/rides/${id}`).then(unwrapRide),
  create: (body) => client.post('/rides', body).then(unwrapRide),
  join: (id) => client.post(`/rides/${id}/join`).then(unwrapRide),
  leave: (id) => client.post(`/rides/${id}/leave`).then(unwrapRide),
  cancel: (id) => client.post(`/rides/${id}/cancel`).then(unwrapRide),
  setDriver: (id, driverId) => client.patch(`/rides/${id}/driver`, { driverId }).then(unwrapRide),
  complete: (id, totalFare) => client.post(`/rides/${id}/complete`, { totalFare }).then(unwrapRide),
  setPayment: (id, userId, status) =>
    client.patch(`/rides/${id}/members/${userId}/payment`, { status }).then(unwrapRide),
  messages: (id) => client.get(`/rides/${id}/messages`).then((r) => r.data.messages),
};
