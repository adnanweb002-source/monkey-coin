import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useReducer,
  useRef,
} from "react";
import type { Notification, NotificationsState } from "@/types/notification";
import {
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} from "@/lib/notificationApi";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { toast } from "@/hooks/use-toast";

const TAKE = 10;

type Action =
  | { type: "SET_LOADING"; payload: boolean }
  | {
      type: "SET_DATA";
      payload: {
        items: Notification[];
        total: number;
        unreadCount: number;
        append: boolean;
      };
    }
  | { type: "MARK_READ"; payload: number }
  | { type: "MARK_ALL_READ" }
  | { type: "ADD_REALTIME"; payload: Notification };

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  total: 0,
  isLoading: false,
};

function reducer(
  state: NotificationsState,
  action: Action,
): NotificationsState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_DATA":
      return {
        ...state,
        items: action.payload.append
          ? [...state.items, ...action.payload.items]
          : action.payload.items,
        total: action.payload.total,
        unreadCount: action.payload.unreadCount,
        isLoading: false,
      };
    case "MARK_READ":
      return {
        ...state,
        items: state.items.map((n) =>
          n.id === action.payload ? { ...n, isRead: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case "MARK_ALL_READ":
      return {
        ...state,
        items: state.items.map((n) => ({ ...n, isRead: true })),
        unreadCount: 0,
      };
    case "ADD_REALTIME": {
      if (state.items.some((n) => n.id === action.payload.id)) return state;
      return {
        ...state,
        items: [action.payload, ...state.items],
        total: state.total + 1,
        unreadCount: state.unreadCount + 1,
      };
    }
    default:
      return state;
  }
}

interface NotificationContextValue {
  state: NotificationsState;
  loadNotifications: (reset?: boolean) => Promise<void>;
  handleMarkAsRead: (id: number) => Promise<void>;
  handleMarkAllAsRead: () => Promise<void>;
  hasMore: boolean;
}

const NotificationContext = createContext<NotificationContextValue | null>(
  null,
);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const skipRef = useRef(0);
  const initializedRef = useRef(false);

  const loadNotifications = useCallback(async (reset = false) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const skip = reset ? 0 : skipRef.current;
      const res = await fetchNotifications(TAKE, skip);
      dispatch({
        type: "SET_DATA",
        payload: {
          items: res.data,
          total: res.total,
          unreadCount: res.unreadCount,
          append: !reset,
        },
      });
      skipRef.current = reset ? TAKE : skipRef.current + TAKE;
    } catch {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  const handleMarkAsRead = useCallback(async (id: number) => {
    try {
      await markAsRead(id);
      dispatch({ type: "MARK_READ", payload: id });
    } catch {
      // silent
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      dispatch({ type: "MARK_ALL_READ" });
    } catch {
      // silent
    }
  }, []);

  // Initial unread count fetch + WebSocket setup
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Fetch initial unread count
    fetchNotifications(1, 0)
      .then((res) => {
        dispatch({
          type: "SET_DATA",
          payload: {
            items: res.data,
            total: res.total,
            unreadCount: res.unreadCount,
            append: false,
          },
        });
        skipRef.current = 0; // will be set properly on first dropdown open
      })
      .catch(() => {});

    // WebSocket
    const socket = connectSocket();

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });

    console.log("NotificationContext mounted, WebSocket connected", socket);

    socket.on("notification", (payload: Notification) => {
      console.log("Received real-time notification:", payload);
      dispatch({ type: "ADD_REALTIME", payload });
      toast({
        title: payload.title,
        description: payload.description,
      });
    });

    return () => {
      disconnectSocket();
    };
  }, []);

  const hasMore = state.items.length < state.total;

  return (
    <NotificationContext.Provider
      value={{
        state,
        loadNotifications,
        handleMarkAsRead,
        handleMarkAllAsRead,
        hasMore,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error(
      "useNotifications must be used within NotificationProvider",
    );
  return ctx;
};
