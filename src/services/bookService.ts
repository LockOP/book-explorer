import axios from "axios";
import { Book, BookSearchResponse, SortOption } from "../types";

const BASE_URL = "https://openlibrary.org";

export interface SearchParams {
  query: string;
  offset?: number;
  limit?: number;
  sort?: SortOption;
}

export const searchBooks = async (
  params: SearchParams
): Promise<BookSearchResponse> => {
  try {
    const query = params.query.trim() || "type:work";
    const sort = params.sort || "rating desc";

    const response = await axios.get(`${BASE_URL}/search.json`, {
      params: {
        q: query,
        offset: params.offset || 0,
        limit: params.limit || 20,
        sort: sort,
        fields:
          "key,title,author_name,author_key,cover_i,first_publish_year,publisher,isbn,number_of_pages_median,subject,description",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching books from Open Library API:", error);

    return {
      numFound: 0,
      start: 0,
      docs: [],
    };
  }
};

export const getBookDetails = async (bookId: string): Promise<Book | null> => {
  try {
    const response = await axios.get(`${BASE_URL}/works/${bookId}.json`);
    return response.data;
  } catch (error) {
    console.error("Error fetching book details from Open Library API:", error);
    return null;
  }
};

export const getCoverImageUrl = (
  coverId: number,
  size: "S" | "M" | "L" = "M"
): string => {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

export const getDefaultCoverUrl = (): string => {
  const svg = `<svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" fill="#f1f5f9"></rect>
    <path fill-rule="evenodd" clip-rule="evenodd" d="M33.2503 38.4816C33.2603 37.0472 34.4199 35.8864 35.8543 35.875H83.1463C84.5848 35.875 85.7503 37.0431 85.7503 38.4816V80.5184C85.7403 81.9528 84.5807 83.1136 83.1463 83.125H35.8543C34.4158 83.1236 33.2503 81.957 33.2503 80.5184V38.4816ZM80.5006 41.1251H38.5006V77.8751L62.8921 53.4783C63.9172 52.4536 65.5788 52.4536 66.6039 53.4783L80.5006 67.4013V41.1251ZM43.75 51.6249C43.75 54.5244 46.1005 56.8749 49 56.8749C51.8995 56.8749 54.25 54.5244 54.25 51.6249C54.25 48.7254 51.8995 46.3749 49 46.3749C46.1005 46.3749 43.75 48.7254 43.75 51.6249Z" fill="#64748b"></path>
  </svg>`;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
};
