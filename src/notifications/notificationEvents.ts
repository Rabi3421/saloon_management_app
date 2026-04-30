type BookingEventPayload = { bookingId?: string; status?: string; raw?: Record<string, string> };

const listeners = new Set<(payload: BookingEventPayload) => void>();

export const bookingEventEmitter = {
  on(fn: (payload: BookingEventPayload) => void) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
  emit(payload: BookingEventPayload) {
    listeners.forEach((fn) => {
      try {
        fn(payload);
      } catch (e) {
        // ignore listener errors
      }
    });
  },
};

export default bookingEventEmitter;
