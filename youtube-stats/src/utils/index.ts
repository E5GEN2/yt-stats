import axios from "axios";

export const getUserNameFromUrl = (url) => {
  // Check if the URL contains "/channel/"
  if (url.includes("/channel/")) {
    // Split the URL at "/channel/" and take the part after it
    const channelId = url.split("/channel/")[1];
    const finalChannelId = channelId.split("?")[0]; // Remove any query parameters if present

    return {
      isChannelId: true,
      username: finalChannelId,
    };
  }

  // If the URL contains '@', extract the username after '@'
  if (url.includes("@")) {
    const usernamePart = url.split("@")[1];
    const username = usernamePart.split("?")[0]; // Remove any query parameters if present

    return {
      isChannelid: false,
      username,
    };
  }

  // Return null or a default value if the URL does not match expected patterns
  return null;
};

export const getChannelId = async (username, apiKey) => {
  try {
    let params = {
      part: "snippet",
      q: username,
      type: "channel",
      key: apiKey,
    };

    let res = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: params,
    });

    if (res?.data?.items?.length > 1) {
      return "NONE";
    }

    let channelId = res.data.items[0]?.id?.channelId;

    return channelId;
  } catch (error) {
    return "NONE";
  }
};

export const getChannelIdFromUsername = async (
  usernames: Array<{ isChannelId: boolean; username: string }>,
  apiKey: string
) => {
  console.log("api key is ", apiKey);
  const channelIds: string[] = [];

  for (const data of usernames) {
    if (data?.isChannelId) {
      channelIds.push(data.username);
    } else {
      try {
        // here i will find channel id
        const channelId = await getChannelId(data.username, apiKey);
        channelIds.push(channelId);
      } catch (error) {
        return undefined;
      }
      // make api call to get channelId
    }
  }

  return channelIds;
};

export const getStatsCount = async (channelIds, apiKey) => {
  const ids = channelIds.join(",");
  const params = {
    part: "statistics", // this will query us the stats of the channel
    id: ids,
    key: apiKey,
  };

  // here make api call to fetch all the data

  try {
    let statisticsData = await axios.get(
      `https://www.googleapis.com/youtube/v3/channels`,
      {
        params: params,
      }
    );

    let stats = statisticsData.data?.items;

    return stats;
  } catch (error) {
    return undefined;
  }
};

export const findAllIndexes = (arr, element) => {
  return arr.reduce((indexes, currentElement, index) => {
    if (currentElement === element) {
      indexes.push(index);
    }
    return indexes;
  }, []);
};
