import axios from "axios";

export const fetchRelatedWords = async (sentence: string) => {
  try {
    const result = await axios.post(
      "http://13.231.97.140",
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
