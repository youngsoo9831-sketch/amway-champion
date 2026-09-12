import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { memberApi } from "../api/member";
import { ApiError } from "../api/client";
import type { Member } from "../types";

interface MemberAuthContextValue {
  member: Member | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const MemberAuthContext = createContext<MemberAuthContextValue | undefined>(
  undefined
);

export function MemberAuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    memberApi
      .me()
      .then((data) => {
        if (active) setMember(data);
      })
      .catch(() => {
        if (active) setMember(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await memberApi.login(email, password);
    setMember(data);
  }, []);

  const register = useCallback(
    async (email: string, name: string, password: string) => {
      const data = await memberApi.register(email, name, password);
      setMember(data);
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await memberApi.logout();
    } catch (err) {
      if (!(err instanceof ApiError)) throw err;
    } finally {
      setMember(null);
    }
  }, []);

  const value = useMemo(
    () => ({ member, isLoading, login, register, logout }),
    [member, isLoading, login, register, logout]
  );

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
}

export function useMemberAuth() {
  const ctx = useContext(MemberAuthContext);
  if (!ctx) {
    throw new Error(
      "useMemberAuth는 MemberAuthProvider 내부에서 사용해야 합니다."
    );
  }
  return ctx;
}
