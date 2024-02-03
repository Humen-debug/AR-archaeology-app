import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

export interface BookmarkState {
  // bookmarked artifacts with their ids
  artifacts?: string[];
  // leave room for archaeological site
}

export interface BookmarkStore {
  bookmarks?: BookmarkState;
  updateState: (newState: Partial<BookmarkState>) => void;

  setBookmark: (id?: string) => void;
}

const defaultState: BookmarkStore = {
  bookmarks: { artifacts: [] },
  updateState: (state?: Partial<BookmarkState>) => {},
  setBookmark: (id?: string) => {},
};

export const BookmarkContext = createContext<BookmarkStore>(defaultState);
export const useBookmarks = () => useContext(BookmarkContext);

export function BookmarkProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = useState<BookmarkState | undefined>();

  const updateState = (newState: Partial<BookmarkState>) => {
    setState((state) => ({ ...state, ...newState }));
  };

  const setBookmark = async (id?: string) => {
    const artifacts = state?.artifacts;
    if (!id) return;
    if (!artifacts) updateState({ artifacts: [id] });
    else {
      const index = artifacts.indexOf(id);
      if (index === -1) {
        updateState({ artifacts: [...artifacts, id] });
      } else {
        updateState({ artifacts: artifacts.filter((_, idx) => index !== idx) });
      }
    }
  };

  const bookmarkContext: BookmarkStore = { bookmarks: state, setBookmark, updateState };

  // retrieve bookmarks from local storage
  useLayoutEffect(() => {
    var init = async () => {
      let res = await SecureStore.getItemAsync("bookmarks");
      if (res) {
        try {
          const obj = JSON.parse(res);
          updateState(obj);
        } catch (error) {
          console.log("cannot parse bookmarks");
          console.log(error);
        }
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (state) SecureStore.setItemAsync("bookmarks", JSON.stringify(state));
  }, [state]);

  return <BookmarkContext.Provider value={bookmarkContext}>{children}</BookmarkContext.Provider>;
}
