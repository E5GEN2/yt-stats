import { createAsyncThunk } from "@reduxjs/toolkit";

import {
  deleteRowSuccess,
  deleteTableSuccess,
  getStatsSuccess,
  updateStatsSuccess,
} from "../reducers/statsReducer";
import axios from "axios";

export const BackendInstance = axios.create({
  baseURL: `http://localhost:7543/api/`,
  withCredentials: true,
});

export const getStats = createAsyncThunk(
  "stats/getStats",
  async (data, { dispatch }) => {
    try {
      const res = await BackendInstance.get(`stats`, { params: data });
      console.log("res is ", res.data);
      dispatch(getStatsSuccess(res.data.data));
      return true;
    } catch (err) {
      console.log("error occurred ", err);
      return false;
    }
  }
);

export const postStats = createAsyncThunk(
  "stats/getStats",
  async (param, { dispatch }) => {
    console.log("get stast called", param);
    const data = JSON.stringify(param);
    try {
      const res = await BackendInstance.post(`stats`, {
        stats: data,
      });

      return true;
    } catch (err) {
      console.log("error occurred ", err);
      return false;
    }
  }
);

export const updateStats = createAsyncThunk(
  "stats/updateStats",
  async (data, { dispatch }) => {
    try {
      const res = await BackendInstance.patch(`stats`, data);

      console.log("stats updated", res.data.data);

      dispatch(updateStatsSuccess(res.data.data));

      // dispatch(getLogsSuccess(res.data.data));
      return true;
    } catch (err) {
      console.log("error occurred ", err);
      return false;
    }
  }
);

export const deleteTable = createAsyncThunk(
  "stats/updateStats",
  async (data, { dispatch }) => {
    try {
      const res = await BackendInstance.delete(`stats/table`);

      console.log("stats updated", res.data.data);

      dispatch(deleteTableSuccess());

      // dispatch(getLogsSuccess(res.data.data));
      return true;
    } catch (err) {
      console.log("error occurred ", err);
      return false;
    }
  }
);

export const deleteRow = createAsyncThunk(
  "stats/updateStats",
  async (id: string, { dispatch }) => {
    try {
      const res = await BackendInstance.delete(`stats`, { params: { id } });
      dispatch(deleteRowSuccess(id));
      return true;
    } catch (err) {
      console.log("error occurred ", err);
      return false;
    }
  }
);

export const uploadVideo = createAsyncThunk(
  "stats/updateStats",
  async (data, { dispatch }) => {
    try {
      const res = await BackendInstance.post(`stats/upload-video`, data);
      return true;
    } catch (err) {
      console.log("error occurred ", err);
      return false;
    }
  }
);
