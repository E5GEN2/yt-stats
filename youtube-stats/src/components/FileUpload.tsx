import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Upload, Button, message, Input, Space } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";
import { useAppDispatch } from "../appRedux/reducers/store";
import { getStats, postStats } from "../appRedux/actions/statsActions";

interface ChannelInfo {
  email: string;
  password: string;
  recoveryEmail: string;
  recoveryPassword: string;
  channelLink: string;
  airtableToken: string;
  airtableLink: string;
  action: ReactNode;
  views: string;
  subs: string;
  videos: string;
}

const FileUploader = (props) => {
  const { apiKey } = props;
  const dispatch = useAppDispatch();
  // Function to check if the uploaded file is a text file
  const beforeUpload = (file) => {
    const isTxt = file.type === "text/plain";
    if (!isTxt) {
      message.error("You can only upload text files!");
    }
    return isTxt || Upload.LIST_IGNORE; // Only proceed if the file is a text file
  };

  // Function to handle the file upload and reading
  const handleUpload = async (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target.result;
      const lines = fileContent
        ?.split("\n")
        .map((line) => line.trim())
        .filter((line) => line !== "");

      console.log("lines are ", lines);

      const parsedData: ChannelInfo[] = lines.map((line, idx) => {
        const [email, password, recoveryEmail, recoveryPassword, ...rest] = line
          .split(":")
          .map((item) => item.trim());

        const channelLink = `${rest[0]}:${rest[1]}`;
        const airtableToken = rest[2];
        const airtableLink = `${rest[3]}:${rest[4]}`;

        // Rejoin the rest of the array elements as a string

        return {
          apiKey: apiKey,
          key: idx,
          email: email || "",
          password: password || "",
          recoveryEmail: recoveryEmail || "",
          recoveryPassword: recoveryPassword || "",
          channelLink: channelLink || "",
          airtableToken: airtableToken || "",
          airtableLink: airtableLink || "",
        };
      });

      let apiData = parsedData.map((p) => {
        const { action, ...rest } = p;
        return { ...p };
      });

      dispatch(postStats(apiData)).then(() => {
        dispatch(getStats());
      });
    };
    reader.readAsText(file); // Reads the file as text
  };

  return (
    <>
      <Space>
        <Upload
          beforeUpload={beforeUpload}
          customRequest={({ file, onSuccess }) => {
            handleUpload(file);
            // onSuccess("ok"); // Mock successful upload
          }}
          showUploadList={false} // Hide the file list to prevent clutter
        >
          <Button icon={<UploadOutlined />}>Upload Text File</Button>
        </Upload>
      </Space>
    </>
  );
};

export default FileUploader;
