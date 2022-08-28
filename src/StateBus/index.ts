import { useEffect, useState } from "react";
import { v4 } from "uuid";

const bus = {
  channels: {} as Record<string, any>,
  subscribe: function (
    channelName: string,
    state: any,
    callback: Function,
    key: string
  ) {
    if (!this.channels[channelName]) {
      this.channels[channelName] = {};
    }
    this.channels[channelName][key] = {
      state,
      setState: (nextState: any) => {
        callback(nextState);
        this.channels[channelName][key].state = nextState;
      },
    };
  },
  unsubscribe: function (key: string) {
    Object.keys(this.channels).forEach((channel: string) => {
      if (this.channels[channel][key]) {
        delete this.channels[channel][key];
      }
    });
  },
  // Changes state for subscribers escape issuer
  publish: function (callback: Function, issuer: string, channelName: string) {
    const source = Object.assign({}, this.channels[channelName]);
    delete source[issuer];
    callback(source);
  },
  // Gets state and callback for subscriber
  atom: function (key: string): Record<string, any> {
    let atom: Record<string, any> = {};
    Object.keys(this.channels).forEach((channel: string) => {
      if (this.channels[channel][key]) {
        atom = this.channels[channel][key];
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
  () => Record<string, any>
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
