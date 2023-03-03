import axios from "axios";

export const fetchRelatedWords = async (sentence: string) => {
  try {
    const result = await axios.post(
      "http://13.231.197.15",
      {
        sentence,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result.data;
  } catch (e) {
    return {};
  }
};
