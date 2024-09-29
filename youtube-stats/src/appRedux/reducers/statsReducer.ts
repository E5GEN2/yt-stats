import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IStats {
  _id?: string;
  email: string;
  password: string;
  recoveryEmail: string;
  recoveryPassword: string;
  channelLink: string;
  airtableToken: string;
  airtableLink: string;
  views?: string;
  subs?: string;
  videos?: string;
  isChannelId: boolean;
  username: string;
}

interface IStatsState {
  statsLoading: boolean;
  stats: null | IStats[];
  total: number;
}

const initialState: IStatsState = {
  stats: null,
  statsLoading: true,
  total: 0,
};

const statsSlice = createSlice({
  name: "stat",
  initialState: initialState,
  reducers: {
    getStatsSuccess: (
      state,
      { payload }: PayloadAction<{ stats: IStats[]; total: number }>
    ) => {
      state.statsLoading = false;
      state.stats = payload.stats;
      state.total = payload.total;
    },
    updateStatsSuccess: (state, { payload }: PayloadAction<IStats[]>) => {
      const updatedStatsMap = new Map(payload.map((stat) => [stat._id, stat]));

      // Update the state stats list, replacing only those that match by _id
      if (state.stats)
        state.stats = state.stats.map((stat) =>
          updatedStatsMap.has(stat._id) ? updatedStatsMap.get(stat._id)! : stat
        );
    },
    deleteTableSuccess: (state) => {
      return initialState;
    },
    deleteRowSuccess: (state, { payload }: PayloadAction<string>) => {
      if (state.stats) {
        state.stats = state.stats.filter((s) => s._id !== payload);
      }
    },
  },
});

export const {
  getStatsSuccess,
  updateStatsSuccess,
  deleteTableSuccess,
  deleteRowSuccess,
} = statsSlice.actions;

export default statsSlice.reducer;

/**
 * Exported selector for usage in components
 *
 * @param {Object<IStatsState>} state - The state of log
 * @param {IStatsState} state.stat - The state of log state
 * @returns {IStatsState} returns log state object
 */
export const StatsSelector = (state: { stat: IStatsState }): IStatsState => {
  console.log("state is ", state.stats);
  return state.stats;
};
