"use client";

import { createContext, useContext } from "react";

interface MockContextValue {
  mocks: string[];
}

const MockContext = createContext<MockContextValue>({ mocks: [] });

export function MockProvider({
  mocks,
  children,
}: {
  mocks: string[];
  children: React.ReactNode;
}) {
  return (
    <MockContext.Provider value={{ mocks }}>
      {children}
    </MockContext.Provider>
  );
}

/** Hook to read active mocks in client components */
export function useMocks(): string[] {
  return useContext(MockContext).mocks;
}
