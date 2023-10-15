import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { BSON } from "realm";
import * as SecureStore from "expo-secure-store";

export interface BookmarkStore {
  // bookmarked artifacts with their ids
  artifacts?: string[];
  // leave room for archaeological site
}

export interface BookmarkState {
  bookmarks?: BookmarkStore;
  updateState: (newState: Partial<BookmarkStore>) => void;

  setBookmark: (id?: string | BSON.ObjectId) => void;
}

const defaultState: BookmarkState = {
  bookmarks: { artifacts: [] },
  updateState: (state?: Partial<BookmarkStore>) => {},
  setBookmark: (id?: string | BSON.ObjectId) => {},
};

export const BookmarkContext = createContext<BookmarkState>(defaultState);
export const useBookmarks = () => useContext(BookmarkContext);

export function BookmarkProvider({ children }: { children: React.ReactNode }): JSX.Element {
  const [state, setState] = useState<BookmarkStore | undefined>();

  const updateState = (newState: Partial<BookmarkStore>) => {
    setState((state) => ({ ...state, ...newState }));
  };

  const setBookmark = async (id: string | BSON.ObjectId) => {
    const artifacts = state?.artifacts;
    const ID = typeof id === "string" ? id : id.toString();
    if (!artifacts) updateState({ artifacts: [ID] });
    else {
      const index = artifacts.indexOf(ID);
      if (index === -1) {
        updateState({ artifacts: [...artifacts, ID] });
      } else {
        updateState({ artifacts: artifacts.filter((_, idx) => index !== idx) });
      }
    }
  };

  const bookmarkContext: BookmarkState = { bookmarks: state, setBookmark, updateState };

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
    if (state) SecureStore.setItem("bookmarks", JSON.stringify(state));
  }, [state]);

  return <BookmarkContext.Provider value={bookmarkContext}>{children}</BookmarkContext.Provider>;
}
