import React, { useEffect, useState } from "react";
import { v4 } from "uuid";

export type TAtom<T> = {
  state: T,
  setState: React.Dispatch<React.SetStateAction<T>>
}

const bus = {
  channels: {} as Record<string, TAtom<any>>,
  subscribe: function<T> (
    channelName: string,
    state: T,
    callback: React.Dispatch<React.SetStateAction<T>>,
    key: string
  ) {
    if (!this.channels[channelName]) {
      this.channels[channelName] = {} as TAtom<T>;
    }
    this.channels[channelName][key as keyof TAtom<T>] = {
      state,
      setState: (nextState: T) => {
        callback(nextState);
        this.channels[channelName][key as keyof TAtom<T>].state = nextState;
      },
    };
  },
  unsubscribe: function<T> (key: string) {
    Object.keys(this.channels).forEach((channel: string) => {
      if (this.channels[channel][key as keyof TAtom<T>]) {
        delete this.channels[channel][key as keyof TAtom<T>];
      }
    });
  },
  // Changes state for subscribers escape issuer
  publish: function<T> (callback: Function, issuer: string, channelName: string) {
    const source = Object.assign({} as TAtom<T>, this.channels[channelName]);
    delete source[issuer as keyof TAtom<T>];
    callback(source);
  },
  // Gets state and callback for subscriber
  atom: function<T> (key: string): TAtom<T> {
    let atom = {} as TAtom<T>;
    Object.keys(this.channels).forEach((channel: string) => {
      if (this.channels[channel][key as keyof TAtom<T>]) {
        atom = this.channels[channel][key as keyof TAtom<T>];
      }
    });
    const setState = (nextState: any) => {
      atom.setState(nextState);
      atom.state = nextState;
    };
    return { state: atom.state, setState };
  },
};

export const useBusState = <T>(
  channelName: string,
  state: T,
  key: string = v4()
): [
    T,
    (callback: Function, channel: string) => void,
    () => TAtom<unknown>
  ] => {
  const [value, setState] = useState<T>(state);
  const [subscriber] = useState<string>(key);
  useEffect(() => {
    bus.subscribe(channelName, value, setState, subscriber);
    return () => {
      bus.unsubscribe(subscriber);
    };
  }, []);
  return [
    value,
    (callback: Function, channel: string) =>
      bus.publish(callback, subscriber, channel),
    () => bus.atom(subscriber),
  ];
};
