import {
  Button,
  Col,
  Input,
  Modal,
  Row,
  Skeleton,
  Space,
  Table,
  message,
} from "antd";
import ImportFile from "./components/FileUpload";
import { useEffect, useRef, useState } from "react";
import {
  deleteRow,
  deleteTable,
  getStats,
  updateStats,
  uploadVideo,
} from "./appRedux/actions/statsActions";
import { useAppDispatch } from "./appRedux/reducers/store";
import { useSelector } from "react-redux";
import { StatsSelector } from "./appRedux/reducers";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const columns = [
  {
    title: "Email",
    dataIndex: "email",
  },
  {
    title: "Password",
    dataIndex: "password",
  },
  {
    title: "Recovery Email",
    dataIndex: "recoveryEmail",
  },
  {
    title: "Recovery Password",
    dataIndex: "recoveryPassword",
  },
  {
    title: "Channel Link",
    dataIndex: "channelLink",
  },
  {
    title: "Airtalbes Token",
    dataIndex: "airtableToken",
  },
  {
    title: "Airtalbes Link",
    dataIndex: "airtableLink",
  },

  {
    title: "Views",
    dataIndex: "views",
  },
  {
    title: "Subscribers",
    dataIndex: "subs",
  },
  {
    title: "Videos",
    dataIndex: "videos",
  },
  {
    title: "Action",
    dataIndex: "action",
  },
];

function App() {
  const [apiKey, setApiKey] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);

  const { stats: apiStats, total } = useSelector(StatsSelector);

  const [videoLink, setVideoLink] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const defaultCurrent = 1;
  const defaultPageSize = 6;

  const [pageData, setPageData] = useState({
    current: defaultCurrent,
    pageSize: defaultPageSize,
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    fetchStats();
  }, [pageData]);

  const [pageSize, setPageSize] = useState(2);

  const [loading, setLoading] = useState(false);

  const inputRef = useRef(null);

  /**
   *  Fetch logs
   */
  const fetchStats = async () => {
    setFetchLoading(true);
    await dispatch(
      getStats({
        page: Number(pageData.current),
        limit: Number(pageData.pageSize),
      })
    );
    setFetchLoading(false);
  };

  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteTableLoading, setDeleteTableLoading] = useState(false);

  const prepareStatsData =
    (apiStats &&
      apiStats.map((a, idx) => {
        return {
          ...a,
          action: (
            <Space>
              <Button
                loading={updateLoading}
                onClick={async () => {
                  if (!apiKey) {
                    message.error("select api key");

                    return;
                  }
                  setUpdateLoading(true);
                  dispatch(
                    updateStats({
                      apiKey: inputRef.current.input.value,
                      statsToUpdate: [{ ...a }],
                    })
                  );
                  setUpdateLoading(false);
                }}
              >
                Update
              </Button>
              <Button
                onClick={() => {
                  dispatch(deleteRow(a._id));
                }}
              >
                Delete
              </Button>
              <Button
                onClick={() => {
                  Modal.confirm({
                    title: "Upload Video",
                    icon: <ExclamationCircleOutlined />,
                    content: (
                      <>
                        <Row>
                          <Col span={24}>
                            <Input
                              placeholder="Video url"
                              onChange={(e) => setVideoLink(e.target.value)}
                            ></Input>
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder="Video Title"
                              onChange={(e) => setTitle(e.target.value)}
                            ></Input>
                          </Col>
                          <Col span={12}>
                            <Input
                              placeholder="Video Description"
                              onChange={(e) => setDescription(e.target.value)}
                            ></Input>
                          </Col>
                        </Row>
                      </>
                    ),
                    okText: "upload",
                    cancelText: "cancel",
                    onOk: async (...args) => {
                      await dispatch(
                        uploadVideo({
                          videoLink,
                          title,
                          description,
                          statId: a._id,
                        })
                      );
                    },
                  });
                }}
              >
                upload
              </Button>
            </Space>
          ),
        };
      })) ||
    [];

  return (
    <>
      <Input
        ref={inputRef}
        placeholder="Enter api key"
        style={{ maxWidth: "500px" }}
        value={apiKey}
        onChange={(e) => {
          setApiKey(e.target.value);
        }}
      />

      <ImportFile apiKey={apiKey} />
      <Button
        disabled={apiKey.length === 0}
        onClick={async () => {
          setLoading(true);
          await dispatch(
            updateStats({
              apiKey: inputRef.current.input.value,
              statsToUpdate: apiStats,
            })
          );
          setLoading(false);
        }}
        loading={loading}
      >
        Update All
      </Button>

      <Button
        onClick={async () => {
          setDeleteTableLoading(true);
          await dispatch(deleteTable());
          setDeleteTableLoading(false);
        }}
        loading={deleteTableLoading}
      >
        Delete All
      </Button>

      {fetchLoading ? (
        <Skeleton />
      ) : (
        <Table
          dataSource={prepareStatsData}
          columns={columns}
          pagination={{
            current: pageData?.current,
            defaultPageSize: defaultPageSize,
            showSizeChanger: true,
            total: total,
            position: ["bottomCenter"],
            // eslint-disable-next-line no-magic-numbers
            pageSizeOptions: [2, 6, 10, 20, 50],
            pageSize: pageData.pageSize,
          }}
          onChange={setPageData}
        />
      )}
    </>
  );
}

export default App;
