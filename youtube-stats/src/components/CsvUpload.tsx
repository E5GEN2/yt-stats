import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { useAppDispatch } from "../appRedux/reducers/store";
import { useSelector } from "react-redux";
import { StatsSelector } from "../appRedux/reducers";
import { uploadBulkVideo } from "../appRedux/actions/statsActions";

interface CsvRow {
  videoUrl: string;
  title: string;
  description: string;
}

const CsvUpload: React.FC = () => {
  const [data, setData] = useState<CsvRow[]>([]);
  const dispatch = useAppDispatch();
  const { stats } = useSelector(StatsSelector);

  const [bulkUploadLoading, setBulkUploadLoading] = useState(false);

  const handleFileUpload = (file: File) => {
    // Ensure the file is a CSV
    console.log("file type ", file.type);
    // if (file.type !== "text/csv") {
    //   message.error("Only CSV files are allowed!");
    //   return;
    // }

    Papa.parse(file, {
      complete: (result) => {
        const parsedData = result.data;
        // Format the parsed data and map it to your CsvRow structure
        const formattedData: CsvRow[] = parsedData.slice(1).map((row: any) => ({
          videoUrl: row[0],
          title: row[1],
          description: row[2],
        }));
        setData(formattedData);
        message.success(`${formattedData.length} videos parsed successfully`);
      },
      header: false,
      skipEmptyLines: true,
    });

    return false; // Prevent automatic upload
  };

  return (
    <>
      <Upload beforeUpload={handleFileUpload} showUploadList={false}>
        <Button icon={<UploadOutlined />}>Upload CSV</Button>
      </Upload>

      <Button
        disabled={data.length === 0}
        loading={bulkUploadLoading}
        onClick={async () => {
          setBulkUploadLoading(true);
          const d = data.map((v, idx) => {
            return {
              ...v,
              stat: stats && stats[idx],
            };
          });
          await dispatch(uploadBulkVideo(d));

          setData([]);
          setBulkUploadLoading(false);
        }}
      >{`Mass Upload`}</Button>
    </>
  );
};

export default CsvUpload;
