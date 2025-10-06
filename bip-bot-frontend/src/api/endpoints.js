export const Api = {
  createEvent: (title, createdBy, groupId) => [
    "/api/events",
    { title, createdBy, groupId },
  ],
  addSlot: (id, start, end) => [`/api/events/${id}/slots`, { start, end }],
  voteSlot: (id, userId, slotId, choice) => [
    `/api/events/${id}/vote-slot`,
    { userId, slotId, choice },
  ],
  createPoll: (id, question, choices) => [
    `/api/events/${id}/poll`,
    { question, choices },
  ],
  getPollChoices: (id) => `/api/events/${id}/poll-choices`,

  vote: (id, userId, choiceId) => [
    `/api/events/${id}/vote`,
    { userId, choiceId },
  ],
  expense: (id, userId, amount, notes, weight) => [
    `/api/events/${id}/expense`,
    { userId, amount, notes, weight },
  ],
  summary: (id) => `/api/events/${id}/summary`,
  remind: (id) => `/api/events/${id}/remind`,
  webhook: () => "/webhook/bip",
};
