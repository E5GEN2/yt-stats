import { Reducer } from "react";
import { combineReducers } from "@reduxjs/toolkit";
import statsReducer, { StatsSelector } from "./statsReducer";

const appReducer = combineReducers({
  stats: statsReducer,
});

export { StatsSelector };

export type RootState = ReturnType<typeof appReducer>;

/**
 * Resets state on logout if needed
 *
 * @param {RootState} state - current action state dispatched from actions
 * @param {any} action - current action dispatched
 * @returns {Reducer<CombinedState>} returns combined state
 */
export const rootReducer = (state: RootState, action: any) => {
  return appReducer(state, action);
};

export default appReducer;
